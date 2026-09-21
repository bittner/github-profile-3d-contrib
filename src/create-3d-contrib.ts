import * as d3 from 'd3';
import * as util from './utils';
import * as type from './type';
import { Segment, toSegments } from './bar-segments';

const ANGLE = 30;

const toEpochDays = (date: Date): number =>
    Math.floor(date.getTime() / (24 * 60 * 60 * 1000));

type PanelType = 'top' | 'left' | 'right';

const addNormalColor = (
    path: d3.Selection<SVGRectElement, unknown, null, unknown>,
    contribLevel: number,
    panel: PanelType,
): void => {
    path.attr('class', `cont-${panel}-${contribLevel}`);
};

const decideSeasonPatternNo = (date: Date): number => {
    const sunday = new Date(date.getTime());
    sunday.setDate(sunday.getDate() - sunday.getDay());

    const month = sunday.getUTCMonth();
    const dayOfMonth = sunday.getUTCDate();

    const diff =
        dayOfMonth <= 7
            ? 0
            : dayOfMonth <= 14
              ? 1
              : dayOfMonth <= 21
                ? 2
                : dayOfMonth <= 28
                  ? 3
                  : 4;

    switch (month + 1) {
        case 9:
            // summer -> autumn = 0-4
            return 0 + diff;
        case 10:
        case 11:
            // autumn = 4
            return 4;
        case 12:
            // autumn -> winter = 5-9
            return 5 + diff;
        case 1:
        case 2:
            // winter = 9
            return 9;
        case 3:
            // winter -> spring = 10-14
            return 10 + diff;
        case 4:
        case 5:
            // spring = 14
            return 14;
        case 6:
            // spring -> summer = 15-19
            return 15 + diff;
        case 7:
        case 8:
        default:
            // summer = 19
            return 19;
    }
};

const addSeasonColor = (
    path: d3.Selection<SVGRectElement, unknown, null, unknown>,
    contribLevel: number,
    panel: PanelType,
    date: Date,
): void => {
    const pattern = decideSeasonPatternNo(date);
    path.attr('class', `cont-${panel}-p${pattern}-${contribLevel}`);
};

const addRainbowColor = (
    path: d3.Selection<SVGRectElement, unknown, null, unknown>,
    contribLevel: number,
    panel: PanelType,
    settings: type.RainbowColorSettings,
    week: number,
): void => {
    const className = `rb-l${contribLevel}-${panel}`;
    const offsetHue = week * settings.hueRatio;
    const normalizedHue = ((offsetHue % 360) + 360) % 360;
    const durationSeconds = parseFloat(settings.duration);
    const delaySeconds = -(normalizedHue / 360) * durationSeconds;

    path.attr('class', className).attr(
        'style',
        `animation-delay:${delaySeconds.toFixed(3)}s`,
    );
};

const addBitmapPattern = (
    path: d3.Selection<SVGRectElement, unknown, null, unknown>,
    contributionLevel: number,
    panel: PanelType,
): void => {
    path.attr('fill', `url(#pattern_${contributionLevel}_${panel})`);
};

const atan = (value: number) => (Math.atan(value) * 360) / 2 / Math.PI;

const addPatternForBitmap = (
    defs: d3.Selection<SVGDefsElement, unknown, null, unknown>,
    panelPattern: type.PanelPattern,
    contributionLevel: number,
    panel: PanelType,
): void => {
    const width = Math.max(1, panelPattern.width);
    const height = Math.max(1, panelPattern.bitmap.length);
    const pattern = defs
        .append('pattern')
        .attr('id', `pattern_${contributionLevel}_${panel}`)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('patternUnits', 'userSpaceOnUse');
    pattern
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('class', `cont-${panel}-bg-${contributionLevel}`);
    const path = d3.path();
    for (const [y, bitmapValue] of panelPattern.bitmap.entries()) {
        const bitmap =
            typeof bitmapValue === 'string'
                ? parseInt(bitmapValue, 16)
                : bitmapValue;
        for (let x = 0; x < width; x++) {
            if ((bitmap & (1 << (width - x - 1))) !== 0) {
                path.rect(x, y, 1, 1);
            }
        }
    }
    pattern
        .append('path')
        .attr('stroke', 'none')
        .attr('class', `cont-${panel}-fg-${contributionLevel}`)
        .attr('d', path.toString());
};

