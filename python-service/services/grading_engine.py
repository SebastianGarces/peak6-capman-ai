import os
from typing import Optional, List
from jinja2 import Environment, FileSystemLoader
from services.llm_service import llm_service
from models.schemas import GradingResponse, ProbingResponse
from config import settings

# Use absolute path for template loading to support running tests from different directories
_prompts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prompts")
env = Environment(loader=FileSystemLoader(_prompts_dir))

class GradingEngine:
    async def grade_response(
        self,
        scenario_text: str,
        rubric: dict,
        student_response: str,
        target_objectives: Optional[List[str]] = None,
    ) -> GradingResponse:
        template = env.get_template("grading.j2")
        rubric_criteria = rubric.get("criteria", [])
        prompt = template.render(
            scenario_text=scenario_text,
            rubric_criteria=rubric_criteria,
            student_response=student_response,
        )

        result = await llm_service.generate_json(
            system_prompt="You are a strict but fair grading engine for options trading scenarios.",
            user_prompt=prompt,
            schema=GradingResponse,
            model=settings.llm_grading_model,
        )

        return GradingResponse.model_validate(result)

    async def evaluate_probing(
        self,
        original_scenario: str,
        original_response: str,
        probing_question: str,
        probing_response: str,
    ) -> ProbingResponse:
        template = env.get_template("probing.j2")
        prompt = template.render(
            original_scenario=original_scenario,
            original_response=original_response,
            probing_question=probing_question,
            probing_response=probing_response,
        )

        result = await llm_service.generate_json(
            system_prompt="You evaluate depth of understanding in options trading.",
            user_prompt=prompt,
            schema=ProbingResponse,
            model=settings.llm_grading_model,
        )

        return ProbingResponse.model_validate(result)

grading_engine = GradingEngine()
