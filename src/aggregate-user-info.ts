import * as client from './github-graphql';
import * as external from './external-sources';
import * as type from './type';

const OTHER_COLOR = '#444444';

const toNumberContributionLevel = (level: type.ContributionLevel): number => {
    switch (level) {
        case 'NONE':
            return 0;
        case 'FIRST_QUARTILE':
            return 1;
        case 'SECOND_QUARTILE':
            return 2;
        case 'THIRD_QUARTILE':
            return 3;
        case 'FOURTH_QUARTILE':
            return 4;
    }
};

const compare = (num1: number, num2: number): number => {
    if (num1 < num2) {
        return -1;
    } else if (num1 > num2) {
        return 1;
    } else {
        return 0;
    }
};

const externalContributionsOn = (
    date: string,
    externals: Array<external.ExternalContributions>,
): Array<type.ExternalContribution> =>
    externals
        .map((ext, index) => ({
            source: index,
            contributionCount: ext.days.get(date) || 0,
        }))
        .filter((contrib) => contrib.contributionCount > 0);

const sum = (values: Array<number>): number =>
    values.reduce((num1, num2) => num1 + num2, 0);

export const aggregateUserInfo = (
    response: client.ResponseType,
    externals: Array<external.ExternalContributions> = [],
): type.UserInfo => {
    if (!response.data) {
        if (response.errors && response.errors.length) {
            throw new Error(response.errors[0].message);
        } else {
            throw new Error('JSON\n' + JSON.stringify(response, null, 2));
        }
    }

    const user = response.data.user;
    const calendar = user.contributionsCollection.contributionCalendar.weeks
        .flatMap((week) => week.contributionDays)
        .map((day) => {
            const externalContributions = externalContributionsOn(
                day.date.substring(0, 10),
                externals,
            );
            return {
                contributionCount:
                    day.contributionCount +
                    sum(externalContributions.map((c) => c.contributionCount)),
                contributionLevel: toNumberContributionLevel(
                    day.contributionLevel,
                ),
                date: new Date(day.date),
                externalContributions,
            };
        });
    const externalTotal = sum(
        calendar.flatMap((day) =>
            day.externalContributions.map((c) => c.contributionCount),
        ),
    );
    const contributesLanguage: { [language: string]: type.LangInfo } = {};
    user.contributionsCollection.commitContributionsByRepository
        .filter((repo) => repo.repository.primaryLanguage)
        .forEach((repo) => {
            const language = repo.repository.primaryLanguage?.name || '';
            const color = repo.repository.primaryLanguage?.color || OTHER_COLOR;
            const contributions = repo.contributions.totalCount;

            const info = contributesLanguage[language];
            if (info) {
                info.contributions += contributions;
            } else {
                contributesLanguage[language] = {
                    language: language,
                    color: color,
                    contributions: contributions,
                };
            }
        });
    const languages: Array<type.LangInfo> = Object.values(
        contributesLanguage,
    ).sort((obj1, obj2) => -compare(obj1.contributions, obj2.contributions));

    const totalForkCount = user.repositories.nodes
        .map((node) => node.forkCount)
        .reduce((num1, num2) => num1 + num2, 0);
    const totalStargazerCount = user.repositories.nodes
        .map((node) => node.stargazerCount)
        .reduce((num1, num2) => num1 + num2, 0);
    const userInfo: type.UserInfo = {
        isHalloween:
            user.contributionsCollection.contributionCalendar.isHalloween,
        contributionCalendar: calendar,
        externalSources: externals.map((ext, index) => ({
            name: ext.source.name,
            color: external.sourceColor(ext.source, index),
            darkColor: external.sourceDarkColor(ext.source, index),
        })),
        contributesLanguage: languages,
        totalContributions:
            user.contributionsCollection.contributionCalendar
                .totalContributions + externalTotal,
        totalCommitContributions:
            user.contributionsCollection.totalCommitContributions,
        totalIssueContributions:
            user.contributionsCollection.totalIssueContributions,
        totalPullRequestContributions:
            user.contributionsCollection.totalPullRequestContributions,
        totalPullRequestReviewContributions:
            user.contributionsCollection.totalPullRequestReviewContributions,
        totalRepositoryContributions:
            user.contributionsCollection.totalRepositoryContributions,
        totalForkCount: totalForkCount,
        totalStargazerCount: totalStargazerCount,
    };
    return userInfo;
};
