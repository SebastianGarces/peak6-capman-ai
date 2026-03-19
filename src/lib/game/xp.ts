export function calculateXpAward(score: number): { base: number; bonus: number; total: number } {
  const base = 10;
  let bonus = 0;
  if (score >= 90) bonus = 25;
  else if (score >= 80) bonus = 10;
  return { base, bonus, total: base + bonus };
}
