import { toSegments } from '../src/bar-segments';
import * as type from '../src/type';

const day = (
    github: number,
    externals: Array<number>,
): type.CalendarInfo => ({
    contributionCount:
        github + externals.reduce((num1, num2) => num1 + num2, 0),
    contributionLevel: 1,
    date: new Date('2026-09-22T00:00:00Z'),
    externalContributions: externals.map((contributionCount, source) => ({
        source,
        contributionCount,
    })),
});

describe('bar-segments', () => {
    it('puts the largest count at the bottom', () => {
        const segments = toSegments(day(2, [7, 4]));
        expect(segments.map((s) => s.source)).toEqual([0, 1, null]);
    });

    it('keeps GitHub below an external source of equal size', () => {
        const segments = toSegments(day(5, [5]));
        expect(segments.map((s) => s.source)).toEqual([null, 0]);
    });

    it('skips empty sources and stacks segments without gaps', () => {
        const segments = toSegments(day(0, [3, 0]));
        expect(segments.map((s) => s.source)).toEqual([0]);
        expect(segments[0].bottom).toEqual(0);
    });

    it('draws a single flat GitHub segment for an empty day', () => {
        const segments = toSegments(day(0, []));
        expect(segments).toEqual([{ bottom: 0, top: 3, source: null }]);
    });

    it('stacks each segment on the previous one', () => {
        const segments = toSegments(day(1, [10, 3]));
        expect(segments[1].bottom).toEqual(segments[0].top);
        expect(segments[2].bottom).toEqual(segments[1].top);
        expect(segments[2].top).toBeGreaterThan(segments[1].top);
    });
});
