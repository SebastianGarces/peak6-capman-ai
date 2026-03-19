# Task 26: Level-Up Modal — COMPLETE

## Files Created/Modified
- `src/components/game/level-up-modal.tsx` (created)
- `src/components/ui/dialog.tsx` (created via `npx shadcn@latest add dialog -y`)
- `src/__tests__/level-up-modal.test.tsx` (created)

## Tests
- 2 tests written, all passing
- "renders with new level and badge name"
- "has continue button that calls onClose"

## Acceptance Criteria
- [x] Shows "LEVEL UP!" heading — verified by test
- [x] Shows new level number — verified by test
- [x] Shows level name (e.g. "Trader II" for level 5) — verified by test
- [x] Continue button calls `onClose` — verified by test
- [x] Animated entrance using `motion/react` with spring physics

## Notes
- shadcn dialog installed via `npx shadcn@latest add dialog -y`.
