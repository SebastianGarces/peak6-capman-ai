from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ScenarioGenerateRequest(BaseModel):
    curriculum_level: int
    difficulty: int = 5
    market_regime: str = "bull_quiet"
    target_objectives: List[str] = []
    exclude_scenario_ids: List[str] = []

class CriterionEvaluation(BaseModel):
    criterion: str
    weight: float
    score: int
    max_score: int
    evidence: str = ""
    feedback: str = ""

class ScenarioResponse(BaseModel):
    scenario_id: str
    scenario_text: str
    market_data: Dict[str, Any]
    question_prompt: str
    target_objectives: List[str]
    rubric: Dict[str, Any]

class GradingEvaluateRequest(BaseModel):
    scenario_id: str
    scenario_text: str
    rubric: Dict[str, Any]
    student_response: str
    rag_context: str = ""

class GradingResponse(BaseModel):
    criteria_evaluation: List[CriterionEvaluation]
    total_score: int = Field(ge=0, le=100)
    skill_objectives_demonstrated: List[str]
    skill_objectives_failed: List[str] = []
    feedback_summary: str
    probing_questions: List[str]

class ProbingEvaluateRequest(BaseModel):
    original_scenario: str
    original_response: str
    probing_question: str
    probing_response: str

class ProbingResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    feedback: str

class RagQueryRequest(BaseModel):
    query: str
    k: int = 5
    filter_document_type: Optional[str] = None

class RagChunk(BaseModel):
    content: str
    document_name: str
    relevance_score: float

class RagQueryResponse(BaseModel):
    chunks: List[RagChunk]

class RagIngestResponse(BaseModel):
    document_name: str
    chunks_created: int

class BatchGenerateRequest(BaseModel):
    curriculum_level: int
    count: int = 10
    market_regimes: List[str] = ["bull_quiet", "bear_volatile", "sideways"]

class BatchGenerateResponse(BaseModel):
    generated: int
    passed_quality: int
    failed_quality: int

class HealthResponse(BaseModel):
    status: str
    model: str
    db: str
