/**
 * Rounds shares (0–1) to whole numbers that still add up to 100, giving the
 * leftover units to the largest remainders. Used for "de cada R$ 100".
 */
export function toHundred(shares: number[]): number[] {
  const raw = shares.map((s) => s * 100);
  const whole = raw.map(Math.floor);
  let missing = 100 - whole.reduce((a, b) => a + b, 0);
  raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => {
      if (missing > 0) {
        whole[i] += 1;
        missing -= 1;
      }
    });
  return whole;
}
