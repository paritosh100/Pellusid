import os
import sys

# Ensure adk-backend is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock

from main import app
from schemas.reading import ReadingResponse, StealthReadingResponse, StealthSummary
from schemas.bridge import BridgeReport

pytestmark = pytest.mark.asyncio

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

# --- Fake Data for Mocking ---
        
fake_reading = ReadingResponse(
    headline="Test Headline",
    coreTheme="Core theme test.",
    strengths=["S1", "S2", "S3"],
    frictions=["F1", "F2"],
    next7Days=["N1", "N2", "N3"],
    journalPrompt="Test Prompt?",
    disclaimer="Test disclaimer."
)

fake_stealth_reading = StealthReadingResponse(
    whereYouveBeen="Past",
    whereYouAre="Present",
    direction="Future",
    summary=StealthSummary(
        dominantPattern="Pattern",
        careerWorkStyle="Work",
        decisionAlignment="Alignment"
    ),
    closingNudge="Nudge"
)

fake_bridge_report = BridgeReport(
    coreTheme="Bridge Theme",
    pastPattern="Past",
    currentPhase="Current",
    emergingDirection="Direction",
    plusQuestion="Question?",
    plusAnswer="Answer."
)


# --- Tests ---

@patch("main.generate_reading", new_callable=AsyncMock)
@patch("main.save_reading", new_callable=AsyncMock)
async def test_generate_reading_normal_mode(mock_save, mock_generate, client):
    """
    Test 1. /api/generate-reading (normal mode)
    """
    mock_generate.return_value = fake_reading
    mock_save.return_value = "fake-reading-id-123"

    payload = {
        "name": "Alex",
        "birthDate": "1990-01-01",
        "birthCity": "New York",
        "mode": "normal"
    }

    # Pass Authorization header to simulate authenticated user if needed
    headers = {"Authorization": "Bearer fake_token"}

    response = await client.post("/api/generate-reading", json=payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["readingId"] == "fake-reading-id-123"
    assert data["mode"] == "normal"
    assert data["reading"]["headline"] == "Test Headline"
    
    mock_generate.assert_called_once()
    mock_save.assert_called_once()


@patch("main.generate_stealth_reading", new_callable=AsyncMock)
@patch("main.save_stealth_reading", new_callable=AsyncMock)
async def test_generate_reading_stealth_mode(mock_save, mock_generate, client):
    """
    Test 2. /api/generate-reading (stealth mode)
    """
    mock_generate.return_value = fake_stealth_reading
    mock_save.return_value = "fake-stealth-id-456"

    payload = {
        "name": "Sam",
        "birthDate": "1992-02-02",
        "birthCity": "London",
        "mode": "stealth"
    }

    response = await client.post("/api/generate-reading", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["readingId"] == "fake-stealth-id-456"
    assert data["mode"] == "stealth"
    assert data["reading"]["whereYouveBeen"] == "Past"
    
    mock_generate.assert_called_once()
    mock_save.assert_called_once()


@patch("main.generate_bridge_report", new_callable=AsyncMock)
async def test_bridge_generate_report(mock_generate, client):
    """
    Test 3. /api/bridge/generate-report
    """
    mock_generate.return_value = fake_bridge_report

    payload = {
        "consistency": "somewhat_consistent",
        "decisionStyle": "analytical",
        "goalClarity": "foggy",
        "currentState": "stuck",
        "stuckDescription": "Just feeling completely paused."
    }

    response = await client.post("/api/bridge/generate-report", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["coreTheme"] == "Bridge Theme"
    
    mock_generate.assert_called_once()


@patch("main.bridge_chat", new_callable=AsyncMock)
async def test_bridge_chat_free(mock_chat, client):
    """
    Test 4. /api/bridge/chat (free, question_count=1)
    """
    # Returns (reply, state)
    mock_chat.return_value = ("Here is your free reply.", "bridge_free_chat")

    payload = {
        "message": "Why am I stuck?",
        "questionnaireData": {
            "consistency": "somewhat_consistent",
            "decisionStyle": "analytical",
            "goalClarity": "foggy",
            "currentState": "stuck",
            "stuckDescription": "stuck"
        },
        "reportData": fake_bridge_report.model_dump(),
        "chatHistory": [],
        "questionCount": 1
    }

    response = await client.post("/api/bridge/chat", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == "Here is your free reply."
    assert data["state"] == "bridge_free_chat"
    
    mock_chat.assert_called_once()


@patch("main.bridge_chat", new_callable=AsyncMock)
async def test_bridge_chat_paywall(mock_chat, client):
    """
    Test 5. /api/bridge/chat (paywall, question_count=3)
    """
    mock_chat.return_value = (
        "We've reached the edge... unlock your Deep Pattern Report for $3.99.", 
        "paywall_reached"
    )

    payload = {
        "message": "Give me more info.",
        "questionnaireData": {
            "consistency": "somewhat_consistent",
            "decisionStyle": "analytical",
            "goalClarity": "foggy",
            "currentState": "stuck",
            "stuckDescription": "stuck"
        },
        "reportData": fake_bridge_report.model_dump(),
        "chatHistory": [],
        "questionCount": 3
    }

    response = await client.post("/api/bridge/chat", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "unlock your Deep Pattern Report" in data["reply"]
    assert data["state"] == "paywall_reached"
    
    mock_chat.assert_called_once()
