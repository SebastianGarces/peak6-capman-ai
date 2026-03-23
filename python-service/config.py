from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://capman:capman_local@localhost:5433/capman_dev"
    llm_provider: str = "openrouter"
    openai_api_key: str = ""
    openai_base_url: str = "https://openrouter.ai/api/v1"
    llm_scenario_model: str = "anthropic/claude-sonnet-4"
    llm_grading_model: str = "anthropic/claude-sonnet-4"
    internal_api_token: str = "capman-internal-dev-token"
    cors_origin: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
