import pytest
import os
from unittest.mock import AsyncMock, patch
from services.grading_engine import GradingEngine

@pytest.fixture
def engine():
    return GradingEngine()

@pytest.mark.asyncio
@patch("services.grading_engine.llm_service")
async def test_grade_response_returns_valid_grading(mock_llm, engine):
    mock_llm.generate_json = AsyncMock(return_value={
        "criteria_evaluation": [
            {"criterion": "Analysis", "weight": 0.5, "score": 40, "max_score": 50, "evidence": "...", "feedback": "Good"}
        ],
        "total_score": 80,
        "skill_objectives_demonstrated": ["OBJ-001"],
        "skill_objectives_failed": [],
        "feedback_summary": "Well done",
        "probing_questions": ["Why did you choose that strike?"],
    })

    result = await engine.grade_response("scenario", {"criteria": []}, "response")
    assert result.total_score == 80
    assert len(result.probing_questions) >= 1

@pytest.mark.asyncio
@patch("services.grading_engine.llm_service")
async def test_evaluate_probing_returns_score(mock_llm, engine):
    mock_llm.generate_json = AsyncMock(return_value={
        "score": 75,
        "feedback": "Good understanding",
    })
    result = await engine.evaluate_probing("scenario", "response", "question", "probing answer")
    assert result.score == 75

@pytest.mark.asyncio
async def test_grading_template_renders():
    from jinja2 import Environment, FileSystemLoader
    prompts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prompts")
    env = Environment(loader=FileSystemLoader(prompts_dir))
    template = env.get_template("grading.j2")
    result = template.render(
        scenario_text="Test scenario",
        rubric_criteria=[{"criterion": "Analysis", "weight": 0.5, "max_score": 50}],
        student_response="My analysis...",
    )
    assert "Test scenario" in result
    assert "My analysis" in result
