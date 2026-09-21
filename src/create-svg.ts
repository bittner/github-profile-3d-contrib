import * as d3 from 'd3';
import { JSDOM } from 'jsdom';
import * as contrib from './create-3d-contrib';
import * as pie from './create-pie-language';
import * as radar from './create-radar-contrib';
import * as colors from './create-css-colors';
import * as util from './utils';
import * as type from './type';

const width = 1280;
const height = 850;

const pieHeight = 200 * 1.3;
const pieWidth = pieHeight * 2;

const radarWidth = 400 * 1.3;
const radarHeight = (radarWidth * 3) / 4;
const radarX = width - radarWidth - 40;

const githubSwatchClass = (settings: type.FullSettings): string => {
    switch (settings.type) {
        case 'normal':
            return 'cont-top-4';
        case 'season':
            return 'cont-top-p14-4';
        case 'rainbow':
            return 'rb-l4-top';
        case 'bitmap':
            return 'cont-top-bg-4';
    }
};

const LEGEND_FONT_SIZE = 14;
const LEGEND_SWATCH = 14;
const LEGEND_GAP = 6;
const LEGEND_SPACING = 18;
/** rough average glyph width, jsdom cannot measure text */
const LEGEND_GLYPH_WIDTH = LEGEND_FONT_SIZE * 0.55;

/** Draw a right-aligned row of swatches naming every contribution source. */
const createSourceLegend = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    userInfo: type.UserInfo,
    right: number,
    y: number,
    settings: type.FullSettings,
): void => {
    if (
        userInfo.externalSources.length === 0 ||
        settings.sourceLegend === false
    ) {
        return;
    }
    const entries = [
        { label: 'GitHub', cssClass: githubSwatchClass(settings) },
        ...userInfo.externalSources.map((source, i) => ({
            label: source.name,
            cssClass: `src-top-${i}`,
        })),
    ];
    const itemWidth = (label: string): number =>
        LEGEND_SWATCH + LEGEND_GAP + label.length * LEGEND_GLYPH_WIDTH;
    const total =
        entries.map((e) => itemWidth(e.label)).reduce((a, b) => a + b, 0) +
        (entries.length - 1) * LEGEND_SPACING;

    const legend = svg.append('g');
    let x = right - total;
    for (const entry of entries) {
        legend
            .append('rect')
            .attr('x', util.toFixed(x))
            .attr('y', y)
            .attr('width', LEGEND_SWATCH)
            .attr('height', LEGEND_SWATCH)
            .attr('rx', 2)
            .attr('class', entry.cssClass);
        legend
            .append('text')
            .style('font-size', `${LEGEND_FONT_SIZE}px`)
            .attr('x', util.toFixed(x + LEGEND_SWATCH + LEGEND_GAP))
            .attr('y', y + LEGEND_SWATCH / 2)
            .attr('dominant-baseline', 'central')
            .attr('class', 'fill-weak')
            .text(entry.label);
        x += itemWidth(entry.label) + LEGEND_SPACING;
    }
};

