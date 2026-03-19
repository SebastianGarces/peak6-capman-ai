import asyncio
import json
from typing import Type, Optional
from pydantic import BaseModel
from openai import AsyncOpenAI
from config import settings

class LLMService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        if not self.client:
            raise RuntimeError("LLM client not configured (no API key)")

        model = model or settings.llm_scenario_model
        max_retries = 3
        last_exception = None
        for attempt in range(max_retries):
            try:
                response = await self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temperature,
                )
                return response.choices[0].message.content or ""
            except Exception as e:
                if "rate_limit" in str(e).lower() or "429" in str(e):
                    last_exception = e
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    raise RuntimeError("Max retries exceeded") from e
                raise
        raise RuntimeError("Max retries exceeded")

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Type[BaseModel],
        model: Optional[str] = None,
    ) -> dict:
        model = model or settings.llm_grading_model
        response_text = await self.generate(
            system_prompt=system_prompt + "\n\nRespond ONLY with valid JSON.",
            user_prompt=user_prompt,
            model=model,
            temperature=0.3,
        )
        # Extract JSON from response
        text = response_text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        parsed = json.loads(text)
        # Validate against schema
        validated = schema.model_validate(parsed)
        return validated.model_dump()

llm_service = LLMService()
