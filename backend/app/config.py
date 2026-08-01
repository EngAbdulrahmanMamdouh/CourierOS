from os import getenv


def get_env_bool(name: str, default: bool) -> bool:
    value = getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def _require_env(name: str) -> str:
    value = getenv(name)
    if value is None or value == "":
        raise RuntimeError(f"{name} environment variable is required")
    return value


class Settings:
    database_url: str = getenv("DATABASE_URL", "sqlite:///./courier.db")
    secret_key: str = _require_env("SECRET_KEY")
    algorithm: str = getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


settings = Settings()
