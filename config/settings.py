"""
config/settings.py — updated to add OpenAI + Supabase keys
Extends your existing settings, nothing removed.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # ── Existing ADK settings (unchanged) ────────────────────────────────
    google_api_key: str
    default_model: str = "gemini-2.0-flash-exp"
    premium_model: str = "gemini-2.0-flash-thinking-exp"

    # ── New: OpenAI (for reading_agent + bridge_agent) ────────────────────
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    openai_base_url: Optional[str] = None  # for custom endpoints

    # ── New: Supabase (for storage layer) ─────────────────────────────────
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str  # server-side only, never expose to client

    # ── App ───────────────────────────────────────────────────────────────
    environment: str = "development"
    frontend_url: str = "https://insightbridge.app"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()