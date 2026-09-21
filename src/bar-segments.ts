import * as type from './type';

export interface Segment {
    /** distance from the ground to the bottom of the segment, in px */
    bottom: number;
    /** distance from the ground to the top of the segment, in px */
    top: number;
    /** null for GitHub, otherwise an index into UserInfo.externalSources */
    source: number | null;
}

// ref. https://github.com/yoshi389111/github-profile-3d-contrib/issues/27
const barHeight = (count: number): number =>
    Math.log10(count / 20 + 1) * 144 + 3;

/** Split a day's bar into stacked segments, GitHub at the bottom. */
export const toSegments = (cal: type.CalendarInfo): Array<Segment> => {
    const externalTotal = cal.externalContributions
        .map((c) => c.contributionCount)
        .reduce((num1, num2) => num1 + num2, 0);
    const parts: Array<[number | null, number]> = [
        [null, cal.contributionCount - externalTotal],
        ...cal.externalContributions.map((c): [number | null, number] => [
            c.source,
            c.contributionCount,
        ]),
    ];
    const segments: Array<Segment> = [];
    let cumulative = 0;
    for (const [source, count] of parts) {
        if (count <= 0) {
            continue;
        }
        cumulative += count;
        const bottom = segments.length ? segments[segments.length - 1].top : 0;
        segments.push({ bottom, top: barHeight(cumulative), source });
    }
    if (segments.length === 0) {
        segments.push({ bottom: 0, top: barHeight(0), source: null });
    }
    return segments;
};
