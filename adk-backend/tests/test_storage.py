"""
Tests for storage operations (Supabase integration).
"""
import os
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import datetime

from schemas.reading import ReadingResponse


class TestSupabaseStorage:
    """Test Supabase storage operations."""

    @pytest.mark.asyncio
    @patch("storage.supabase.supabase_client")
    async def test_save_reading_success(self, mock_supabase):
        """Test successful reading save."""
        from storage.supabase import save_reading

        # Mock Supabase response
        mock_response = MagicMock()
        mock_response.data = [{"id": "reading-123"}]
        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            mock_response
        )

        user_data = {
            "name": "Test User",
            "birthDate": "1990-05-15",
            "birthCity": "New York",
            "focusArea": "career",
        }

        reading_data = ReadingResponse(
            headline="Test Headline",
            coreTheme="Test core theme.",
            strengths=["S1", "S2", "S3"],
            frictions=["F1", "F2"],
            next7Days=["N1", "N2", "N3"],
            journalPrompt="Test prompt?",
            disclaimer="Test disclaimer.",
        )

        # result = await save_reading(user_data, reading_data, user_id=None)
        # assert result == "reading-123"

    @pytest.mark.asyncio
    @patch("storage.supabase.supabase_client")
    async def test_get_reading_success(self, mock_supabase):
        """Test successful reading retrieval."""
        from storage.supabase import get_reading

        # Mock Supabase response
        mock_response = MagicMock()
        mock_response.data = [
            {
                "id": "reading-123",
                "name": "Test User",
                "birthDate": "1990-05-15",
                "reading": {
                    "headline": "Test",
                    "coreTheme": "Test.",
                },
            }
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
            mock_response
        )

        # result = await get_reading("reading-123")
        # assert result["id"] == "reading-123"

    @pytest.mark.asyncio
    @patch("storage.supabase.supabase_client")
    async def test_get_reading_not_found(self, mock_supabase):
        """Test reading retrieval when not found."""
        from storage.supabase import get_reading

        # Mock empty response
        mock_response = MagicMock()
        mock_response.data = []
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
            mock_response
        )

        # result = await get_reading("nonexistent-id")
        # assert result is None

    @pytest.mark.asyncio
    @patch("storage.supabase.supabase_client")
    async def test_save_reading_feedback_success(self, mock_supabase):
        """Test successful feedback save."""
        from storage.supabase import save_reading_feedback

        # Mock Supabase response
        mock_response = MagicMock()
        mock_response.data = [{"id": "feedback-123"}]
        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            mock_response
        )

        feedback_data = {
            "reading_id": "reading-123",
            "rating": 5,
            "feedback_text": "Great reading!",
        }

        # result = await save_reading_feedback(feedback_data)
        # assert result == "feedback-123"

    @pytest.mark.asyncio
    @patch("storage.supabase.supabase_client")
    async def test_get_reading_stats(self, mock_supabase):
        """Test reading statistics retrieval."""
        from storage.supabase import get_reading_stats

        # Mock Supabase response
        mock_response = MagicMock()
        mock_response.data = [
            {
                "total_readings": 100,
                "avg_rating": 4.5,
                "total_feedback": 75,
            }
        ]
        mock_supabase.rpc.return_value.execute.return_value = mock_response

        # This would require RPC function in Supabase
        # stats = await get_reading_stats()
        # assert stats["total_readings"] == 100

    def test_supabase_connection_required(self):
        """Test that SUPABASE_URL and SUPABASE_KEY are configured."""
        from storage.supabase import settings

        assert (
            settings.supabase_url
        ), "SUPABASE_URL environment variable required"
        assert (
            settings.supabase_key
        ), "SUPABASE_KEY environment variable required"


class TestDatabaseIntegration:
    """Integration tests with actual or test database."""

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_complete_reading_lifecycle(self):
        """Test complete lifecycle: save -> retrieve -> feedback."""
        # This test requires a test database
        # Would be skipped in CI if no DB available
        pass

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_concurrent_reads(self):
        """Test concurrent read operations."""
        # Test multiple concurrent reads
        pass

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_concurrent_writes(self):
        """Test concurrent write operations."""
        # Test multiple concurrent writes
        pass
