# Task 35: Intervention Queue — COMPLETE

## Files Created/Modified
- `src/components/mtss/intervention-queue.tsx` (created)
- `src/app/(educator)/interventions/page.tsx` (created)
- `src/app/(educator)/interventions/client.tsx` (created)
- `src/__tests__/intervention-queue.test.tsx` (created)
- `src/actions/educator.ts` (created — includes getInterventionQueue, sendNudge)

## Tests
- 2 tests written, all passing
- "shows empty state when no items"
- "renders learner info"

## Acceptance Criteria
- [x] Lists all Tier 3 classified learners sorted by days since last activity (descending) — getInterventionQueue sorts by daysInactive desc
- [x] Each item shows: learner name, failing objectives, avg score, days since last activity — all fields displayed
- [x] "Send Nudge" button sends notification to learner — onNudge callback connected to sendNudge action
- [x] "View Detail" links to learner detail page — Link href="/educator/students/{userId}"
- [x] Empty state when no Tier 3 learners — "No Tier 3 learners — great job!" message

## Notes
The interventions page uses server-side data fetching with getInterventionQueue.
A client wrapper (InterventionQueueClient) enables the sendNudge action from client components.
