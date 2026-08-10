from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI PPT OS V3"
    debug: bool = True

    deepseek_api_key: str = ""
    openai_api_key: str = ""

    database_url: str = "sqlite+aiosqlite:///D:/ai-ppt-os-v3/data/pptv3.db"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "ppt-os-v3-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    free_daily_limit: int = 3
    pro_monthly_price: float = 29.00
    school_yearly_price: float = 2999.00

    output_dir: str = "D:/ai-ppt-os-v3/output"
    upload_dir: str = "D:/ai-ppt-os-v3/data/uploads"
    proxy_url: str = "http://127.0.0.1:10808"

    class Config:
        env_file = ".env"


settings = Settings()
