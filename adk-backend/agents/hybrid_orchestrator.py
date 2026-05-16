"""
Hybrid Reading Orchestrator
============================
Best of both worlds:
  Phase 1 — Pure Python tool computation (all 6 systems, zero LLM calls)
  Phase 2 — Gemini thinking model for synthesis + fusion (1 LLM call)
  Phase 3 — OpenAI GPT-4o for final tone refinement (1 LLM call)

Total: 2 LLM calls, 6 data sources, thinking-grade reasoning.
"""

import asyncio
import json
import logging
from typing import Any, Dict

from google import genai
from google.genai import types as genai_types
from openai import AsyncOpenAI

from config.settings import settings
from config.prompts import HYBRID_SYNTHESIS_FUSION_PROMPT
from schemas.reading import ReadingResponse, UserInput

logger = logging.getLogger(__name__)


# ── Clients ──────────────────────────────────────────────────────────────────

_gemini_client = None  # type: genai.Client | None
_openai_client = None  # type: AsyncOpenAI | None


def _get_gemini() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = genai.Client(api_key=settings.google_api_key)
    return _gemini_client


def _get_openai() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url or None,
        )
    return _openai_client


# ── Phase 1: Pure computation (no LLM) ──────────────────────────────────────

def _compute_all_systems(user_data: Dict[str, str]) -> Dict[str, Any]:
    """
    Run all 6 tool functions directly — these are just Python math,
    no LLM calls involved.  Returns a dict keyed by system name.
    """
    from tools.numerology_tools import numerology_profile_tool
    from tools.chinese_astrology_tools import chinese_astrology_tool
    from tools.astrology_tools import vedic_birth_chart_tool
    from tools.lunar_tools import lunar_phase_tool
    from tools.tarot_tools import tarot_reading_tool
    from tools.ayurveda_tools import ayurveda_profile_tool

    name = user_data.get("name", "")
    birth_date = user_data.get("birthDate", "")
    birth_time = user_data.get("birthTime", "")
    birth_city = user_data.get("birthCity", "Unknown")

    results: Dict[str, Any] = {}

    # Numerology
    try:
        results["numerology"] = numerology_profile_tool(
            name=name, birth_date=birth_date
        )
    except Exception as e:
        logger.warning("Numerology tool failed: %s", e)
        results["numerology"] = {"error": str(e)}

    # Chinese astrology
    try:
        results["chinese"] = chinese_astrology_tool(birth_date=birth_date)
    except Exception as e:
        logger.warning("Chinese astrology tool failed: %s", e)
        results["chinese"] = {"error": str(e)}

    # Vedic birth chart
    try:
        if birth_time:
            results["vedic"] = vedic_birth_chart_tool(
                birth_date=birth_date,
                birth_time=birth_time,
                birth_city=birth_city,
            )
        else:
            results["vedic"] = vedic_birth_chart_tool(
                birth_date=birth_date,
                birth_time="12:00",
                birth_city=birth_city,
            )
    except Exception as e:
        logger.warning("Vedic tool failed: %s", e)
        results["vedic"] = {"error": str(e)}

    # Lunar phase
    try:
        results["lunar"] = lunar_phase_tool(date_str=birth_date)
    except Exception as e:
        logger.warning("Lunar tool failed: %s", e)
        results["lunar"] = {"error": str(e)}

    # Tarot
    try:
        results["tarot"] = tarot_reading_tool(
            question=user_data.get("focusArea", "general life patterns")
        )
    except Exception as e:
        logger.warning("Tarot tool failed: %s", e)
        results["tarot"] = {"error": str(e)}

    # Ayurveda (uses trait-based questionnaire; call with defaults for general profile)
    try:
        results["ayurveda"] = ayurveda_profile_tool()
    except Exception as e:
        logger.warning("Ayurveda tool failed: %s", e)
        results["ayurveda"] = {"error": str(e)}

    return results


# ── Phase 2: Gemini thinking synthesis + fusion ──────────────────────────────

