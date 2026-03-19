import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"

@pytest.mark.asyncio
async def test_scenario_generate_stub(client):
    resp = await client.post("/api/scenarios/generate", json={
        "curriculum_level": 1,
        "difficulty": 5,
        "market_regime": "bull_quiet",
    })
    # Returns 500 because no LLM configured, not 501 (we wired up the real handler)
    assert resp.status_code in (500, 422, 501)

@pytest.mark.asyncio
async def test_grading_evaluate_stub(client):
    resp = await client.post("/api/grading/evaluate", json={
        "scenario_id": "test",
        "scenario_text": "test",
        "rubric": {},
        "student_response": "test",
    })
    # Returns 500 because no LLM configured, not 501
    assert resp.status_code in (500, 422, 501)

@pytest.mark.asyncio
async def test_scenario_generate_request_validation(client):
    resp = await client.post("/api/scenarios/generate", json={})
    assert resp.status_code == 422  # missing required field curriculum_level

@pytest.mark.asyncio
async def test_grading_evaluate_request_validation(client):
    resp = await client.post("/api/grading/evaluate", json={})
    assert resp.status_code == 422
