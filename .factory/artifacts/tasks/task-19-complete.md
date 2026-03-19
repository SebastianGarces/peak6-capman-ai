# Task 19: Probing Question Evaluation — COMPLETE

## Files Created/Modified
- python-service/prompts/probing.j2 (created)
- python-service/services/grading_engine.py (modified: added evaluate_probing())
- python-service/routers/grading.py (modified: added /api/grading/evaluate-probing endpoint)
- python-service/tests/test_grading.py (includes probing test)

## Tests
- test_evaluate_probing_returns_score (passing)

## Acceptance Criteria
- [x] POST /api/grading/evaluate-probing accepts original scenario, original response, probing question, probing response
- [x] Returns score (0-100) and feedback
- [x] Jinja2 template provides full context for evaluation
- [x] Validates required fields (ProbingEvaluateRequest)
