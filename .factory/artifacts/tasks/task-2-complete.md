# Task 2: Fix stat cards and page contrast across all pages — COMPLETE

## Files Modified
- `src/app/(dashboard)/page.tsx` (modified: replaced `glass-card` with per-card accent tints on 4 stat cards)
- `src/components/profile/profile-client.tsx` (modified: replaced `glass-card` + inline bg tints with per-card accent tints on 4 stat cards)
- `src/components/mtss/engagement-panel.tsx` (modified: replaced `glass-card` with per-card accent tints, per-card icon colors)

## Changes

### Dashboard Home
- XP: `glass-card` → `stat-card-green rounded-xl p-4`
- Level: `glass-card` → `stat-card-gold rounded-xl p-4`
- Streak: `glass-card` → `stat-card-orange rounded-xl p-4`
- Scenarios: `glass-card` → `stat-card-blue rounded-xl p-4`

### Profile Client
- XP: `glass-card … bg-green-500/5` → `stat-card-green rounded-lg p-4`
- Level: `glass-card … bg-amber-500/5` → `stat-card-gold rounded-lg p-4`
- Streak: `glass-card … bg-orange-500/5` → `stat-card-orange rounded-lg p-4`
- Attempts: `glass-card … bg-blue-500/5` → `stat-card-blue rounded-lg p-4`
- Profile hero card: already uses `glass-card` (now solid) — no change needed

### Engagement Panel
- DAU: `stat-card-blue`, icon `text-blue-400`
- WAU: `stat-card-violet`, icon `text-violet-400`
- Sessions: `stat-card-green`, icon `text-green-400`
- Challenge Rate: `stat-card-gold`, icon `text-amber-400`

## Other pages scanned
- `learn/page.tsx` — no `glass-card` (delegates to CurriculumMap)
- `leaderboard/page.tsx` — no `glass-card` (delegates to sub-components)
- `review/page.tsx` — uses `glass-card` for empty/success state containers only; appropriate with solid style

## Build
- Compiled successfully (Turbopack, Next.js 16.2.0)
- Pre-existing TS errors in test files only; no new errors introduced

## Acceptance Criteria
- [x] Dashboard stat cards use per-card accent tints (green, gold, orange, blue)
- [x] Profile stat cards use per-card accent tints (green, gold, orange, blue)
- [x] Engagement panel stats use per-card accent tints (blue, violet, green, gold) with matching icon colors
- [x] Profile hero card uses `glass-card` (solid)
- [x] Other pages reviewed — no problematic glass-card usages found
