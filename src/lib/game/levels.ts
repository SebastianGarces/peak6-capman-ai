export const LEVEL_THRESHOLDS: Record<number, { xp: number; name: string }> = {
  1: { xp: 0, name: "Recruit" },
  2: { xp: 100, name: "Analyst I" },
  3: { xp: 300, name: "Analyst II" },
  4: { xp: 600, name: "Trader I" },
  5: { xp: 1000, name: "Trader II" },
  6: { xp: 1500, name: "Senior Trader" },
  7: { xp: 2500, name: "Strategist I" },
  8: { xp: 4000, name: "Strategist II" },
  9: { xp: 6000, name: "Risk Manager" },
  10: { xp: 10000, name: "CapMan Pro" },
};

export function calculateLevel(xp: number): number {
  let level = 1;
  for (let i = 10; i >= 1; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      level = i;
      break;
    }
  }
  return level;
}

export function getLevelName(level: number): string {
  return LEVEL_THRESHOLDS[level]?.name || "Unknown";
}
