"""
Configuration settings for ADK backend
"""
import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Google API
    google_api_key: str
    
    # Environment
    environment: str = "development"
    
    # Models
    default_model: str = "gemini-2.0-flash-exp"
    premium_model: str = "gemini-2.0-flash-exp"  # Use Flash for all agents (cheapest)
    
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
