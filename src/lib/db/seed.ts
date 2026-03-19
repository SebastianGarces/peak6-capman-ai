import { db } from "./index";
import { curriculumLevels, skillObjectives } from "./schema";
import { eq } from "drizzle-orm";

const CURRICULUM_LEVELS = [
  { levelNumber: 1, name: "Foundation", description: "Calls, puts, strike, expiration, premium, moneyness" },
  { levelNumber: 2, name: "Greeks Basics", description: "Delta, theta, vega intuition" },
  { levelNumber: 3, name: "Single-Leg Strategies", description: "Long/short calls/puts, covered call, cash-secured put" },
  { levelNumber: 4, name: "Vertical Spreads", description: "Bull/bear call/put spreads, max P/L, breakeven" },
  { levelNumber: 5, name: "Market Regime Analysis", description: "Trend ID, IV analysis, regime-strategy matching" },
  { levelNumber: 6, name: "Volatility Strategies", description: "Straddles, strangles, calendars" },
  { levelNumber: 7, name: "Complex Strategies", description: "Iron condors, butterflies, ratio spreads" },
  { levelNumber: 8, name: "Risk Management", description: "Position sizing, portfolio Greeks, rolling" },
  { levelNumber: 9, name: "Advanced Greeks", description: "Vanna, charm, volga" },
  { levelNumber: 10, name: "Professional Synthesis", description: "Multi-regime portfolios, full trade plans" },
];

const SKILL_OBJECTIVES = [
  { code: "OBJ-001", name: "Identify option moneyness", description: "Identify option moneyness (ITM/ATM/OTM)", levelNumber: 1 },
  { code: "OBJ-002", name: "Calculate intrinsic and extrinsic value", description: "Calculate option intrinsic and extrinsic value", levelNumber: 1 },
  { code: "OBJ-003", name: "Interpret delta for directional risk", description: "Interpret delta for directional risk", levelNumber: 2 },
  { code: "OBJ-004", name: "Interpret theta for time decay impact", description: "Interpret theta for time decay impact", levelNumber: 2 },
  { code: "OBJ-005", name: "Interpret vega for volatility sensitivity", description: "Interpret vega for volatility sensitivity", levelNumber: 2 },
  { code: "OBJ-006", name: "Identify correct strategy for market regime", description: "Identify correct strategy for market regime", levelNumber: 5 },
  { code: "OBJ-007", name: "Calculate max profit/loss for vertical spreads", description: "Calculate max profit/loss for vertical spreads", levelNumber: 4 },
  { code: "OBJ-008", name: "Calculate breakeven for a given strategy", description: "Calculate breakeven for a given strategy", levelNumber: 4 },
  { code: "OBJ-009", name: "Articulate risk management rationale", description: "Articulate risk management rationale", levelNumber: 8 },
  { code: "OBJ-010", name: "Construct multi-leg trade thesis", description: "Construct multi-leg trade thesis", levelNumber: 7 },
  { code: "OBJ-011", name: "Identify adjustment triggers", description: "Identify adjustment triggers (stop loss, roll conditions)", levelNumber: 8 },
  { code: "OBJ-012", name: "Evaluate portfolio-level Greek exposure", description: "Evaluate portfolio-level Greek exposure", levelNumber: 9 },
];

export async function seed() {
  console.log("Seeding curriculum levels...");

  // Upsert curriculum levels (idempotent)
  for (const level of CURRICULUM_LEVELS) {
    const existing = await db
      .select()
      .from(curriculumLevels)
      .where(eq(curriculumLevels.levelNumber, level.levelNumber))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(curriculumLevels).values({
        levelNumber: level.levelNumber,
        name: level.name,
        description: level.description,
        prerequisiteLevel: level.levelNumber > 1 ? level.levelNumber - 1 : null,
        masteryThreshold: 80,
        minAttemptsRequired: 10,
      });
    }
  }

  console.log("Seeding skill objectives...");

  // Get level IDs by number
  const levels = await db.select().from(curriculumLevels);
  const levelMap = new Map(levels.map((l) => [l.levelNumber, l.id]));

  for (const obj of SKILL_OBJECTIVES) {
    const existing = await db
      .select()
      .from(skillObjectives)
      .where(eq(skillObjectives.code, obj.code))
      .limit(1);

    if (existing.length === 0) {
      const levelId = levelMap.get(obj.levelNumber);
      if (!levelId) throw new Error(`Level ${obj.levelNumber} not found for ${obj.code}`);
      await db.insert(skillObjectives).values({
        code: obj.code,
        name: obj.name,
        description: obj.description,
        curriculumLevelId: levelId,
      });
    }
  }

  console.log("Seed complete!");
}

// Run if executed directly
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
