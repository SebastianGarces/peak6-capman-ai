# Task 11: Level Detail Page (`/learn/[levelId]`) — COMPLETE

## Files Created/Modified
- `src/app/(dashboard)/learn/[levelId]/page.tsx` (created — server component)
- `src/components/trading/scenario-card.tsx` (created)
- `src/__tests__/level-detail.test.tsx` (created)

## Tests
- 1 test written, passing
- "renders difficulty, regime, and objectives"

## Acceptance Criteria
- [x] Page shows level name, description, and mastery threshold — implemented
- [x] Lists skill objectives for this level with codes and descriptions — implemented
- [x] Shows available scenarios as cards (empty state if no scenarios exist yet) — implemented with empty state
- [x] Scenario cards show: difficulty, market regime, target objectives — verified by test
- [x] Redirects to `/learn` if user hasn't unlocked this level — redirect logic implemented
- [x] `params` is awaited (Next.js 16 async params) — `const { levelId } = await params;`
- [x] Breadcrumb: Learn > Level {n}: {name} — breadcrumb nav implemented

## Notes
- ScenarioCard links to `/learn/[levelId]/scenario/[scenarioId]`
- Invalid levelId (NaN) also redirects to /learn
- Scenarios fetched with `isActive = true` filter
