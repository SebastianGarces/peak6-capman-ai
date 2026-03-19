# Task 10: Curriculum Map Page (`/learn`) — COMPLETE

## Files Created/Modified
- `src/app/(dashboard)/learn/page.tsx` (created — server component)
- `src/components/game/curriculum-map.tsx` (created)
- `src/__tests__/curriculum-map.test.tsx` (created)

## Tests
- 3 tests written, all passing
- "renders 10 level cards"
- "levels 1-3 are unlocked (have links), 4-10 are locked"
- "current level card has distinct visual treatment"

## Acceptance Criteria
- [x] Page fetches all curriculum levels and user's `current_curriculum_level` — verified by server component implementation
- [x] Levels at or below user's current level show as unlocked (clickable) — verified by test "levels 1-3 are unlocked"
- [x] Levels above user's current level show as locked (grayed out, not clickable) — verified by link count test
- [x] Each level card shows: level number, name, description, objective count — implemented in CurriculumMap
- [x] Unlocked levels link to `/learn/[levelId]` — verified by link test
- [x] Current level is visually highlighted — verified by ring class test
- [x] Server component — no client-side data fetching — implemented as async server component

## Notes
- CurriculumMap component uses `data-testid="level-card-{levelNumber}"` for testability
- Unlocked levels are wrapped in `<Link>`, locked levels in `<div>`
- SQL aggregate query counts skill objectives per level using `leftJoin` + `groupBy`