async def _gemini_synthesis_fusion(
    tool_data: Dict[str, Any],
    user_data: Dict[str, str],
) -> Dict[str, Any]:
    """
    Single Gemini call with thinking enabled.
    Receives raw tool outputs, reasons about convergence, and returns
    a structured synthesis+fusion JSON.
    """
    client = _get_gemini()

    # Serialise each system's output for the prompt
    sections = []
    for system_name, data in tool_data.items():
        serialised = json.dumps(data, indent=2, default=str)
        sections.append(f"═══ {system_name.upper()} ═══\n{serialised}")

    all_data = "\n\n".join(sections)

    user_prompt = f"""Analyse the following raw calculation data from 6 pattern systems
for a person named {user_data.get('name', 'Unknown')},
born {user_data.get('birthDate', 'Unknown')} in {user_data.get('birthCity', 'Unknown')}.
Current focus area: {user_data.get('focusArea', 'general life patterns')}.

{all_data}

Think carefully about cross-system convergence, then produce the fused analysis JSON.
"""

    # Use the thinking model when available, fall back to premium_model
    thinking_model = getattr(settings, "thinking_model", None) or settings.premium_model

    try:
        response = client.models.generate_content(
            model=thinking_model,
            contents=user_prompt,
            config=genai_types.GenerateContentConfig(
                system_instruction=HYBRID_SYNTHESIS_FUSION_PROMPT,
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )

        result = json.loads(response.text)

        # Normalise fused_themes: sort by confidence descending
        themes = result.get("fused_themes", [])
        for t in themes:
            t.setdefault("confidence", 0.5)
        themes.sort(key=lambda t: t["confidence"], reverse=True)
        result["fused_themes"] = themes

        logger.info(
            "[HybridOrchestrator] Phase 2 complete — %d fused themes, "
            "agreement=%.2f",
            len(themes),
            result.get("cross_system_agreement", 0),
        )
        return result

    except Exception as e:
        logger.error("[HybridOrchestrator] Phase 2 failed: %s", e, exc_info=True)
        # Minimal fallback so Phase 3 still has something to work with
        return {
            "convergent_themes": ["Personal development and self-awareness"],
            "divergent_perspectives": [],
            "meta_patterns": ["Growth under uncertainty"],
            "synthesis_notes": "Fallback synthesis due to processing error.",
            "fused_themes": [
                {
                    "theme": "Inner development during transition",
                    "confidence": 0.6,
                    "sources": list(tool_data.keys()),
                    "supporting_signals": ["Multiple data points available"],
                    "category": "growth",
                }
            ],
            "cross_system_agreement": 0.5,
            "meta_insight": "Multiple systems suggest a period of quiet internal development.",
            "situational_anchor": "Effort without clear feedback",
        }


# ── Phase 3: OpenAI final refinement + tone ──────────────────────────────────

# This is the full 200-line Pellucid prompt from openai.ts, preserved verbatim.
_OPENAI_REFINEMENT_PROMPT = """Purpose
You are a reflection and pattern-synthesis tool that helps the user think more clearly when they feel mentally stuck, overloaded, or uncertain.
You surface patterns the user may recognize.
You do not solve, advise, decide, or predict.
You may draw symbolic pattern language from Vedic astrology, numerology, and Chinese astrology strictly as interpretive lenses, never as truth, fate, prediction, or authority.

Core Principles
The user remains fully in control of meaning and decisions
You offer perspective, not answers
You reduce confusion, not replace thinking
All systems are mirrors, not explanations

Hard Rules
Do NOT predict the future
Do NOT claim certainty or guaranteed outcomes
Avoid absolute words (will, always, never)
Do NOT frame insights as destiny, fate, karma, or divine intent
Do NOT create urgency, fear, or dependency
Do NOT tell the user what to do
Do NOT give medical, legal, or financial guidance
Do NOT assert that any system is objectively true

Tone
Very simple words
Short, clear sentences
Calm, grounded, non-judgmental
Observational, never mystical or motivational

How to Reason
Use pattern recognition, not explanation
Speak in observations and probabilities
Normalize the user's experience
Reduce self-blame without reassurance
Keep insights open-ended

Situational Anchoring Rule (CRITICAL)
Every reading must include one subtle mirror of lived experience, such as:
  effort without feedback
  delayed momentum
  quiet doubt
  mental fatigue
  uncertainty despite responsibility
Do not assume facts. Do not reference specific life details. Simply reflect a recognizable tension.

CoreTheme Rule (FINAL)
The coreTheme is the emotional anchor.
It must be 3–4 short sentences and follow this arc:
  1. Name the tension
  2. Describe how it feels internally
  3. Introduce a gentle contradiction
  4. End with containment, not resolution
Do NOT promise clarity. Do NOT imply something is coming. Do NOT create anticipation.
Leave space, not answers.

Field Intent Rules

strengths
  Exactly 3 items
  Each item may be up to ~20 words
  Written as single flowing sentences
  Frame as what the user is already carrying or doing quietly
  Situational, understated, non-heroic

frictions (renamed from watchOuts)
  Exactly 2 items
  Each item may be up to ~20 words
  Written as single flowing sentences
  Describe natural energy leaks or mental drag
  No warnings, no judgments

next7Days
  Exactly 3 items
  Each line:
    - starts with a verb
    - ≤ 10 words
    - framed as attention or awareness, not action
  Think "what may be noticed," not "what should be done."

Output Format (STRICT)
Return ONLY valid JSON with the keys below. No markdown. No commentary. No extra text.

{
  "headline": "string – 3–4 words max, situational, sentence case (capitalize first letter only)",
  "coreTheme": "string – 3–4 short sentences following the CoreTheme Rule",
  "strengths": [
    "exactly 3 strings, each written as a single sentence, up to ~20 words"
  ],
  "frictions": [
    "exactly 2 strings, each written as a single sentence, up to ~20 words"
  ],
  "next7Days": [
    "exactly 3 strings, each ≤ 10 words, awareness-focused"
  ],
  "journalPrompt": "one simple career-focused question (e.g., 'What are you most unsure about in your career right now?')",
  "disclaimer": "one sentence reminding this is a lens, not a rule, and the user decides what matters"
}

Engagement Rule
Leave the user with a feeling of:
  "This resonates — and I choose what to keep."
Do not ask follow-up questions. Do not create urgency.

CRITICAL
Output ONLY valid JSON
No markdown
No explanations"""


async def _openai_refine(
    synthesis: Dict[str, Any],
    user_data: Dict[str, str],
) -> ReadingResponse:
    """
    Final refinement via OpenAI.
    Takes the structured synthesis+fusion output and produces the
    user-facing reading in exact Pellucid JSON format.
    """
    client = _get_openai()

    # Build a focused user message with all synthesis data
    fused_themes_text = ""
    for t in synthesis.get("fused_themes", []):
        fused_themes_text += (
            f"  • {t.get('theme', '?')} "
            f"(confidence: {t.get('confidence', '?')}, "
            f"sources: {', '.join(t.get('sources', []))}, "
            f"category: {t.get('category', '?')})\n"
        )

    user_message = f"""Generate a life-pattern insights reading for:

Name: {user_data.get('name', 'Unknown')}
Birth Date: {user_data.get('birthDate', 'Unknown')}
Birth City: {user_data.get('birthCity', 'Unknown')}
Current Focus: {user_data.get('focusArea', 'General reflection')}

═══ CROSS-SYSTEM ANALYSIS (from 6 pattern systems) ═══

Convergent themes: {', '.join(synthesis.get('convergent_themes', []))}

Fused themes (ranked by confidence):
{fused_themes_text}
Cross-system agreement: {synthesis.get('cross_system_agreement', 'N/A')}

Meta-insight: {synthesis.get('meta_insight', '')}

Synthesis notes: {synthesis.get('synthesis_notes', '')}

Situational anchor: {synthesis.get('situational_anchor', '')}

Divergent perspectives: {', '.join(synthesis.get('divergent_perspectives', []))}

Meta-patterns: {', '.join(synthesis.get('meta_patterns', []))}

═══ INSTRUCTIONS ═══

Use the highest-confidence fused themes to drive the reading.
Use the situational anchor to inform the "quiet mirror line" in coreTheme.
Acknowledge divergent perspectives subtly — don't force agreement.
Generate personalized insights that feel specific to {user_data.get('name', 'Unknown')}.

Output ONLY valid JSON matching the schema. No markdown fences."""

    model = settings.openai_model

    try:
        completion = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": _OPENAI_REFINEMENT_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
            top_p=1,
            response_format={"type": "json_object"},
        )

        content = completion.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")

        parsed = json.loads(content)

        # Normalise field names (watchOuts → frictions if the model uses old name)
        if "watchOuts" in parsed and "frictions" not in parsed:
            parsed["frictions"] = parsed.pop("watchOuts")

        return ReadingResponse(**parsed)

    except Exception as e:
        logger.error("[HybridOrchestrator] Phase 3 failed: %s", e, exc_info=True)
        raise


