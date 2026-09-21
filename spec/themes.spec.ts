import * as themes from '../src/themes';

describe('parseThemes', () => {
    it('selects every theme by default', () => {
        expect(themes.THEMES.map((t) => t.name)).toEqual([
            'green',
            'green-animate',
            'season',
            'season-animate',
            'south-season',
            'south-season-animate',
            'blue',
            'blue-animate',
            'rainbow',
            'rainbow-animate',
            'gitblock',
            'gitblock-animate',
        ]);
        expect(themes.parseThemes(undefined)).toEqual([...themes.THEMES]);
        expect(themes.parseThemes(' , ')).toEqual([...themes.THEMES]);
    });

    it('selects the named themes in the given order', () => {
        const selected = themes.parseThemes('gitblock, green');
        expect(selected.map((t) => t.name)).toEqual(['gitblock', 'green']);
        expect(selected[1].animate).toBe(false);
    });

    it('rejects unknown names', () => {
        expect(() => themes.parseThemes('green,purple')).toThrow('"purple"');
    });
});
