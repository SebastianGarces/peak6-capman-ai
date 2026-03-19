# Task 33: Tier Heatmap Component — COMPLETE

## Files Created/Modified
- `src/components/mtss/tier-heatmap.tsx` (created)
- `src/actions/educator.ts` (created — getMtssOverview, getInterventionQueue, sendNudge, getLearnerDetail)
- `src/__tests__/tier-heatmap.test.tsx` (created)

## Tests
- 2 tests written, all passing
- "renders correct number of rows and columns"
- "Tier 1 cells show 1, Tier 3 cells show 3"

## Acceptance Criteria
- [x] Grid rows = learners, columns = skill objectives — table structure in component
- [x] Each cell color-coded: green (Tier 1), amber (Tier 2), red (Tier 3), gray (no data) — TIER_COLORS map
- [x] Cell shows tier number on hover (tooltip) — title attribute with tier info
- [x] Clicking a cell navigates to learner detail — Link href="/educator/students/{userId}"
- [x] Uses latest classification per user+objective — getMtssOverview fetches all classifications

## Notes
getMtssOverview server action fetches learners, objectives, and classifications then builds matrix.
TierHeatmap is a client component for interactivity.
Also created getMtssOverview, getInterventionQueue, sendNudge, getLearnerDetail server actions in educator.ts.
