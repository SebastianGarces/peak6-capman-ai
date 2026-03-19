from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://capman:capman_local@localhost:5433/capman_dev"
    llm_provider: str = "openai"
    openai_api_key: str = ""
    llm_scenario_model: str = "gpt-4o-mini"
    llm_grading_model: str = "gpt-4o"
    internal_api_token: str = "capman-internal-dev-token"
    cors_origin: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