export const createSvg = (
    userInfo: type.UserInfo,
    settings: type.Settings,
    isForcedAnimation: boolean,
): string => {
    let svgWidth = width;
    let svgHeight = height;
    if (settings.type === 'pie_lang_only') {
        svgWidth = pieWidth;
        svgHeight = pieHeight;
    } else if (settings.type === 'radar_contrib_only') {
        svgWidth = radarWidth;
        svgHeight = radarHeight;
    }

    const fakeDom = new JSDOM(
        '<!DOCTYPE html><html><body><div class="container"></div></body></html>',
    );
    const container = d3.select(fakeDom.window.document).select('.container');
    const svg = container
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    svg.append('style').html(
        [
            '* { font-family: "Ubuntu", "Helvetica", "Arial", sans-serif; }',
            colors.createCssColors(settings, userInfo.externalSources),
        ].join('\n'),
    );

    contrib.addDefines(svg, settings);

    // background
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .attr('class', 'fill-bg');

    if (settings.type === 'pie_lang_only') {
        // pie chart only
        pie.createPieLanguage(
            svg,
            userInfo,
            0,
            0,
            pieWidth,
            pieHeight,
            settings,
            isForcedAnimation,
        );
    } else if (settings.type === 'radar_contrib_only') {
        // radar chart only
        radar.createRadarContrib(
            svg,
            userInfo,
            0,
            0,
            radarWidth,
            radarHeight,
            settings,
            isForcedAnimation,
        );
    } else {
        // 3D-Contrib Calendar
        contrib.create3DContrib(
            svg,
            userInfo,
            0,
            0,
            width,
            height,
            settings,
            isForcedAnimation,
        );

        // radar chart
        radar.createRadarContrib(
            svg,
            userInfo,
            radarX,
            70,
            radarWidth,
            radarHeight,
            settings,
            isForcedAnimation,
        );

        // pie chart
        pie.createPieLanguage(
            svg,
            userInfo,
            40,
            height - pieHeight - 70,
            pieWidth,
            pieHeight,
            settings,
            isForcedAnimation,
        );

        const group = svg.append('g');

        const positionXContrib = (width * 3) / 10;
        const positionYContrib = height - 20;

        group
            .append('text')
            .style('font-size', '32px')
            .style('font-weight', 'bold')
            .attr('x', positionXContrib)
            .attr('y', positionYContrib)
            .attr('text-anchor', 'end')
            .text(util.inertThousandSeparator(userInfo.totalContributions))
            .attr('class', 'fill-strong');

        const contribLabel = settings.l10n
            ? settings.l10n.contrib
            : 'contributions';
        group
            .append('text')
            .style('font-size', '24px')
            .attr('x', positionXContrib + 10)
            .attr('y', positionYContrib)
            .attr('text-anchor', 'start')
            .attr('text-anchor', 'start')
            .text(contribLabel)
            .attr('class', 'fill-fg');

        const positionXStar = (width * 5) / 10;
        const positionYStar = positionYContrib;

        // icon of star
        group
            .append('g')
            .attr(
                'transform',
                `translate(${positionXStar - 32}, ${
                    positionYStar - 28
                }), scale(2)`,
            )
            .append('path')
            .attr('fill-rule', 'evenodd')
            .attr(
                'd',
                'M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z',
            )
            .attr('class', 'fill-fg');

        group
            .append('text')
            .style('font-size', '32px')
            .style('font-weight', 'bold')
            .attr('x', positionXStar + 10)
            .attr('y', positionYStar)
            .attr('text-anchor', 'start')
            .text(util.toScale(userInfo.totalStargazerCount))
            .attr('class', 'fill-fg')
            .append('title')
            .text(userInfo.totalStargazerCount);

        const positionXFork = (width * 6) / 10;
        const positionYFork = positionYContrib;

        // icon of fork
        group
            .append('g')
            .attr(
                'transform',
                `translate(${positionXFork - 32}, ${
                    positionYFork - 28
                }), scale(2)`,
            )
            .append('path')
            .attr('fill-rule', 'evenodd')
            .attr(
                'd',
                'M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z',
            )
            .attr('class', 'fill-fg');

        group
            .append('text')
            .style('font-size', '32px')
            .style('font-weight', 'bold')
            .attr('x', positionXFork + 4)
            .attr('y', positionYFork)
            .attr('text-anchor', 'start')
            .text(util.toScale(userInfo.totalForkCount))
            .attr('class', 'fill-fg')
            .append('title')
            .text(userInfo.totalForkCount);

        // ISO 8601 format
        const startDate = userInfo.contributionCalendar[0].date;
        const endDate =
            userInfo.contributionCalendar[
                userInfo.contributionCalendar.length - 1
            ].date;
        const period = `${util.toIsoDate(startDate)} / ${util.toIsoDate(
            endDate,
        )}`;

        group
            .append('text')
            .style('font-size', '16px')
            .attr('x', width - 20)
            .attr('y', 20)
            .attr('dominant-baseline', 'hanging')
            .attr('text-anchor', 'end')
            .text(period)
            .attr('class', 'fill-weak');

        createSourceLegend(svg, userInfo, width - 20, 44, settings);
    }
    return container.html();
};
