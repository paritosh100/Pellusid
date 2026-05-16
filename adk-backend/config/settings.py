"""
Configuration settings for ADK backend
"""
import os
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Google API
    google_api_key: str
    # ── New: OpenAI (for reading_agent + bridge_agent) ────────────────────
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    openai_base_url: Optional[str] = None  # for custom endpoints

    # ── New: Supabase (for storage layer) ─────────────────────────────────
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str  # server-side only, never expose to client

    # Environment
    environment: str = "development"
    
    # Models
    default_model: str = "gemini-2.0-flash"
    premium_model: str = "gemini-2.0-flash"  # Use Flash for all agents (cheapest)
    thinking_model: str = "gemini-2.0-flash"  # Thinking model for hybrid orchestrator
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8080
    cors_origins: str = "http://localhost:3000"
    
    # Caching
    enable_caching: bool = True
    redis_url: str = "redis://localhost:6379"
    cache_ttl: int = 86400  # 24 hours
    
    # Rate Limiting
    max_requests_per_day: int = 1000
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment.lower() == "production"


# Global settings instance
settings = Settings()
