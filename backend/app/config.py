from os import getenv


def get_env_bool(name: str, default: bool) -> bool:
    value = getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


class Settings:
    database_url: str = getenv("DATABASE_URL", "sqlite:///./courier.db")
    secret_key: str = getenv("SECRET_KEY", "change_this_to_a_long_random_secret_key")
    algorithm: str = getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


settings = Settings()
