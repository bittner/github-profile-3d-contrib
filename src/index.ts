import * as aggregate from './aggregate-user-info';
import * as themes from './themes';
import * as create from './create-svg';
import * as f from './file-writer';
import * as r from './settings-reader';
import * as client from './github-graphql';
import * as external from './external-sources';

export const main = async (): Promise<void> => {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            console.error('GITHUB_TOKEN is empty');
            process.exitCode = 1;
            return;
        }
        const userName =
            3 <= process.argv.length ? process.argv[2] : process.env.USERNAME;
        if (!userName) {
            console.error('USERNAME is empty');
            process.exitCode = 1;
            return;
        }
        const maxRepos = process.env.MAX_REPOS
            ? Number(process.env.MAX_REPOS)
            : 100;
        if (Number.isNaN(maxRepos)) {
            console.error('MAX_REPOS is NaN');
            process.exitCode = 1;
            return;
        }
        const year = process.env.YEAR ? Number(process.env.YEAR) : null;
        if (Number.isNaN(year)) {
            console.error('YEAR is NaN');
            process.exitCode = 1;
            return;
        }

        const sources = external.parseExternalSources(
            process.env.EXTERNAL_SOURCES,
        );

        const response = await client.fetchData(
            token,
            userName,
            maxRepos,
            year,
        );
        const externals = await external.fetchExternalContributions(sources);
        const userInfo = aggregate.aggregateUserInfo(response, externals);

        const selected = themes.parseThemes(process.env.THEMES);

        if (process.env.SETTING_JSON) {
            const settingFile = r.readSettingJson(process.env.SETTING_JSON);
            const settingInfos =
                'length' in settingFile ? settingFile : [settingFile];
            for (const settingInfo of settingInfos) {
                const fileName =
                    settingInfo.fileName || 'profile-customize.svg';
                f.writeFile(
                    fileName,
                    create.createSvg(userInfo, settingInfo, false),
                );
            }
        } else {
            for (const theme of selected) {
                f.writeFile(
                    `profile-${theme.name}.svg`,
                    create.createSvg(
                        userInfo,
                        theme.settings(userInfo.isHalloween),
                        theme.animate,
                    ),
                );
            }
        }
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
};

void main();
