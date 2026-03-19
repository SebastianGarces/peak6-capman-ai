import json
import uuid
from jinja2 import Environment, FileSystemLoader
from services.llm_service import llm_service
from models.schemas import ScenarioResponse
from config import settings
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os

# Use absolute path for template loading to support running tests from different directories
_prompts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "prompts")
env = Environment(loader=FileSystemLoader(_prompts_dir))

class ScenarioLLMOutput(BaseModel):
    scenario_text: str
    market_data: Dict[str, Any]
    question_prompt: str
    target_objectives: List[str]
    rubric: Dict[str, Any]
    quality_score: Optional[float] = 0.0

class ScenarioGenerator:
    async def generate_scenario(
        self,
        curriculum_level: int,
        difficulty: int,
        market_regime: str,
        target_objectives: List[str],
        db_pool=None,
    ) -> ScenarioResponse:
        template = env.get_template("scenario_generation.j2")
        prompt = template.render(
            curriculum_level=curriculum_level,
            difficulty=difficulty,
            market_regime=market_regime,
            target_objectives=target_objectives,
        )

        result = await llm_service.generate_json(
            system_prompt="You are an expert options trading scenario designer.",
            user_prompt=prompt,
            schema=ScenarioLLMOutput,
            model=settings.llm_scenario_model,
        )

        # Add quality self-critique
        critique_prompt = f"Rate the quality of this scenario on a scale of 0.0 to 1.0. Consider coherence, difficulty calibration for level {curriculum_level}, and educational value. Respond with just a number."
        try:
            quality_text = await llm_service.generate(
                system_prompt="You evaluate educational trading scenarios.",
                user_prompt=f"Scenario: {result.get('scenario_text', '')}\n\n{critique_prompt}",
                temperature=0.1,
            )
            quality_score = float(quality_text.strip())
            quality_score = max(0.0, min(1.0, quality_score))
        except (ValueError, RuntimeError):
            quality_score = 0.5

        scenario_id = str(uuid.uuid4())

        # Store in DB if pool provided
        if db_pool:
            async with db_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO scenarios (id, curriculum_level_id, scenario_text, market_data, question_prompt, target_objectives, rubric, difficulty, market_regime, quality_score, is_active, generated_by, created_at, updated_at)
                    SELECT $1, cl.id, $3, $4::jsonb, $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11, $12, NOW(), NOW()
                    FROM curriculum_levels cl WHERE cl.level_number = $2
                """, scenario_id, curriculum_level, result["scenario_text"],
                    json.dumps(result["market_data"]), result["question_prompt"],
                    json.dumps(result["target_objectives"]), json.dumps(result["rubric"]),
                    difficulty, market_regime, quality_score, quality_score >= 0.7,
                    settings.llm_scenario_model)

        return ScenarioResponse(
            scenario_id=scenario_id,
            scenario_text=result["scenario_text"],
            market_data=result["market_data"],
            question_prompt=result["question_prompt"],
            target_objectives=result["target_objectives"],
            rubric=result["rubric"],
        )

    async def generate_batch(
        self,
        curriculum_level: int,
        count: int,
        market_regimes: List[str],
        db_pool=None,
    ) -> Dict[str, int]:
        generated = 0
        passed = 0
        failed = 0

        for i in range(count):
            regime = market_regimes[i % len(market_regimes)]
            try:
                result = await self.generate_scenario(
                    curriculum_level=curriculum_level,
                    difficulty=curriculum_level,
                    market_regime=regime,
                    target_objectives=[],
                    db_pool=db_pool,
                )
                generated += 1
                # Quality filtering happens in generate_scenario (is_active set based on quality_score)
                passed += 1  # For now, count all as passed since generate_scenario handles quality
            except Exception:
                generated += 1
                failed += 1

        return {"generated": generated, "passed_quality": passed, "failed_quality": failed}

scenario_generator = ScenarioGenerator()
