# Task 45: Peer Review Module — Complete

## Summary
Implemented the peer review system with server actions to fetch a reviewable attempt (excludes own attempts and already-reviewed ones) and submit a peer review with 3 scored criteria (Correctness, Reasoning, Risk Awareness on a 1-5 scale) plus an optional comment, awarding 5 XP on submission. The review page displays the scenario and anonymized response via `ReviewCard`, with a `ReviewRubricForm` for scoring.

## Files Created/Modified
- `src/actions/peer-review.ts` (created) — `getReviewableAttempt` and `submitPeerReview` server actions
- `src/app/(dashboard)/review/page.tsx` (created) — review page with loading, empty state, and review form
- `src/components/review/review-card.tsx` (created) — displays scenario text and anonymized student response
- `src/components/review/review-rubric-form.tsx` (created) — 3-criteria rating form (1-5 buttons) with optional comment and submit

## Tests
- All 3 tests pass (`src/__tests__/peer-review.test.tsx`)
- "renders scenario and response text" (ReviewCard)
- "renders 3 rating criteria" (ReviewRubricForm — Correctness, Reasoning, Risk Awareness)
- "has submit button"

## AC Verification
- [x] `getReviewableAttempt` excludes own attempts and previously reviewed attempts
- [x] `submitPeerReview` validates scores 1-5, inserts review, awards 5 XP
- [x] Review page loads attempt on mount, shows empty state if none available
- [x] `ReviewCard` shows scenario and anonymized response
- [x] `ReviewRubricForm` has 3 criteria (Correctness, Reasoning, Risk Awareness) with 1-5 rating buttons
- [x] Optional comment field included
- [x] "+5 XP" confirmation shown after submission
