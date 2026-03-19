from fastapi import APIRouter, HTTPException
from models.schemas import GradingEvaluateRequest, GradingResponse, ProbingEvaluateRequest, ProbingResponse
from services.grading_engine import grading_engine

router = APIRouter(prefix="/api/grading", tags=["grading"])

@router.post("/evaluate", response_model=GradingResponse)
async def evaluate(request: GradingEvaluateRequest):
    try:
        result = await grading_engine.grade_response(
            scenario_text=request.scenario_text,
            rubric=request.rubric,
            student_response=request.student_response,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-probing", response_model=ProbingResponse)
async def evaluate_probing(request: ProbingEvaluateRequest):
    try:
        result = await grading_engine.evaluate_probing(
            original_scenario=request.original_scenario,
            original_response=request.original_response,
            probing_question=request.probing_question,
            probing_response=request.probing_response,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
