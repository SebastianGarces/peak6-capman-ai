import pytest
from unittest.mock import AsyncMock, patch
from services.scenario_generator import ScenarioGenerator
from models.schemas import ScenarioResponse

@pytest.fixture
def generator():
    return ScenarioGenerator()

@pytest.mark.asyncio
@patch("services.scenario_generator.llm_service")
async def test_generate_batch_creates_scenarios(mock_llm, generator):
    mock_llm.generate_json = AsyncMock(return_value={
        "scenario_text": "Test", "market_data": {}, "question_prompt": "Q",
        "target_objectives": [], "rubric": {}, "quality_score": 0.0,
    })
    mock_llm.generate = AsyncMock(return_value="0.85")

    result = await generator.generate_batch(1, 3, ["bull_quiet", "bear_volatile"])
    assert result["generated"] == 3
    assert result["passed_quality"] + result["failed_quality"] == 3
