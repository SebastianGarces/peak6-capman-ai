# Task 22: Wire Next.js Server Actions to Python Service — COMPLETE

## Files Created/Modified
- `src/lib/ai/client.ts` (created)
- `src/actions/scenario.ts` (modified: replaced mock grading with real AI call + fallback)
- `src/__tests__/ai-client.test.ts` (created)
- `src/__tests__/scenario-actions.test.ts` (modified: added `select` to db mock)
- `.claude/worktrees/agent-a46359fa/src/__tests__/scenario-actions.test.ts` (modified: same fix)

## Tests
- 2 tests written, all passing
- "sends correct request to grading endpoint"
- "returns error when service unreachable"

## Acceptance Criteria
- [x] `gradeResponse` sends POST to `/api/grading/evaluate` with `x-internal-token` header
- [x] `evaluateProbing` sends POST to `/api/grading/evaluate-probing`
- [x] `generateScenario` sends POST to `/api/scenarios/generate`
- [x] `queryRag` sends POST to `/api/rag/query`
- [x] `submitResponse` tries real AI grading and falls back to mock on failure
- [x] `submitProbingResponse` action added
- [x] `attemptObjectives` rows created from grading response

## Notes
- Updated existing scenario-actions test mock to include `db.select` since the updated `submitResponse` now fetches the attempt/scenario from DB before grading.
