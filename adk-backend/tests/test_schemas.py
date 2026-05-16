"""
Tests for request/response schema validation.
"""
import pytest
from pydantic import ValidationError

from schemas.reading import (
    GenerateReadingRequest,
    ReadingResponse,
    StealthReadingResponse,
    StealthSummary,
)
from schemas.bridge import (
    BridgeQuestionnaireData,
    BridgeReport,
    BridgeChatRequest,
)


class TestReadingSchemas:
    """Test reading request and response schemas."""

    def test_generate_reading_request_valid(self):
        """Test valid GenerateReadingRequest."""
        data = {
            "name": "John Doe",
            "birthDate": "1990-05-15",
            "birthCity": "New York",
            "focusArea": "career",
        }
        request = GenerateReadingRequest(**data)
        assert request.name == "John Doe"
        assert request.birthDate == "1990-05-15"
        assert request.birthCity == "New York"
        assert request.focusArea == "career"

    def test_generate_reading_request_optional_fields(self):
        """Test GenerateReadingRequest with optional fields."""
        data = {
            "name": "Jane Doe",
            "birthDate": "1995-03-20",
            "birthCity": "London",
        }
        request = GenerateReadingRequest(**data)
        assert request.focusArea is None
        assert request.birthTime is None

    def test_generate_reading_request_invalid_date(self):
        """Test GenerateReadingRequest with invalid date."""
        data = {
            "name": "Invalid User",
            "birthDate": "invalid-date",
            "birthCity": "City",
        }
        with pytest.raises(ValidationError):
            GenerateReadingRequest(**data)

    def test_generate_reading_request_missing_required(self):
        """Test GenerateReadingRequest with missing required fields."""
        data = {"name": "Incomplete User"}
        with pytest.raises(ValidationError):
            GenerateReadingRequest(**data)

    def test_reading_response_valid(self):
        """Test valid ReadingResponse."""
        data = {
            "headline": "Test Headline",
            "coreTheme": "Core theme test.",
            "strengths": ["Strength 1", "Strength 2", "Strength 3"],
            "frictions": ["Friction 1", "Friction 2"],
            "next7Days": ["Action 1", "Action 2", "Action 3"],
            "journalPrompt": "Test question?",
            "disclaimer": "Disclaimer text.",
        }
        response = ReadingResponse(**data)
        assert response.headline == "Test Headline"
        assert len(response.strengths) == 3
        assert len(response.frictions) == 2

    def test_reading_response_invalid_arrays(self):
        """Test ReadingResponse with invalid array lengths."""
        data = {
            "headline": "Test",
            "coreTheme": "Test core theme.",
            "strengths": ["Only one strength"],  # Should be 3
            "frictions": ["Only one friction"],  # Should be 2
            "next7Days": ["Action 1", "Action 2"],  # Should be 3
            "journalPrompt": "Test?",
            "disclaimer": "Test.",
        }
        with pytest.raises(ValidationError):
            ReadingResponse(**data)

    def test_stealth_reading_response_valid(self):
        """Test valid StealthReadingResponse."""
        summary = StealthSummary(
            dominantPattern="Pattern",
            careerWorkStyle="Work style",
            decisionAlignment="Alignment",
        )
        data = {
            "whereYouveBeen": "Past description",
            "whereYouAre": "Present description",
            "direction": "Future direction",
            "summary": summary,
            "closingNudge": "Final nudge",
        }
        response = StealthReadingResponse(**data)
        assert response.whereYouveBeen == "Past description"
        assert response.summary.dominantPattern == "Pattern"


class TestBridgeSchemas:
    """Test bridge questionnaire and report schemas."""

    def test_bridge_questionnaire_valid(self):
        """Test valid BridgeQuestionnaireData."""
        data = {
            "consistency": "very_consistent",
            "decisionStyle": "analytical",
            "goalClarity": "very_clear",
            "currentState": "moving_forward",
            "stuckDescription": None,
        }
        questionnaire = BridgeQuestionnaireData(**data)
        assert questionnaire.consistency == "very_consistent"
        assert questionnaire.currentState == "moving_forward"

    def test_bridge_questionnaire_invalid_enum(self):
        """Test BridgeQuestionnaireData with invalid enum value."""
        data = {
            "consistency": "invalid_value",
            "decisionStyle": "analytical",
            "goalClarity": "clear",
            "currentState": "stuck",
            "stuckDescription": "Stuck details",
        }
        with pytest.raises(ValidationError):
            BridgeQuestionnaireData(**data)

    def test_bridge_report_valid(self):
        """Test valid BridgeReport."""
        data = {
            "coreTheme": "Bridge theme",
            "pastPattern": "Past pattern",
            "currentPhase": "Current phase",
            "emergingDirection": "Emerging direction",
            "plusQuestion": "Plus question?",
            "plusAnswer": "Plus answer.",
        }
        report = BridgeReport(**data)
        assert report.coreTheme == "Bridge theme"
        assert report.plusQuestion == "Plus question?"

    def test_bridge_chat_request_valid(self):
        """Test valid BridgeChatRequest."""
        data = {
            "message": "What should I do?",
            "questionnaireData": {
                "consistency": "somewhat_consistent",
                "decisionStyle": "analytical",
                "goalClarity": "foggy",
                "currentState": "stuck",
                "stuckDescription": "Feeling stuck",
            },
            "reportData": {
                "coreTheme": "Theme",
                "pastPattern": "Pattern",
                "currentPhase": "Phase",
                "emergingDirection": "Direction",
                "plusQuestion": "Question?",
                "plusAnswer": "Answer.",
            },
            "chatHistory": [],
            "questionCount": 1,
        }
        chat_request = BridgeChatRequest(**data)
        assert chat_request.message == "What should I do?"
        assert chat_request.questionCount == 1

    def test_bridge_chat_request_with_history(self):
        """Test BridgeChatRequest with chat history."""
        history = [
            {"role": "user", "content": "First question?"},
            {"role": "assistant", "content": "First answer."},
        ]
        data = {
            "message": "Follow up question?",
            "questionnaireData": {
                "consistency": "somewhat_consistent",
                "decisionStyle": "analytical",
                "goalClarity": "foggy",
                "currentState": "stuck",
                "stuckDescription": "Feeling stuck",
            },
            "reportData": {
                "coreTheme": "Theme",
                "pastPattern": "Pattern",
                "currentPhase": "Phase",
                "emergingDirection": "Direction",
                "plusQuestion": "Question?",
                "plusAnswer": "Answer.",
            },
            "chatHistory": history,
            "questionCount": 2,
        }
        chat_request = BridgeChatRequest(**data)
        assert len(chat_request.chatHistory) == 2
        assert chat_request.questionCount == 2
