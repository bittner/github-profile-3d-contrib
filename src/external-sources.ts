import axios from 'axios';
import * as type from './type';

export const PALETTE = ['#fc6d26', '#813d9c', '#2185d0', '#e6b422'];

/** daily contribution counts keyed by ISO date ("YYYY-MM-DD") */
export type DailyCounts = Map<string, number>;

export interface ExternalContributions {
    source: type.ExternalSource;
    days: DailyCounts;
}

const isSourceType = (value: unknown): value is type.ExternalSourceType =>
    value === 'gitlab' || value === 'forgejo';

const validate = (value: unknown, index: number): type.ExternalSource => {
    const obj = (value ?? {}) as Record<string, unknown>;
    const { name, type: sourceType, url, user, color, darkColor } = obj;
    if (typeof name !== 'string' || !name) {
        throw new Error(`EXTERNAL_SOURCES[${index}]: "name" is required`);
    }
    if (!isSourceType(sourceType)) {
        throw new Error(
            `EXTERNAL_SOURCES[${index}]: "type" must be "gitlab" or "forgejo"`,
        );
    }
    if (typeof url !== 'string' || !/^https?:\/\//.test(url)) {
        throw new Error(`EXTERNAL_SOURCES[${index}]: "url" must be a URL`);
    }
    if (typeof user !== 'string' || !user) {
        throw new Error(`EXTERNAL_SOURCES[${index}]: "user" is required`);
    }
    for (const [key, value] of Object.entries({ color, darkColor })) {
        if (value !== undefined && typeof value !== 'string') {
            throw new Error(
                `EXTERNAL_SOURCES[${index}]: "${key}" must be a string`,
            );
        }
    }
    return {
        name,
        type: sourceType,
        url: url.replace(/\/+$/, ''),
        user,
        color: color as string | undefined,
        darkColor: darkColor as string | undefined,
    };
};

/** Parse the `EXTERNAL_SOURCES` environment variable (a JSON array). */
export const parseExternalSources = (
    json: string | undefined,
): Array<type.ExternalSource> => {
    if (!json || !json.trim()) {
        return [];
    }
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) {
        throw new Error('EXTERNAL_SOURCES must be a JSON array');
    }
    return parsed.map(validate);
};

export const sourceColor = (
    source: type.ExternalSource,
    index: number,
): string => source.color || PALETTE[index % PALETTE.length];

export const sourceDarkColor = (
    source: type.ExternalSource,
    index: number,
): string => source.darkColor || sourceColor(source, index);

const toIsoDate = (epochSeconds: number): string =>
    new Date(epochSeconds * 1000).toISOString().substring(0, 10);

/** GitLab: `/users/<user>/calendar.json` -> `{ "YYYY-MM-DD": count }` */
const fetchGitLab = async (
    source: type.ExternalSource,
): Promise<DailyCounts> => {
    const url = `${source.url}/users/${source.user}/calendar.json`;
    const response = await axios.get<Record<string, number>>(url, {
        headers: { Accept: 'application/json' },
    });
    return new Map(
        Object.entries(response.data).map(([date, count]) => [
            date,
            Number(count),
        ]),
    );
};

/** Forgejo/Gitea: `/api/v1/users/<user>/heatmap` -> `[{ timestamp, contributions }]` */
const fetchForgejo = async (
    source: type.ExternalSource,
): Promise<DailyCounts> => {
    const url = `${source.url}/api/v1/users/${source.user}/heatmap`;
    const response = await axios.get<
        Array<{ timestamp: number; contributions: number }>
    >(url, { headers: { Accept: 'application/json' } });
    const days: DailyCounts = new Map();
    for (const entry of response.data) {
        const date = toIsoDate(entry.timestamp);
        days.set(date, (days.get(date) || 0) + Number(entry.contributions));
    }
    return days;
};

export const fetchDailyCounts = (
    source: type.ExternalSource,
): Promise<DailyCounts> =>
    source.type === 'gitlab' ? fetchGitLab(source) : fetchForgejo(source);

export const fetchExternalContributions = async (
    sources: Array<type.ExternalSource>,
): Promise<Array<ExternalContributions>> =>
    Promise.all(
        sources.map(async (source) => ({
            source,
            days: await fetchDailyCounts(source),
        })),
    );
