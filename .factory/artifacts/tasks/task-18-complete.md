# Task 18: Grading Engine — COMPLETE

## Files Created/Modified
- python-service/prompts/grading.j2 (created)
- python-service/services/grading_engine.py (created)
- python-service/routers/grading.py (modified: wired up real handler)
- python-service/tests/test_grading.py (created — includes Task 19 tests)

## Tests
- 3 tests written, all passing
- test_grade_response_returns_valid_grading
- test_evaluate_probing_returns_score
- test_grading_template_renders

## Acceptance Criteria
- [x] Grades response against rubric criteria
- [x] Returns per-criterion evaluation with criterion name, weight, score, max_score, evidence, feedback
- [x] Calculates total_score 0-100
- [x] Identifies skill objectives demonstrated vs failed
- [x] Generates probing follow-up questions
- [x] Provides feedback_summary
- [x] Jinja2 template includes rubric, scenario, and student response
