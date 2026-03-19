# Task 43: Challenge Grading Flow — Complete

## Summary
Implemented server actions for the full challenge lifecycle: `createChallenge` inserts a new challenge, `addParticipant` registers users, `submitChallengeResponse` stores responses, and `gradeChallenge` grades both participants in parallel via the AI client, determines the winner (higher score, tiebreaker by faster submission), and awards 50 XP to the winner and 10 XP to the loser.

## Files Created/Modified
- `src/actions/challenge.ts` (created) — server actions: `createChallenge`, `addParticipant`, `submitChallengeResponse`, `gradeChallenge`

## Tests
- All 3 tests pass (`src/__tests__/challenge-grading.test.ts`)
- "higher score wins"
- "tiebreaker: faster submission wins"
- "winner gets 50 XP, loser gets 10 XP"

## AC Verification
- [x] `createChallenge` inserts challenge with status "waiting"
- [x] `gradeChallenge` grades both participants in parallel via `Promise.all`
- [x] Winner determined by higher score; tiebreaker is faster `submittedAt`
- [x] Winner awarded 50 XP, loser awarded 10 XP via `awardXp`
- [x] Challenge status updated to "complete" with `winnerId` and `completedAt`
- [x] Fallback mock scoring if AI grading fails
