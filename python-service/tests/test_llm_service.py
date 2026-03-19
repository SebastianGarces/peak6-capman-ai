import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from services.llm_service import LLMService
from pydantic import BaseModel

class TestSchema(BaseModel):
    name: str
    score: int

@pytest.fixture
def llm():
    service = LLMService()
    service.client = MagicMock()
    return service

@pytest.mark.asyncio
async def test_generate_calls_openai(llm):
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="Hello"))]
    llm.client.chat.completions.create = AsyncMock(return_value=mock_response)

    result = await llm.generate("system", "user")
    assert result == "Hello"
    llm.client.chat.completions.create.assert_called_once()

@pytest.mark.asyncio
async def test_generate_json_returns_parsed_dict(llm):
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content='{"name": "test", "score": 85}'))]
    llm.client.chat.completions.create = AsyncMock(return_value=mock_response)

    result = await llm.generate_json("system", "user", TestSchema)
    assert result == {"name": "test", "score": 85}

@pytest.mark.asyncio
async def test_generate_retries_on_rate_limit(llm):
    error = Exception("rate_limit exceeded")
    mock_ok = MagicMock()
    mock_ok.choices = [MagicMock(message=MagicMock(content="OK"))]
    llm.client.chat.completions.create = AsyncMock(side_effect=[error, mock_ok])

    result = await llm.generate("system", "user")
    assert result == "OK"
    assert llm.client.chat.completions.create.call_count == 2

@pytest.mark.asyncio
async def test_generate_raises_after_max_retries(llm):
    error = Exception("rate_limit exceeded")
    llm.client.chat.completions.create = AsyncMock(side_effect=[error, error, error])

    with pytest.raises(RuntimeError, match="Max retries"):
        await llm.generate("system", "user")
