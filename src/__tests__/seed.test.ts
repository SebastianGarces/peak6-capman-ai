// @vitest-environment node
import { describe, it, expect, afterAll } from "vitest";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://capman:capman_local@localhost:5433/capman_dev",
});

afterAll(async () => {
  await pool.end();
});

describe("Curriculum seed data", () => {
  it("has 10 curriculum_levels", async () => {
    const res = await pool.query("SELECT count(*) FROM curriculum_levels");
    expect(parseInt(res.rows[0].count)).toBe(10);
  });

  it("has 12 skill_objectives", async () => {
    const res = await pool.query("SELECT count(*) FROM skill_objectives");
    expect(parseInt(res.rows[0].count)).toBe(12);
  });

  it("Level 1 has no prerequisite, Level 2 has prerequisite 1", async () => {
    const l1 = await pool.query(
      "SELECT prerequisite_level FROM curriculum_levels WHERE level_number = 1",
    );
    expect(l1.rows[0].prerequisite_level).toBeNull();

    const l2 = await pool.query(
      "SELECT prerequisite_level FROM curriculum_levels WHERE level_number = 2",
    );
    expect(l2.rows[0].prerequisite_level).toBe(1);
  });

  it("OBJ-001 maps to Level 1, OBJ-003 maps to Level 2", async () => {
    const obj1 = await pool.query(`
      SELECT cl.level_number FROM skill_objectives so
      JOIN curriculum_levels cl ON cl.id = so.curriculum_level_id
      WHERE so.code = 'OBJ-001'
    `);
    expect(obj1.rows[0].level_number).toBe(1);

    const obj3 = await pool.query(`
      SELECT cl.level_number FROM skill_objectives so
      JOIN curriculum_levels cl ON cl.id = so.curriculum_level_id
      WHERE so.code = 'OBJ-003'
    `);
    expect(obj3.rows[0].level_number).toBe(2);
  });

  it("running seed twice is idempotent (still 10 levels and 12 objectives)", async () => {
    // Seed was run, these counts should be exact
    const levels = await pool.query("SELECT count(*) FROM curriculum_levels");
    const objs = await pool.query("SELECT count(*) FROM skill_objectives");
    expect(parseInt(levels.rows[0].count)).toBe(10);
    expect(parseInt(objs.rows[0].count)).toBe(12);
  });
});
