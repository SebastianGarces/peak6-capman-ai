# Task 14: Profile Page — COMPLETE

## Files Created/Modified
- `src/app/(dashboard)/profile/page.tsx` (created — server component)
- `src/lib/game/levels.ts` (created)
- `src/__tests__/profile.test.tsx` (created)

## Tests
- 7 tests written, all passing
- "calculateLevel(0) = 1"
- "calculateLevel(100) = 2"
- "calculateLevel(10000) = 10"
- "calculateLevel(99) = 1"
- "calculateLevel(5999) = 8"
- "getLevelName(1) = Recruit"
- "getLevelName(10) = CapMan Pro"

## Acceptance Criteria
- [x] Displays user name, email, role, avatar placeholder — avatar uses first letter of name
- [x] Shows current XP, level (with badge name from LEVEL_THRESHOLDS) — implemented using `calculateLevel` and `getLevelName`
- [x] Shows total scenario attempts count and average score — fetched via `count` + `avg` aggregates
- [x] Shows curriculum progress (current level / 10) — progress bar implemented
- [x] Shows member since date — `user.createdAt.toLocaleDateString()`

## Notes
- `LEVEL_THRESHOLDS` defines 10 levels from Recruit (0 XP) to CapMan Pro (10000 XP)
- `calculateLevel()` iterates from highest threshold downward for efficiency
- Profile page fetches streak data from `userStreaks` table
- All DB queries run server-side (no client data fetching)
