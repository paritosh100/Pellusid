"""
InsightBridge — adk-backend/main.py
=====================================
UPDATED: Adds 4 new routes to absorb the Next.js API routes.
Your existing ADK routes (/adk/*) are preserved exactly — nothing removed.

New routes added:
  POST /api/generate-reading     ← absorbs app/api/generate-reading/route.ts
  POST /api/answer-prompt        ← absorbs app/api/answer-prompt/route.ts
  POST /api/bridge/generate-report ← absorbs app/api/bridge/generate-report/route.ts
  POST /api/bridge/chat          ← absorbs app/api/bridge/chat/route.ts
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio
import json

# ── Existing ADK imports (unchanged) ─────────────────────────────────────────
from agents.orchestrator import run_reading_workflow, run_journal_answer_workflow
from agents.hybrid_orchestrator import run_hybrid_reading
from config.settings import settings

# ── New imports ───────────────────────────────────────────────────────────────
from schemas.reading import (
    GenerateReadingRequest,
    AnswerPromptRequest,
    UserInput,
)
from schemas.bridge import (
    BridgeQuestionnaireData,
    BridgeReport,
    BridgeChatMessage,
    BridgeChatRequest,
)
from agents.reading_agent import generate_reading, generate_stealth_reading
from agents.bridge_agent import generate_bridge_report, bridge_chat
from storage.supabase import (
    save_reading,
    save_stealth_reading,
    get_reading,
    get_stealth_reading,
    get_any_reading,
    save_journal_response,
)

app = FastAPI(title="InsightBridge ADK Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://insightbridge.app",
        "https://www.insightbridge.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "alive", "version": "2.0.0"}


# =============================================================================
# EXISTING ADK ROUTES — PRESERVED EXACTLY
# Your Next.js adk-client.ts calls these. Don't touch.
# =============================================================================

class ADKReadingRequest(BaseModel):
    name: str
    birthDate: str
    birthTime: Optional[str] = None
    birthCity: str
    focusArea: Optional[str] = None


@app.post("/adk/reading")
async def adk_generate_reading(request: ADKReadingRequest):
    """Existing ADK reading endpoint — unchanged."""
    try:
        user_data = {
            "name": request.name,
            "birthDate": request.birthDate,
            "birthTime": request.birthTime or "12:00",
            "birthCity": request.birthCity,
            "focusArea": request.focusArea or "general life patterns",
        }
        result = await run_reading_workflow(user_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/adk/journal-answer")
async def adk_journal_answer(request: dict):
    """Existing ADK journal answer endpoint — unchanged."""
    try:
        result = await run_journal_answer_workflow(
            journal_prompt=request.get("journalPrompt", ""),
            user_data=request,
        )
        return {"answer": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# NEW ROUTES — absorb Next.js API routes
# Next.js routes become thin proxies pointing here.
# =============================================================================

def _extract_user_id(authorization: Optional[str]) -> Optional[str]:
    """
    Extract user ID from Supabase JWT passed via Authorization header.
    Returns None if not authenticated (anonymous reading).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        from supabase import create_client
        client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        token = authorization.replace("Bearer ", "")
        user = client.auth.get_user(token)
        return user.user.id if user and user.user else None
    except Exception:
        return None


@app.post("/api/generate-reading")
async def api_generate_reading(
    request: GenerateReadingRequest,
    authorization: Optional[str] = Header(default=None),
):
    """
    Absorbs app/api/generate-reading/route.ts (134 LOC → this handler).

    Handles both normal and stealth modes.
    Routes on request.mode == "stealth".
    Saves to Supabase, returns readingId + reading.
    """
    user_id = _extract_user_id(authorization)

    inputs = UserInput(
        name=request.name,
        birthDate=request.birthDate,
        birthTime=request.birthTime,
        birthCity=request.birthCity,
        focusArea=request.focusArea,
        mode=request.mode,
    )

    try:
        if request.mode == "stealth":
            reading = await generate_stealth_reading(inputs)
            reading_id = await save_stealth_reading(inputs, reading, user_id)
            return {
                "readingId": reading_id,
                "reading": reading.model_dump(),
                "mode": "stealth",
            }
        else:
            reading = await generate_reading(inputs)
            reading_id = await save_reading(inputs, reading, user_id)
            return {
                "readingId": reading_id,
                "reading": reading.model_dump(),
                "mode": "normal",
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/answer-prompt")
async def api_answer_prompt(
    request: AnswerPromptRequest,
    authorization: Optional[str] = Header(default=None),
):
    """
    Absorbs app/api/answer-prompt/route.ts (311 LOC → this handler).
    Uses existing run_journal_answer_workflow from your orchestrator.
    """
    user_data = {
        "name": request.name,
        "birthDate": request.birthDate,
        "birthCity": request.birthCity,
        "focusArea": request.focusArea or "general reflection",
    }

    try:
        answer = await run_journal_answer_workflow(
            journal_prompt=request.journalPrompt,
            user_data=user_data,
        )

        # Save response to Supabase (mirrors the TS route behaviour)
        await save_journal_response(
            reading_id=request.readingId,
            journal_prompt=request.journalPrompt,
            accepted=True,
            answer=answer,
            is_custom=request.isCustom,
        )

        return {"answer": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bridge/generate-report")
async def api_bridge_generate_report(
    data: BridgeQuestionnaireData,
    authorization: Optional[str] = Header(default=None),
):
    """
    Absorbs app/api/bridge/generate-report/route.ts (54 LOC → this handler).
    """
    try:
        report = await generate_bridge_report(data)
        return report.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bridge/chat")
async def api_bridge_chat(
    request: BridgeChatRequest,
    authorization: Optional[str] = Header(default=None),
):
    """
    Absorbs app/api/bridge/chat/route.ts (78 LOC → this handler).
    """
    try:
        reply, state = await bridge_chat(
            message=request.message,
            questionnaire_data=request.questionnaireData,
            report_data=request.reportData,
            chat_history=request.chatHistory,
            question_count=request.questionCount,
        )
        return {"reply": reply, "state": state}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Reading retrieval (needed by Next.js result pages) ───────────────────────

@app.get("/api/reading/{reading_id}")
async def api_get_reading(reading_id: str):
    """Get any reading by ID — tries normal then stealth."""
    result = await get_any_reading(reading_id)
    if not result:
        raise HTTPException(status_code=404, detail="Reading not found")
    return result.model_dump()


# ── Hybrid reading (Gemini thinking + OpenAI refinement) ─────────────────────

@app.post("/api/generate-reading-hybrid")
async def api_generate_reading_hybrid(
    request: GenerateReadingRequest,
    authorization: Optional[str] = Header(default=None),
):
    """
    Hybrid orchestrator endpoint.
    Phase 1: 6 tools (pure Python)
    Phase 2: Gemini thinking model (synthesis + fusion)
    Phase 3: OpenAI (final tone refinement)
    """
    user_id = _extract_user_id(authorization)

    inputs = UserInput(
        name=request.name,
        birthDate=request.birthDate,
        birthTime=request.birthTime,
        birthCity=request.birthCity,
        focusArea=request.focusArea,
        mode=request.mode,
    )

    try:
        reading = await run_hybrid_reading(inputs)
        reading_id = await save_reading(inputs, reading, user_id)
        return {
            "readingId": reading_id,
            "reading": reading.model_dump(),
            "mode": "hybrid",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))