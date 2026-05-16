"""
Reading schemas — ported from lib/types.ts
Matches your existing Supabase table columns exactly.
"""

from pydantic import BaseModel
from typing import Optional


# ── Input ─────────────────────────────────────────────────────────────────────

class UserInput(BaseModel):
    name: str
    birthDate: str                  # "YYYY-MM-DD"
    birthTime: Optional[str] = None # "HH:MM" 24h
    birthCity: str
    focusArea: Optional[str] = None
    mode: Optional[str] = None      # "stealth" | None


# ── Normal reading response ───────────────────────────────────────────────────

class ReadingResponse(BaseModel):
    headline: str
    coreTheme: str
    strengths: list[str]            # exactly 3
    frictions: list[str]            # exactly 2
    next7Days: list[str]            # exactly 3
    journalPrompt: str
    disclaimer: str


# ── Stealth reading response ──────────────────────────────────────────────────

class StealthSummary(BaseModel):
    dominantPattern: str
    careerWorkStyle: str
    decisionAlignment: str


class StealthReadingResponse(BaseModel):
    whereYouveBeen: str
    whereYouAre: str
    direction: str
    summary: StealthSummary
    closingNudge: str


# ── Stored readings (mirror Supabase rows) ────────────────────────────────────

class StoredReading(BaseModel):
    readingId: str
    inputs: UserInput
    reading: ReadingResponse
    timestamp: int


class StealthStoredReading(BaseModel):
    readingId: str
    inputs: UserInput
    reading: StealthReadingResponse
    timestamp: int
    mode: str = "stealth"


# ── API request/response wrappers ─────────────────────────────────────────────

class GenerateReadingRequest(BaseModel):
    name: str
    birthDate: str
    birthTime: Optional[str] = None
    birthCity: str
    focusArea: Optional[str] = None
    mode: Optional[str] = None      # "stealth" triggers stealth flow
    userId: Optional[str] = None


class GenerateReadingResponse(BaseModel):
    readingId: str
    reading: ReadingResponse | StealthReadingResponse
    mode: str = "normal"


class AnswerPromptRequest(BaseModel):
    readingId: str
    journalPrompt: str
    isCustom: bool = False
    # User context needed for answer generation
    name: str
    birthDate: str
    birthCity: str
    focusArea: Optional[str] = None


class AnswerPromptResponse(BaseModel):
    answer: str