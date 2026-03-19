# Task 17: Scenario Generation Engine — COMPLETE

## Files Created/Modified
- python-service/prompts/scenario_generation.j2 (created)
- python-service/services/scenario_generator.py (created)
- python-service/routers/scenarios.py (modified: wired up real handler)
- python-service/tests/test_scenario_generator.py (created)

## Tests
- 3 tests written, all passing
- test_jinja2_template_renders
- test_generate_scenario_returns_valid_response
- test_quality_score_between_0_and_1

## Acceptance Criteria
- [x] Generates scenario given curriculum_level, difficulty, market_regime, target_objectives
- [x] Jinja2 template produces well-structured prompt
- [x] Output includes scenario_text, market_data, question_prompt, target_objectives, rubric
- [x] Self-critique quality scoring (0-1)
- [x] Scenario stored in DB via asyncpg when db_pool provided
- [x] Output validated via Pydantic (ScenarioLLMOutput intermediate schema)

## Notes
- Uses absolute path for template loading so tests work from any working directory
- Intermediate schema ScenarioLLMOutput handles quality_score from LLM; ScenarioResponse (without quality_score) returned to caller
- DB storage uses INSERT ... SELECT to resolve curriculum_level_number to id
