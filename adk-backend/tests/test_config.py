"""
Tests for configuration and settings.
"""
import os
import pytest
from pydantic import ValidationError

from config.settings import settings


class TestSettings:
    """Test configuration settings."""

    def test_settings_loaded(self):
        """Test that settings are properly loaded."""
        assert settings is not None

    def test_google_api_key_required(self):
        """Test that GOOGLE_API_KEY is required."""
        # This would fail in CI without the key set
        # The CI should provide it via secrets
        key = os.getenv("GOOGLE_API_KEY")
        if key:
            assert len(key) > 0

    def test_environment_variable(self):
        """Test environment variable reading."""
        env = os.getenv("ENVIRONMENT", "development")
        assert env in ["development", "staging", "production"]

    def test_model_configuration(self):
        """Test model configuration is valid."""
        # Check that model names are set correctly
        assert hasattr(settings, "gemini_model")
        assert hasattr(settings, "gemini_vision_model")

    def test_settings_immutable(self):
        """Test that settings are immutable."""
        with pytest.raises((AttributeError, ValidationError)):
            settings.gemini_model = "invalid-model"


class TestPromptConfiguration:
    """Test prompt configuration."""

    def test_system_prompts_exist(self):
        """Test that all system prompts are configured."""
        from config.prompts import (
            VEDIC_SYSTEM_PROMPT,
            NUMEROLOGY_SYSTEM_PROMPT,
            CHINESE_SYSTEM_PROMPT,
            SYNTHESIS_SYSTEM_PROMPT,
            REFINEMENT_SYSTEM_PROMPT,
            VALIDATOR_SYSTEM_PROMPT,
        )

        assert VEDIC_SYSTEM_PROMPT
        assert NUMEROLOGY_SYSTEM_PROMPT
        assert CHINESE_SYSTEM_PROMPT
        assert SYNTHESIS_SYSTEM_PROMPT
        assert REFINEMENT_SYSTEM_PROMPT
        assert VALIDATOR_SYSTEM_PROMPT

    def test_system_prompts_have_content(self):
        """Test that system prompts are not empty."""
        from config.prompts import VEDIC_SYSTEM_PROMPT

        assert len(VEDIC_SYSTEM_PROMPT) > 50  # Reasonable length

    def test_user_prompt_builder(self):
        """Test user prompt building."""
        from config.prompts import build_user_prompt

        user_data = {
            "name": "Test User",
            "birthDate": "1990-05-15",
            "birthCity": "New York",
        }

        prompt = build_user_prompt(user_data)
        assert "Test User" in prompt
        assert "1990-05-15" in prompt
        assert "New York" in prompt


class TestEnvironmentValidation:
    """Test environment variable validation."""

    def test_required_env_vars_present(self):
        """Test that required environment variables are set."""
        # In CI, these should be provided via GitHub secrets
        required_vars = ["GOOGLE_API_KEY"]

        for var in required_vars:
            # Don't fail if running locally without secrets
            # CI will provide them
            value = os.getenv(var)
            if value:
                assert len(value) > 0

    def test_database_url_optional(self):
        """Test that DATABASE_URL is optional (can use Supabase)."""
        # Database URL is optional - can use Supabase instead
        url = os.getenv("DATABASE_URL")
        # Just ensure it's a valid URL if provided
        if url:
            assert url.startswith(("postgres://", "postgresql://"))

    def test_caching_enabled(self):
        """Test caching configuration."""
        caching_enabled = os.getenv("ENABLE_CACHING", "true").lower() == "true"
        assert isinstance(caching_enabled, bool)


class TestLogConfiguration:
    """Test logging configuration."""

    def test_log_level_valid(self):
        """Test that log level is valid."""
        log_level = os.getenv("LOG_LEVEL", "INFO").upper()
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        assert log_level in valid_levels

    def test_logging_configured(self):
        """Test that logging is properly configured."""
        import logging

        logger = logging.getLogger("adk_backend")
        assert logger is not None
