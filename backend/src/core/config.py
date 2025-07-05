from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import ValidationInfo, field_validator
from pydantic_settings import BaseSettings

env_file = str(Path(__file__).resolve().parent.parent.parent.parent / ".env")


class Settings(BaseSettings):
    ENV: str = "dev"
    PROJECT_NAME: str = "paintwars"

    API_PREFIX: str = "/api/v1"

    BACKEND_BASE_URL: str = "http://localhost"
    BACKEND_PORT: str = "8000"

    STAKE_FRONT_BASE_URL: str = "http://localhost"
    STAKE_FRONT_PORT: str = "5472"

    RPC_URL: str = ""

    OPENAI_KEY: str = ""

    CORS_ORIGINS: list[str] | str = []

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)

    DB_DRIVER: str = "postgresql+asyncpg"
    DB_HOST: str | None = None
    DB_PORT: str | None = None
    DB_USER: str | None = None
    DB_PASSWORD: str | None = None
    DB_NAME: str | None = None
    DB_URL: str = ""

    @field_validator("DB_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None, info: ValidationInfo) -> str:
        if isinstance(v, str) and len(v) > 0:
            return v
        scheme = info.data.get("DB_DRIVER")
        host = info.data.get("DB_HOST")
        port = info.data.get("DB_PORT")
        user = info.data.get("DB_USER")
        password = info.data.get("DB_PASSWORD")
        db = info.data.get("DB_NAME")
        return f"{scheme}://{user}:{password}@{host}:{port}/{db}"

    TOKEN_ADDRESS: str = ""
    PIXEL_STAKING_ADDRESS: str = ""
    PROJECT_FACTORY_ADDRESS: str = ""

    class Config:
        # env_file = str(Path(__file__).resolve().parent.parent.parent.parent / ".env")
        case_sensitive = True


config = Settings()
