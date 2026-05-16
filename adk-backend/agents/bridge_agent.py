"""
Bridge agent — ported from lib/bridge.ts
Preserves all prompts, persona, paywall logic, and temperature settings exactly.
"""

import json
import logging
from openai import AsyncOpenAI
from config.settings import settings
from schemas.bridge import (
    BridgeQuestionnaireData, BridgeReport,
    BridgeChatMessage, BridgeState
)

logger = logging.getLogger(__name__)


def get_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url or None,
    )


# ── Prompt helpers — ported exactly from bridge.ts ───────────────────────────

def describe_questionnaire(data: BridgeQuestionnaireData) -> str:
    """Port of describeQuestionnaire() from bridge.ts"""
    consistency_map = {
        "very_consistent": "highly disciplined with routines, rarely deviates",
        "somewhat_consistent": "generally follows routines but with occasional lapses",
        "inconsistent": "struggles to maintain routines, frequently breaks them",
        "chaotic": "has no stable routines, operates reactively",
    }
    decision_map = {
        "analytical": "makes decisions through careful analysis and data",
        "intuitive": "relies on gut feeling and instinct when deciding",
        "collaborative": "seeks input from others before making decisions",
        "avoidant": "tends to delay or avoid making decisions",
    }
    goal_map = {
        "crystal_clear": "extremely clear about current goals and direction",
        "mostly_clear": "has a general sense of direction but some uncertainty",
        "foggy": "goals feel unclear and undefined",
        "no_goals": "currently has no articulated goals",
    }
    state_map = {
        "stuck": "feeling stuck and unable to move forward",
        "overwhelmed": "feeling overwhelmed by demands and expectations",
        "restless": "feeling restless and craving change",
        "numb": "feeling emotionally numb or disconnected",
        "conflicted": "experiencing internal conflict between competing desires",
    }

    lines = [
        f"Consistency profile: {consistency_map.get(data.consistency, data.consistency)}",
        f"Decision style: {decision_map.get(data.decisionStyle, data.decisionStyle)}",
        f"Goal clarity: {goal_map.get(data.goalClarity, data.goalClarity)}",
        f"Current emotional state: {state_map.get(data.currentState, data.currentState)}",
        f'Where they feel most stuck: "{data.stuckDescription}"',
    ]
    if data.name:
        lines.append(f"Name: {data.name}")

    return "\n".join(lines)


def build_bridge_system_prompt() -> str:
    """Port of buildBridgeSystemPrompt() from bridge.ts — preserved verbatim."""
    return """You are "Bridge," the premium, interactive psychological navigator embedded within the InsightBridge app. You are currently operating within the "Behavioral Patterns" add-on feature.

Your purpose is to help users who feel stuck by providing deep, narrative-driven clarity based on their questionnaire inputs regarding consistency, decision style, and goal clarity.

Tone and Persona:
- You must completely avoid sounding like a standard AI.
- Never use phrases like "As an AI," "Here is your report," "Let's dive in," or "In conclusion."
- Your tone is human, observant, grounded, and premium — like a highly sought-after executive coach.
- You speak in quiet revelations, creating a sense of psychological satisfaction and forward movement.
- You operate with strict boundaries. If a user exhibits severe distress, you must gently redirect them to a human professional: "I can help you navigate behavioral patterns, but for clinical support, please connect with a licensed therapist."

Hard Rules:
- Do NOT predict the future
- Do NOT give medical, legal, or financial advice
- Do NOT use motivational clichés
- Do NOT sound robotic or formulaic
- Each response should feel like a one-of-a-kind observation"""


# ── Generate initial Bridge report ───────────────────────────────────────────

async def generate_bridge_report(data: BridgeQuestionnaireData) -> BridgeReport:
    """Port of generateBridgeReport() from bridge.ts"""
    client = get_client()
    user_summary = describe_questionnaire(data)

    system_prompt = build_bridge_system_prompt() + """

You are in the "generating_initial_report" state.

Output ONLY the following structured JSON based on the user's questionnaire data. Do not add conversational filler.

{
  "coreTheme": "3-4 word title reflecting their central tension",
  "pastPattern": "1-2 sentences identifying their historical default based on their consistency and decision style patterns",
  "currentPhase": "1-2 sentences identifying their present friction based on their current state and goal clarity",
  "emergingDirection": "1-2 sentences projecting their trajectory if current patterns continue",
  "plusQuestion": "One bold, reflective question (e.g., 'What are you actually optimizing for?')",
  "plusAnswer": "A highly specific 2-sentence answer based on their data"
}

CRITICAL: Output ONLY valid JSON. No markdown. No commentary. No extra text."""

    user_prompt = f"Generate a Behavioral Patterns report for this user:\n\n{user_summary}"

    completion = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.35,
        response_format={"type": "json_object"},
    )

    content = completion.choices[0].message.content
    if not content:
        raise ValueError("No content in Bridge report response")

    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json\n", "").replace("```\n", "").replace("```", "")

    return BridgeReport(**json.loads(cleaned.strip()))


# ── Bridge chat with paywall ──────────────────────────────────────────────────

async def bridge_chat(
    message: str,
    questionnaire_data: BridgeQuestionnaireData,
    report_data: BridgeReport,
    chat_history: list[BridgeChatMessage],
    question_count: int,
) -> tuple[str, str]:
    """
    Port of bridgeChat() from bridge.ts.
    Returns (reply, state) — state is 'bridge_free_chat' or 'paywall_reached'.
    """
    client = get_client()
    is_paywall = question_count >= 3
    state = "paywall_reached" if is_paywall else "bridge_free_chat"
    user_summary = describe_questionnaire(questionnaire_data)

    if is_paywall:
        state_instruction = """You are in the "paywall_reached" state.

The user has exhausted their free questions. You must enforce the premium boundary gently but firmly.

Output a very brief (1 sentence) partial insight to their question, followed EXACTLY by this text on a new line:

"We've reached the edge of our initial exploration. To get a complete breakdown of your behavioral tendencies, decision blind spots, and a 7-day micro-focus plan, unlock your Deep Pattern Report for $3.99. We're building this to help people who feel stuck, and this supports our continued work.\""""
    else:
        state_instruction = """You are in the "bridge_free_chat" state. You are in a direct conversation with the user.

Rules:
1. Validate their question thoughtfully.
2. Provide practical, highly personalized clarity based on their initial report data.
3. Keep the response concise, premium, and actionable. Do not overwhelm them with text.
4. Never exceed 3-4 sentences."""

    system_prompt = build_bridge_system_prompt() + f"""

{state_instruction}

Context — User's Questionnaire Data:
{user_summary}

Context — User's Initial Report:
Core Theme: {report_data.coreTheme}
Past Pattern: {report_data.pastPattern}
Current Phase: {report_data.currentPhase}
Emerging Direction: {report_data.emergingDirection}"""

    messages = [{"role": "system", "content": system_prompt}]

    # Add chat history — bridge role maps to "assistant"
    for msg in chat_history:
        messages.append({
            "role": "assistant" if msg.role == "bridge" else "user",
            "content": msg.content,
        })

    messages.append({"role": "user", "content": message})

    completion = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=0.35,
        max_tokens=400,
    )

    reply = completion.choices[0].message.content or ""
    if not reply:
        raise ValueError("No content in Bridge chat response")

    return reply, state