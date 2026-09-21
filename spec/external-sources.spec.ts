import * as external from '../src/external-sources';
import * as aggregate from '../src/aggregate-user-info';
import { toSegments } from '../src/bar-segments';
import { dummyData } from './dummy-data';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
const mock = new MockAdapter(axios);

afterEach(() => {
    mock.reset();
});

const gitlab = {
    name: 'gitlab.com',
    type: 'gitlab' as const,
    url: 'https://gitlab.com/',
    user: 'someone',
};
const forgejo = {
    name: 'codeberg.org',
    type: 'forgejo' as const,
    url: 'https://codeberg.org',
    user: 'someone',
    color: '#123456',
    darkColor: '#abcdef',
};

describe('parseExternalSources', () => {
    it('returns nothing for an unset variable', () => {
        expect(external.parseExternalSources(undefined)).toEqual([]);
        expect(external.parseExternalSources('  ')).toEqual([]);
    });

    it('parses and normalises sources', () => {
        const sources = external.parseExternalSources(
            JSON.stringify([gitlab, forgejo]),
        );
        expect(sources).toEqual([
            {
                ...gitlab,
                url: 'https://gitlab.com',
                color: undefined,
                darkColor: undefined,
            },
            forgejo,
        ]);
    });

    it('rejects malformed sources', () => {
        expect(() => external.parseExternalSources('{}')).toThrow('array');
        expect(() =>
            external.parseExternalSources('[{"name":"x","type":"svn"}]'),
        ).toThrow('"type"');
        expect(() =>
            external.parseExternalSources(
                '[{"name":"x","type":"gitlab","url":"ftp://x","user":"u"}]',
            ),
        ).toThrow('"url"');
    });
});

describe('sourceColor', () => {
    it('prefers the configured colour and falls back to the palette', () => {
        expect(external.sourceColor(forgejo, 0)).toEqual('#123456');
        expect(external.sourceColor(gitlab, 1)).toEqual(external.PALETTE[1]);
        expect(external.sourceDarkColor(forgejo, 0)).toEqual('#abcdef');
        expect(external.sourceDarkColor(gitlab, 1)).toEqual(
            external.PALETTE[1],
        );
    });
});

describe('fetchDailyCounts', () => {
    it('reads a GitLab calendar', async () => {
        mock.onGet('https://gitlab.com/users/someone/calendar.json').reply(
            200,
            { '2024-01-02': 3, '2024-01-05': 1 },
        );
        const days = await external.fetchDailyCounts({
            ...gitlab,
            url: 'https://gitlab.com',
        });
        expect([...days.entries()]).toEqual([
            ['2024-01-02', 3],
            ['2024-01-05', 1],
        ]);
    });

    it('sums a Forgejo heatmap per UTC day', async () => {
        mock.onGet('https://codeberg.org/api/v1/users/someone/heatmap').reply(
            200,
            [
                { timestamp: Date.UTC(2024, 0, 2, 8) / 1000, contributions: 2 },
                {
                    timestamp: Date.UTC(2024, 0, 2, 20) / 1000,
                    contributions: 5,
                },
                { timestamp: Date.UTC(2024, 0, 3, 1) / 1000, contributions: 1 },
            ],
        );
        const days = await external.fetchDailyCounts(forgejo);
        expect([...days.entries()]).toEqual([
            ['2024-01-02', 7],
            ['2024-01-03', 1],
        ]);
    });
});

describe('aggregateUserInfo with external sources', () => {
    const firstDay =
        dummyData.data!.user.contributionsCollection.contributionCalendar
            .weeks[0].contributionDays[0];
    const date = firstDay.date.substring(0, 10);
    const externals = [
        { source: gitlab, days: new Map([[date, 4]]) },
        { source: forgejo, days: new Map([['1999-01-01', 9]]) },
    ];

    it('stacks matching days and adds to the total', () => {
        const userInfo = aggregate.aggregateUserInfo(dummyData, externals);
        const day = userInfo.contributionCalendar[0];
        expect(day.contributionCount).toEqual(firstDay.contributionCount + 4);
        expect(day.externalContributions).toEqual([
            { source: 0, contributionCount: 4 },
        ]);
        expect(userInfo.contributionCalendar[1].externalContributions).toEqual(
            [],
        );
        expect(userInfo.totalContributions).toEqual(366 + 4);
        expect(userInfo.externalSources).toEqual([
            {
                name: 'gitlab.com',
                color: external.PALETTE[0],
                darkColor: external.PALETTE[0],
            },
            { name: 'codeberg.org', color: '#123456', darkColor: '#abcdef' },
        ]);
    });
});

describe('toSegments', () => {
    const day = (count: number, externals: Array<[number, number]>) => ({
        contributionCount: count,
        contributionLevel: count ? 2 : 0,
        date: new Date('2024-01-02T00:00:00.000+00:00'),
        externalContributions: externals.map(([source, contributionCount]) => ({
            source,
            contributionCount,
        })),
    });
    const height = (count: number) => Math.log10(count / 20 + 1) * 144 + 3;

    it('draws an empty day as the 3px stub', () => {
        expect(toSegments(day(0, []))).toEqual([
            { bottom: 0, top: 3, source: null },
        ]);
    });

    it('stacks segments on the cumulative log scale', () => {
        expect(toSegments(day(15, [[0, 5]]))).toEqual([
            { bottom: 0, top: height(10), source: null },
            { bottom: height(10), top: height(15), source: 0 },
        ]);
    });

    it('lets the first external segment start at the ground', () => {
        expect(toSegments(day(7, [[1, 7]]))).toEqual([
            { bottom: 0, top: height(7), source: 1 },
        ]);
    });
});
