# Task 12: Scenario Attempt Page (Mock Grading) — COMPLETE

## Files Created/Modified
- `src/app/(dashboard)/learn/[levelId]/scenario/[scenarioId]/page.tsx` (created — client component)
- `src/components/trading/scenario-reader.tsx` (created)
- `src/components/trading/response-editor.tsx` (created)
- `src/components/trading/grading-result.tsx` (created)
- `src/actions/scenario.ts` (created — server actions)
- `src/__tests__/scenario-actions.test.ts` (created)
- `src/__tests__/scenario-components.test.tsx` (created)

## Tests
- 5 tests written, all passing
- "submitResponse rejects empty response"
- "submitResponse returns score and feedback for valid response"
- "renders scenario text and market data"
- "renders textarea and submit button"
- "displays score and feedback"

## Acceptance Criteria
- [x] Phase 1 (Read): Displays scenario text and market data, "Start Response" button
- [x] Phase 2 (Respond): Shows textarea editor, "Submit" button, character count
- [x] Phase 3 (Grading): Shows loading spinner
- [x] Phase 4 (Summary): Shows final score, "Next Scenario" and "Back to Level" buttons
- [x] `startScenario` server action creates a `scenario_attempts` row — implemented
- [x] `submitResponse` server action updates attempt with response text and mock score — implemented
- [x] Mock grading returns a random score 50-100 with static feedback — implemented
- [x] Cannot submit empty response — verified by test

## Notes
- `ResponseEditor` is a client component (uses `useState`)
- `GradingResult` shows criteria breakdown with progress bars
- Phase transitions managed via React state in the page component
