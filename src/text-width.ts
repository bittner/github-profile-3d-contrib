/**
 * Advance widths of Helvetica/Arial glyphs in 1/1000 em, the fonts most
 * viewers fall back to. The SVG is built without a browser, so text cannot
 * be measured; these metrics keep legend layout close to the rendered size.
 */
const GLYPH_WIDTHS: { [char: string]: number } = {
    ' ': 278,
    '.': 278,
    ',': 278,
    ':': 278,
    '-': 333,
    _: 556,
    '/': 278,
    '(': 333,
    ')': 333,
    a: 556,
    b: 556,
    c: 500,
    d: 556,
    e: 556,
    f: 278,
    g: 556,
    h: 556,
    i: 222,
    j: 222,
    k: 500,
    l: 222,
    m: 833,
    n: 556,
    o: 556,
    p: 556,
    q: 556,
    r: 333,
    s: 500,
    t: 278,
    u: 556,
    v: 500,
    w: 722,
    x: 500,
    y: 500,
    z: 500,
    A: 667,
    B: 667,
    C: 722,
    D: 722,
    E: 667,
    F: 611,
    G: 778,
    H: 722,
    I: 278,
    J: 500,
    K: 667,
    L: 556,
    M: 833,
    N: 722,
    O: 778,
    P: 667,
    Q: 778,
    R: 722,
    S: 667,
    T: 611,
    U: 722,
    V: 667,
    W: 944,
    X: 667,
    Y: 667,
    Z: 611,
};
const DEFAULT_WIDTH = 556;

/** Approximate rendered width of `text` at `fontSize` px. */
export const textWidth = (text: string, fontSize: number): number =>
    ([...text].reduce(
        (sum, char) => sum + (GLYPH_WIDTHS[char] ?? DEFAULT_WIDTH),
        0,
    ) /
        1000) *
    fontSize;
