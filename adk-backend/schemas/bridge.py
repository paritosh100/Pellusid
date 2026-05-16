"""
Bridge schemas — ported from lib/bridge-types.ts
"""

from pydantic import BaseModel
from typing import Optional, Literal


# ── Questionnaire input ───────────────────────────────────────────────────────

class BridgeQuestionnaireData(BaseModel):
    consistency: Literal["very_consistent", "somewhat_consistent", "inconsistent", "chaotic"]
    decisionStyle: Literal["analytical", "intuitive", "collaborative", "avoidant"]
    goalClarity: Literal["crystal_clear", "mostly_clear", "foggy", "no_goals"]
    currentState: Literal["stuck", "overwhelmed", "restless", "numb", "conflicted"]
    stuckDescription: str
    name: Optional[str] = None


# ── Report output ─────────────────────────────────────────────────────────────

class BridgeReport(BaseModel):
    coreTheme: str
    pastPattern: str
    currentPhase: str
    emergingDirection: str
    plusQuestion: str
    plusAnswer: str


# ── Chat ──────────────────────────────────────────────────────────────────────

class BridgeChatMessage(BaseModel):
    role: Literal["user", "bridge"]
    content: str


class BridgeChatRequest(BaseModel):
    message: str
    questionnaireData: BridgeQuestionnaireData
    reportData: BridgeReport
    chatHistory: list[BridgeChatMessage] = []
    questionCount: int = 0


BridgeState = Literal["generating_initial_report", "bridge_free_chat", "paywall_reached"]


class BridgeChatResponse(BaseModel):
    reply: str
    state: BridgeState