export const addDefines = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    settings: type.Settings,
): void => {
    if (settings.type === 'bitmap') {
        const defs = svg.append('defs');
        for (const [contribLevel, info] of settings.contribPatterns.entries()) {
            addPatternForBitmap(defs, info.top, contribLevel, 'top');
            addPatternForBitmap(defs, info.left, contribLevel, 'left');
            addPatternForBitmap(defs, info.right, contribLevel, 'right');
        }
    }
};

type RectSelection = d3.Selection<SVGRectElement, unknown, null, unknown>;
type GroupSelection = d3.Selection<SVGGElement, unknown, null, unknown>;

const paintFace = (
    rect: RectSelection,
    panel: PanelType,
    segment: Segment,
    cal: type.CalendarInfo,
    settings: type.FullSettings,
    week: number,
): void => {
    if (segment.source !== null) {
        rect.attr('class', `src-${panel}-${segment.source}`);
    } else if (settings.type === 'normal') {
        addNormalColor(rect, cal.contributionLevel, panel);
    } else if (settings.type === 'season') {
        addSeasonColor(rect, cal.contributionLevel, panel, cal.date);
    } else if (settings.type === 'rainbow') {
        addRainbowColor(rect, cal.contributionLevel, panel, settings, week);
    } else if (settings.type === 'bitmap') {
        addBitmapPattern(rect, cal.contributionLevel, panel);
    }
};

/** Width of the unscaled face rectangle: bitmap patterns need their own unit. */
const faceWidth = (
    panel: PanelType,
    segment: Segment,
    cal: type.CalendarInfo,
    settings: type.FullSettings,
    dxx: number,
): number =>
    settings.type === 'bitmap' && segment.source === null
        ? Math.max(
              1,
              settings.contribPatterns[cal.contributionLevel][panel].width,
          )
        : dxx;

const unique = (values: Array<number>): Array<number> =>
    values
        .map((v) => Math.min(1, Math.max(0, v)))
        .sort((a, b) => a - b)
        .filter((v, i, arr) => i === 0 || v !== arr[i - 1]);

/**
 * Grow a side face together with the rising bar.
 *
 * The bar group rises from 3px to its full height over the animation, so the
 * ground moves down in the group's coordinates. A segment is clipped at the
 * group origin until the bar has risen past its top, which makes `y` and
 * `height` piecewise linear with breakpoints at the segment's bottom and top.
 */
const animateSideFace = (
    rect: RectSelection,
    segment: Segment,
    calHeight: number,
    scale: number,
): void => {
    const rise = calHeight - 3;
    const keyTimes = unique([
        0,
        (segment.bottom - 3) / rise,
        (segment.top - 3) / rise,
        1,
    ]);
    const frames = keyTimes.map((t) => {
        const current = 3 + rise * t;
        const y = Math.max(0, current - segment.top);
        const height =
            current > segment.bottom
                ? Math.min(current, segment.top) - segment.bottom
                : 0;
        return { y: y / scale, height: height / scale };
    });
    const times = keyTimes.map((t) => util.toFixed(t)).join(';');
    rect.append('animate')
        .attr('attributeName', 'y')
        .attr('values', frames.map((f) => util.toFixed(f.y)).join(';'))
        .attr('keyTimes', times)
        .attr('dur', '3s')
        .attr('repeatCount', '1');
    rect.append('animate')
        .attr('attributeName', 'height')
        .attr('values', frames.map((f) => util.toFixed(f.height)).join(';'))
        .attr('keyTimes', times)
        .attr('dur', '3s')
        .attr('repeatCount', '1');
};

