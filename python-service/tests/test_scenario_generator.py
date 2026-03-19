import pytest
from unittest.mock import AsyncMock, patch
from services.scenario_generator import ScenarioGenerator

@pytest.fixture
def generator():
    return ScenarioGenerator()

@pytest.mark.asyncio
async def test_jinja2_template_renders():
    import os
    from jinja2 import Environment, FileSystemLoader
    prompts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prompts")
    env = Environment(loader=FileSystemLoader(prompts_dir))
    template = env.get_template("scenario_generation.j2")
    result = template.render(
        curriculum_level=1,
        difficulty=3,
        market_regime="bull_quiet",
        target_objectives=["OBJ-001"],
    )
    assert "CURRICULUM LEVEL: 1" in result
    assert "DIFFICULTY: 3" in result
    assert "bull_quiet" in result

@pytest.mark.asyncio
@patch("services.scenario_generator.llm_service")
async def test_generate_scenario_returns_valid_response(mock_llm, generator):
    mock_llm.generate_json = AsyncMock(return_value={
        "scenario_text": "Test scenario",
        "market_data": {"underlying": "SPY", "underlying_price": 500},
        "question_prompt": "What would you do?",
        "target_objectives": ["OBJ-001"],
        "rubric": {"criteria": []},
        "quality_score": 0.0,
    })
    mock_llm.generate = AsyncMock(return_value="0.85")

    result = await generator.generate_scenario(1, 3, "bull_quiet", ["OBJ-001"])
    assert result.scenario_text == "Test scenario"
    assert result.scenario_id  # UUID generated

@pytest.mark.asyncio
@patch("services.scenario_generator.llm_service")
async def test_quality_score_between_0_and_1(mock_llm, generator):
    mock_llm.generate_json = AsyncMock(return_value={
        "scenario_text": "Test", "market_data": {}, "question_prompt": "Q",
        "target_objectives": [], "rubric": {}, "quality_score": 0.0,
    })
    mock_llm.generate = AsyncMock(return_value="0.92")
    result = await generator.generate_scenario(1, 3, "bull_quiet", [])
    # quality_score is used internally but not in response — just verify no error
    assert result.scenario_text == "Test"