# ── Public API ───────────────────────────────────────────────────────────────

async def run_hybrid_reading(inputs: UserInput) -> ReadingResponse:
    """
    Hybrid reading pipeline:
      Phase 1 → 6 tools (pure Python, ~0.5 s)
      Phase 2 → Gemini thinking synthesis+fusion (1 LLM, ~2-3 s)
      Phase 3 → OpenAI refinement+tone (1 LLM, ~2-3 s)
    
    Returns a ReadingResponse matching the existing Pellucid schema.
    """
    user_data = {
        "name": inputs.name,
        "birthDate": inputs.birthDate,
        "birthTime": inputs.birthTime or "",
        "birthCity": inputs.birthCity,
        "focusArea": inputs.focusArea or "general life patterns",
    }

    # Phase 1: Compute all 6 systems (no LLM)
    logger.info("[HybridOrchestrator] Phase 1: Computing 6 pattern systems...")
    tool_data = _compute_all_systems(user_data)
    logger.info(
        "[HybridOrchestrator] Phase 1 complete — systems: %s",
        list(tool_data.keys()),
    )

    # Phase 2: Gemini thinking synthesis + fusion
    logger.info("[HybridOrchestrator] Phase 2: Gemini synthesis + fusion...")
    synthesis = await _gemini_synthesis_fusion(tool_data, user_data)

    # Phase 3: OpenAI final refinement
    logger.info("[HybridOrchestrator] Phase 3: OpenAI tone refinement...")
    reading = await _openai_refine(synthesis, user_data)

    logger.info("[HybridOrchestrator] ✅ Hybrid reading complete!")
    return reading