const addSideFace = (
    bar: GroupSelection,
    panel: 'left' | 'right',
    segment: Segment,
    calHeight: number,
    width: number,
    dxx: number,
    dyy: number,
    isAnimate: boolean,
): RectSelection => {
    const scale = Math.sqrt(dxx ** 2 + dyy ** 2) / width;
    const position =
        panel === 'left'
            ? `skewY(${ANGLE})`
            : `translate(${util.toFixed(dxx)} ${util.toFixed(
                  dyy,
              )}) skewY(${-ANGLE})`;
    const rect = bar
        .append('rect')
        .attr('stroke', 'none')
        .attr('x', 0)
        .attr('y', util.toFixed((calHeight - segment.top) / scale))
        .attr('width', util.toFixed(width))
        .attr('height', util.toFixed((segment.top - segment.bottom) / scale))
        .attr(
            'transform',
            `${position} scale(${util.toFixed(dxx / width)} ${util.toFixed(
                scale,
            )})`,
        );
    if (isAnimate) {
        animateSideFace(rect, segment, calHeight, scale);
    }
    return rect;
};

const addTopFace = (
    bar: GroupSelection,
    width: number,
    dxx: number,
    dyy: number,
): RectSelection =>
    bar
        .append('rect')
        .attr('stroke', 'none')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', util.toFixed(width))
        .attr('height', util.toFixed(width))
        .attr(
            'transform',
            `skewY(${-ANGLE}) skewX(${util.toFixed(
                atan(dxx / 2 / dyy),
            )}) scale(${util.toFixed(dxx / width)} ${util.toFixed(
                (2 * dyy) / width,
            )})`,
        );

export const create3DContrib = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    userInfo: type.UserInfo,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: type.FullSettings,
    isForcedAnimation = false,
): void => {
    if (userInfo.contributionCalendar.length === 0) {
        return;
    }

    const firstDate = userInfo.contributionCalendar[0].date;
    const sundayOfFirstWeek = toEpochDays(firstDate) - firstDate.getUTCDay();
    const weekcount = Math.ceil(
        (userInfo.contributionCalendar.length + firstDate.getUTCDay()) / 7.0,
    );
    const dx = width / 64;
    const dy = dx * Math.tan(ANGLE * ((2 * Math.PI) / 360));
    const dxx = dx * 0.9;
    const dyy = dy * 0.9;

    const offsetX = dx * 7;
    const offsetY = height - (weekcount + 7) * dy;

    const group = svg.append('g');

    userInfo.contributionCalendar.forEach((cal) => {
        const week = Math.floor(
            (toEpochDays(cal.date) - sundayOfFirstWeek) / 7,
        );
        const dayOfWeek = cal.date.getUTCDay(); // sun = 0, mon = 1, ...

        const baseX = offsetX + (week - dayOfWeek) * dx;
        const baseY = offsetY + (week + dayOfWeek) * dy;
        const segments = toSegments(cal);
        const calHeight = segments[segments.length - 1].top;

        const isAnimate =
            (settings.growingAnimation || isForcedAnimation) &&
            cal.contributionCount > 0;

        const bar = group
            .append('g')
            .attr(
                'transform',
                `translate(${util.toFixed(baseX)} ${util.toFixed(
                    baseY - calHeight,
                )})`,
            );
        if (isAnimate) {
            bar.append('animateTransform')
                .attr('attributeName', 'transform')
                .attr('type', 'translate')
                .attr(
                    'values',
                    `${util.toFixed(baseX)} ${util.toFixed(
                        baseY - 3,
                    )};${util.toFixed(baseX)} ${util.toFixed(
                        baseY - calHeight,
                    )}`,
                )
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }

        const topSegment = segments[segments.length - 1];
        const topPanel = addTopFace(
            bar,
            faceWidth('top', topSegment, cal, settings, dxx),
            dxx,
            dyy,
        );
        paintFace(topPanel, 'top', topSegment, cal, settings, week);

        for (const panel of ['left', 'right'] as const) {
            for (const segment of segments) {
                const face = addSideFace(
                    bar,
                    panel,
                    segment,
                    calHeight,
                    faceWidth(panel, segment, cal, settings, dxx),
                    dxx,
                    dyy,
                    isAnimate,
                );
                paintFace(face, panel, segment, cal, settings, week);
            }
        }
    });
};
