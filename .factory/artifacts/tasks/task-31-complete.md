# Task 31: MTSS Classification Algorithm — COMPLETE

## Files Created/Modified
- `src/lib/mtss/classifier.ts` (created)
- `src/__tests__/classifier.test.ts` (created)
- `src/lib/db/schema.ts` (created — prerequisite)
- `src/lib/db/index.ts` (created — prerequisite)

## Tests
- 6 tests written, all passing
- "< 3 attempts returns Tier 1"
- "avg_score 40 returns Tier 3"
- "avg_score 60 returns Tier 2"
- "avg_score 80 returns Tier 1"
- "5+ days inactive returns Tier 3 regardless of score"
- "3-4 days inactive returns Tier 2 regardless of score"

## Acceptance Criteria
- [x] After each grading, classify user for each skill objective tested — verified by classifier logic
- [x] Uses last 10 attempts for user+objective pair — implemented in DB query with .limit(10)
- [x] < 3 attempts → default Tier 1 — verified by test
- [x] avg_score < 50 OR inactive >= 5 days → Tier 3 — verified by tests
- [x] avg_score < 70 OR inactive >= 3 days → Tier 2 — verified by tests
- [x] Otherwise → Tier 1 — verified by tests
- [x] Insert mtss_classifications row (new row when tier changes, update otherwise) — implemented in classifier.ts
- [x] classified_at timestamp tracks when tier was computed — using defaultNow() in insert

## Notes
Tests use pure function extracted from classification logic (no DB dependency) for unit testing.
The classifier.ts file provides the full DB-backed implementation.
Also created db/schema.ts and db/index.ts as prerequisite foundation files.
