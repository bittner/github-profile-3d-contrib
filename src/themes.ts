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

const BASE_THEMES: ReadonlyArray<
    [string, (isHalloween: boolean) => type.Settings]
> = [
    ['green', green],
    // Northern hemisphere
    ['season', () => template.NorthSeasonSettings],
    // Southern hemisphere
    ['south-season', () => template.SouthSeasonSettings],
    ['blue', () => template.BlueSettings],
    ['rainbow', () => template.RainbowSettings],
    ['gitblock', () => template.GitBlockSettings],
];

/** Built-in themes, generated when no `SETTING_JSON` is given. */
export const THEMES: ReadonlyArray<Theme> = BASE_THEMES.flatMap(
    ([name, settings]) => [
        { name, settings, animate: false },
        { name: `${name}-animate`, settings, animate: true },
    ],
);

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
