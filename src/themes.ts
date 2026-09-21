import * as template from './color-template';
import * as type from './type';

export interface Theme {
    /** output file is `profile-<name>.svg` */
    name: string;
    settings: (isHalloween: boolean) => type.Settings;
    animate: boolean;
}

const green = (isHalloween: boolean): type.Settings =>
    isHalloween ? template.HalloweenSettings : template.NormalSettings;

/** Built-in themes, generated when no `SETTING_JSON` is given. */
export const THEMES: ReadonlyArray<Theme> = [
    { name: 'green-animate', settings: green, animate: true },
    { name: 'green', settings: green, animate: false },
    // Northern hemisphere
    {
        name: 'season-animate',
        settings: () => template.NorthSeasonSettings,
        animate: true,
    },
    {
        name: 'season',
        settings: () => template.NorthSeasonSettings,
        animate: false,
    },
    // Southern hemisphere
    {
        name: 'south-season-animate',
        settings: () => template.SouthSeasonSettings,
        animate: true,
    },
    {
        name: 'south-season',
        settings: () => template.SouthSeasonSettings,
        animate: false,
    },
    {
        name: 'night-view',
        settings: () => template.NightViewSettings,
        animate: true,
    },
    {
        name: 'night-green',
        settings: () => template.NightGreenSettings,
        animate: true,
    },
    {
        name: 'night-rainbow',
        settings: () => template.NightRainbowSettings,
        animate: true,
    },
    {
        name: 'gitblock',
        settings: () => template.GitBlockSettings,
        animate: true,
    },
];

/** Select themes by the comma-separated `THEMES` variable; all by default. */
export const parseThemes = (value: string | undefined): Array<Theme> => {
    const names = (value || '')
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name);
    if (names.length === 0) {
        return [...THEMES];
    }
    return names.map((name) => {
        const theme = THEMES.find((t) => t.name === name);
        if (!theme) {
            const known = THEMES.map((t) => t.name).join(', ');
            throw new Error(
                `THEMES: unknown theme "${name}" (known: ${known})`,
            );
        }
        return theme;
    });
};
