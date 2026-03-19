# Task 40: Matchmaking Queue Logic — Complete

## Summary
Implemented an in-memory matchmaking queue with XP-based compatibility matching. Players are matched by curriculum level with an XP range that relaxes over time: within 400 XP initially, expanding to 800 XP after 30 seconds, and accepting any same-level opponent after 60 seconds. Exports `addToQueue`, `removeFromQueue`, `isCompatible`, `findMatch`, `getQueueSize`, and `clearQueue`.

## Files Created/Modified
- `src/lib/challenge/matchmaking.ts` (created) — matchmaking queue with `QueueEntry` interface, `addToQueue`, `removeFromQueue`, `isCompatible`, `findMatch`, `getQueueSize`, `clearQueue`

## Tests
- All 6 tests pass (`src/__tests__/matchmaking.test.ts`)
- "isCompatible returns true for same level, XP within 400"
- "isCompatible returns false for different levels"
- "isCompatible rejects XP difference > 400 before 30s"
- "relaxed matching at 30s allows +/-800 XP"
- "after 60s, any same-level player matches"
- "cancel removes player from queue"

## AC Verification
- [x] `addToQueue` adds player entry to in-memory Map keyed by socketId
- [x] `removeFromQueue` removes player by socketId
- [x] `isCompatible` requires same curriculum level and rejects self-matches
- [x] XP range starts at 400, relaxes to 800 at 30s, becomes Infinity at 60s
- [x] `findMatch` iterates queue to find first compatible candidate using elapsed time
