const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN || "";

async function aiRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${AI_SERVICE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": INTERNAL_TOKEN,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`AI service error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function gradeResponse(params: {
  scenarioId: string;
  scenarioText: string;
  rubric: Record<string, unknown>;
  studentResponse: string;
}) {
  return aiRequest<{
    criteria_evaluation: Array<{
      criterion: string;
      weight: number;
      score: number;
      max_score: number;
      evidence: string;
      feedback: string;
    }>;
    total_score: number;
    skill_objectives_demonstrated: string[];
    skill_objectives_failed: string[];
    feedback_summary: string;
    probing_questions: string[];
  }>("/api/grading/evaluate", {
    scenario_id: params.scenarioId,
    scenario_text: params.scenarioText,
    rubric: params.rubric,
    student_response: params.studentResponse,
  });
}

export async function evaluateProbing(params: {
  originalScenario: string;
  originalResponse: string;
  probingQuestion: string;
  probingResponse: string;
}) {
  return aiRequest<{ score: number; feedback: string }>("/api/grading/evaluate-probing", {
    original_scenario: params.originalScenario,
    original_response: params.originalResponse,
    probing_question: params.probingQuestion,
    probing_response: params.probingResponse,
  });
}

export async function generateScenario(params: {
  curriculumLevel: number;
  difficulty: number;
  marketRegime: string;
  targetObjectives: string[];
}) {
  return aiRequest<{
    scenario_id: string;
    scenario_text: string;
    market_data: Record<string, unknown>;
    question_prompt: string;
    target_objectives: string[];
    rubric: Record<string, unknown>;
  }>("/api/scenarios/generate", {
    curriculum_level: params.curriculumLevel,
    difficulty: params.difficulty,
    market_regime: params.marketRegime,
    target_objectives: params.targetObjectives,
  });
}

export async function queryRag(params: { query: string; k?: number; filterDocumentType?: string }) {
  return aiRequest<{
    chunks: Array<{ content: string; document_name: string; relevance_score: number }>;
  }>("/api/rag/query", {
    query: params.query,
    k: params.k || 5,
    filter_document_type: params.filterDocumentType,
  });
}
