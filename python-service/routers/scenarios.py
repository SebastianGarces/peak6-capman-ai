from fastapi import APIRouter, HTTPException, Request
from models.schemas import ScenarioGenerateRequest, ScenarioResponse, BatchGenerateRequest, BatchGenerateResponse
from services.scenario_generator import scenario_generator

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])

@router.post("/generate", response_model=ScenarioResponse)
async def generate_scenario(request: ScenarioGenerateRequest, req: Request):
    db_pool = getattr(req.app.state, 'db_pool', None)
    try:
        result = await scenario_generator.generate_scenario(
            curriculum_level=request.curriculum_level,
            difficulty=request.difficulty,
            market_regime=request.market_regime,
            target_objectives=request.target_objectives,
            db_pool=db_pool,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-batch", response_model=BatchGenerateResponse)
async def generate_batch(request: BatchGenerateRequest, req: Request):
    db_pool = getattr(req.app.state, 'db_pool', None)
    try:
        result = await scenario_generator.generate_batch(
            curriculum_level=request.curriculum_level,
            count=request.count,
            market_regimes=request.market_regimes,
            db_pool=db_pool,
        )
        return BatchGenerateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
