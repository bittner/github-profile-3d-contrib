import { textWidth } from '../src/text-width';

describe('textWidth', () => {
    it('scales glyph advances by the font size', () => {
        expect(textWidth('i', 1000)).toBe(222);
        expect(textWidth('GitHub', 14)).toBeCloseTo(
            ((778 + 222 + 278 + 722 + 556 + 556) / 1000) * 14,
        );
    });

    it('makes narrow labels narrower than the old flat estimate', () => {
        expect(textWidth('gitlab.gnome.org', 14)).toBeLessThan(16 * 14 * 0.55);
        expect(textWidth('WWW', 14)).toBeGreaterThan(3 * 14 * 0.55);
    });
});
