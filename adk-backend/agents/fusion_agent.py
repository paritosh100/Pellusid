"""
Fusion Agent — cross-system convergence analysis.

Takes the raw outputs from every specialist agent (Vedic, Numerology,
Chinese) **plus** the synthesis result, identifies convergent signals
across systems, and returns a ranked list of themes with confidence
scores.
"""

import json
import logging
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types

from config.prompts import FUSION_PROMPT
from config.settings import settings

logger = logging.getLogger(__name__)

# Shared Gemini client
client = genai.Client(api_key=settings.google_api_key)


# ── Default (fallback) response ──────────────────────────────────────────────

_FALLBACK_FUSION: Dict[str, Any] = {
    "fused_themes": [
        {
            "theme": "Personal growth and self-awareness",
            "confidence": 0.75,
            "sources": ["vedic", "numerology", "chinese"],
            "supporting_signals": ["Multiple system convergence"],
            "category": "growth",
        }
    ],
    "cross_system_agreement": 0.65,
    "divergences": [
        "Systems suggest different timing for optimal action"
    ],
    "meta_insight": (
        "Multiple symbolic systems converge on a pattern of "
        "inner development and emerging self-awareness."
    ),
}


# ── Core function ─────────────────────────────────────────────────────────────

async def run_fusion_analysis(
    specialist_outputs: Dict[str, Dict],
    synthesis_result: Dict,
    user_data: Dict[str, str],
) -> Dict[str, Any]:
    """
    Analyse specialist + synthesis outputs and produce a ranked list of
    convergent themes with confidence scores.

    Args:
        specialist_outputs: Dict keyed by system name::

            {
                "vedic": { ... vedic agent output ... },
                "numerology": { ... numerology agent output ... },
                "chinese": { ... chinese agent output ... },
            }

        synthesis_result: The output of ``run_synthesis()`` from
            *specialized_agents.py*.
        user_data: Original user birth-data / focus-area dict.

    Returns:
        Dictionary with *fused_themes* (ranked by confidence),
        *cross_system_agreement*, *divergences*, and *meta_insight*.
    """

    prompt = f"""Analyse the following specialist agent outputs and the
cross-system synthesis.  Identify convergent themes, score them by
confidence (0.0–1.0), and return a ranked list.

═══ SPECIALIST OUTPUTS ═══

VEDIC ASTROLOGY:
{json.dumps(specialist_outputs.get("vedic", {}), indent=2)}

NUMEROLOGY:
{json.dumps(specialist_outputs.get("numerology", {}), indent=2)}

CHINESE ASTROLOGY:
{json.dumps(specialist_outputs.get("chinese", {}), indent=2)}

═══ PRIOR SYNTHESIS ═══
{json.dumps(synthesis_result, indent=2)}

═══ USER CONTEXT ═══
Name: {user_data.get("name", "User")}
Focus Area: {user_data.get("focusArea", "general patterns")}

Return the JSON object as specified in your instructions.
"""

    try:
        response = client.models.generate_content(
            model=settings.premium_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=FUSION_PROMPT,
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )

        result = json.loads(response.text)

        # ── Normalise & sort by confidence descending ─────────────────
        themes = result.get("fused_themes", [])
        for t in themes:
            t.setdefault("confidence", 0.5)
            t.setdefault("sources", [])
            t.setdefault("supporting_signals", [])
            t.setdefault("category", "general")
        themes.sort(key=lambda t: t["confidence"], reverse=True)
        result["fused_themes"] = themes

        logger.info(
            "[FusionAgent] Produced %d fused themes (top confidence=%.2f)",
            len(themes),
            themes[0]["confidence"] if themes else 0.0,
        )
        return result

    except json.JSONDecodeError:
        logger.warning("[FusionAgent] JSON parse failed — using fallback")
        return _FALLBACK_FUSION

    except Exception as exc:
        logger.error("[FusionAgent] Unexpected error: %s", exc, exc_info=True)
        return _FALLBACK_FUSION
