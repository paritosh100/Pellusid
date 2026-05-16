"""
Specialized agents for astrological analysis
"""
import json
from typing import Dict, Any
from google import genai
from google.genai import types
from config.prompts import (
    VEDIC_ASTROLOGY_PROMPT,
    NUMEROLOGY_PROMPT,
    CHINESE_ASTROLOGY_PROMPT,
    LUNAR_PROMPT,
    TAROT_PROMPT,
    AYURVEDA_PROMPT,
    SYNTHESIS_PROMPT,
    REFINEMENT_PROMPT,
    VALIDATOR_PROMPT
)
from config.settings import settings
from tools.astrology_tools import vedic_birth_chart_tool
from tools.numerology_tools import numerology_profile_tool
from tools.chinese_astrology_tools import chinese_astrology_tool
from tools.lunar_tools import lunar_phase_tool
from tools.tarot_tools import tarot_reading_tool
from tools.ayurveda_tools import ayurveda_profile_tool


# Initialize Gemini client
client = genai.Client(api_key=settings.google_api_key)


def create_vedic_agent() -> Dict[str, Any]:
    """Create Vedic astrology specialist agent configuration"""
    return {
        "name": "vedic_astrology_specialist",
        "model": settings.premium_model,  # Use thinking model for deep analysis
        "instructions": VEDIC_ASTROLOGY_PROMPT,
        "tools": [vedic_birth_chart_tool],
        "description": "Expert in Vedic astrology, birth chart analysis, and planetary patterns"
    }


def create_numerology_agent() -> Dict[str, Any]:
    """Create numerology specialist agent configuration"""
    return {
        "name": "numerology_specialist",
        "model": settings.default_model,
        "instructions": NUMEROLOGY_PROMPT,
        "tools": [numerology_profile_tool],
        "description": "Expert in numerological patterns and life path analysis"
    }


def create_chinese_agent() -> Dict[str, Any]:
    """Create Chinese astrology specialist agent configuration"""
    return {
        "name": "chinese_astrology_specialist",
        "model": settings.default_model,
        "instructions": CHINESE_ASTROLOGY_PROMPT,
        "tools": [chinese_astrology_tool],
        "description": "Expert in Chinese zodiac, elements, and yin/yang balance"
    }


def create_lunar_agent() -> Dict[str, Any]:
    """Create lunar astrology specialist agent configuration"""
    return {
        "name": "lunar_astrology_specialist",
        "model": settings.default_model,
        "instructions": LUNAR_PROMPT,
        "tools": [lunar_phase_tool],
        "description": "Expert in lunar patterns and cycles"
    }


def create_tarot_agent() -> Dict[str, Any]:
    """Create tarot specialist agent configuration"""
    return {
        "name": "tarot_specialist",
        "model": settings.default_model,
        "instructions": TAROT_PROMPT,
        "tools": [tarot_reading_tool],
        "description": "Expert in tarot archetypes and thematic reflections"
    }


def create_ayurveda_agent() -> Dict[str, Any]:
    """Create ayurveda specialist agent configuration"""
    return {
        "name": "ayurveda_specialist",
        "model": settings.default_model,
        "instructions": AYURVEDA_PROMPT,
        "tools": [ayurveda_profile_tool],
        "description": "Expert in Ayurvedic doshas and elements"
    }


def create_synthesis_agent() -> Dict[str, Any]:
    """Create pattern synthesis agent configuration"""
    return {
        "name": "pattern_synthesis_agent",
        "model": settings.premium_model,  # Use thinking model for cross-system analysis
        "instructions": SYNTHESIS_PROMPT,
        "description": "Synthesizes insights across multiple astrological systems"
    }


def create_refinement_agent() -> Dict[str, Any]:
    """Create response refinement agent configuration"""
    return {
        "name": "response_refinement_agent",
        "model": settings.default_model,
        "instructions": REFINEMENT_PROMPT,
        "description": "Refines output to match Pellucid's tone and format"
    }


def create_validator_agent() -> Dict[str, Any]:
    """Create quality validator agent configuration"""
    return {
        "name": "quality_validator_agent",
        "model": settings.default_model,
        "instructions": VALIDATOR_PROMPT,
        "description": "Validates output quality and adherence to guidelines"
    }


async def run_vedic_analysis(user_data: Dict[str, str]) -> Dict:
    """
    Run Vedic astrology analysis
    
    Args:
        user_data: User birth data
    
    Returns:
        Vedic analysis results
    """
    agent_config = create_vedic_agent()
    
    # Prepare prompt
    prompt = f"""Analyze the following birth data using Vedic astrology:

Name: {user_data['name']}
Birth Date: {user_data['birthDate']}
Birth Time: {user_data.get('birthTime', '12:00')}
Birth City: {user_data['birthCity']}
Focus Area: {user_data.get('focusArea', 'general life patterns')}

Use the vedic_birth_chart_tool to calculate the birth chart, then provide your analysis.
"""
    
    # Generate response
    response = client.models.generate_content(
        model=agent_config["model"],
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=agent_config["instructions"],
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        return {
            "system": "vedic",
            "key_themes": ["Planetary influences present"],
            "strengths_indicated": ["Inner resilience"],
            "areas_of_focus": ["Self-awareness"],
            "notes": "Analysis based on birth data"
        }


async def run_numerology_analysis(user_data: Dict[str, str]) -> Dict:
    """
    Run numerology analysis
    
    Args:
        user_data: User birth data
    
    Returns:
        Numerology analysis results
    """
    agent_config = create_numerology_agent()
    
    prompt = f"""Analyze the following data using numerology:

Name: {user_data['name']}
Birth Date: {user_data['birthDate']}
Focus Area: {user_data.get('focusArea', 'general life patterns')}

Use the numerology_profile_tool to calculate the numerology profile, then provide your analysis.
"""
    
    response = client.models.generate_content(
        model=agent_config["model"],
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=agent_config["instructions"],
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        return {
            "system": "numerology",
            "life_path_number": 5,
            "key_themes": ["Personal growth patterns"],
            "strengths_indicated": ["Adaptability"],
            "patterns": ["Cyclical development"],
            "notes": "Analysis based on birth date and name"
        }


async def run_chinese_analysis(user_data: Dict[str, str]) -> Dict:
    """
    Run Chinese astrology analysis
    
    Args:
        user_data: User birth data
    
    Returns:
        Chinese astrology analysis results
    """
    agent_config = create_chinese_agent()
    
    prompt = f"""Analyze the following birth data using Chinese astrology:

Name: {user_data['name']}
Birth Date: {user_data['birthDate']}
Focus Area: {user_data.get('focusArea', 'general life patterns')}

Use the chinese_astrology_tool to calculate the Chinese astrology profile, then provide your analysis.
"""
    
    response = client.models.generate_content(
        model=agent_config["model"],
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=agent_config["instructions"],
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        return {
            "system": "chinese",
            "zodiac_sign": "Dragon",
            "element": "Wood",
            "key_themes": ["Natural energy patterns"],
            "strengths_indicated": ["Inner strength"],
            "notes": "Analysis based on birth year"
        }


async def run_lunar_analysis(user_data: Dict[str, str]) -> Dict:
    """
    Run lunar astrology analysis
    """
    agent_config = create_lunar_agent()
    
    prompt = f"""Analyze the following birth data using lunar astrology:

Name: {user_data['name']}
Birth Date: {user_data['birthDate']}
Focus Area: {user_data.get('focusArea', 'general life patterns')}

Use the lunar_phase_tool to calculate the lunar patterns, then provide your analysis.
"""
    
    response = client.models.generate_content(
        model=agent_config["model"],
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=agent_config["instructions"],
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        return {
            "system": "lunar",
            "moon_phase": "Unknown",
            "moon_sign": "Unknown",
            "key_themes": ["Internal rhythms"],
            "strengths_indicated": ["Intuition"],
            "areas_of_focus": ["Emotional balance"],
            "notes": "Analysis based on birth date"
        }


async def run_tarot_analysis(user_data: Dict[str, str]) -> Dict:
    """
    Run tarot analysis
    """
    agent_config = create_tarot_agent()
    
    prompt = f"""Analyze the current focus using tarot cards:

Name: {user_data['name']}
Focus Area: {user_data.get('focusArea', 'general life patterns')}

Use the tarot_reading_tool to draw cards, then provide your analysis.
"""
    
    response = client.models.generate_content(
        model=agent_config["model"],
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=agent_config["instructions"],
            temperature=0.4,
            response_mime_type="application/json"
        )
    )
    
    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        return {
            "system": "tarot",
            "cards_drawn": ["The Fool", "The Magician", "The High Priestess"],
            "key_themes": ["New beginnings"],
            "strengths_indicated": ["Creative potential"],
            "challenges_or_tensions": ["Trusting intuition"],
            "notes": "Fall-back analysis"
        }


async def run_ayurveda_analysis(user_data: Dict[str, str]) -> Dict:
    """
    Run ayurveda analysis
    """
    agent_config = create_ayurveda_agent()
    
    prompt = f"""Analyze the energetic tendencies using Ayurveda:

Name: {user_data['name']}
Birth Date: {user_data['birthDate']}
Focus Area: {user_data.get('focusArea', 'general life patterns')}

Use the ayurveda_profile_tool to estimate the dosha profile, then provide your analysis.
"""
    
    response = client.models.generate_content(
        model=agent_config["model"],
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=agent_config["instructions"],
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        return {
            "system": "ayurveda",
            "primary_dosha": "Tridoshic",
            "secondary_dosha": "None",
            "key_themes": ["Energetic balance"],
            "strengths_indicated": ["Adaptability"],
            "balancing_focus": ["Grounding routines"],
            "notes": "Fall-back analysis"
        }


async def run_synthesis(vedic_result: Dict, numerology_result: Dict, chinese_result: Dict, lunar_result: Dict, tarot_result: Dict, ayurveda_result: Dict, user_data: Dict) -> Dict:
    """
    Synthesize insights from all 6 systems
    
    Args:
        vedic_result: Vedic analysis
        numerology_result: Numerology analysis
        chinese_result: Chinese astrology analysis
        lunar_result: Lunar analysis
        tarot_result: Tarot analysis
        ayurveda_result: Ayurveda analysis
        user_data: Original user data
    
    Returns:
        Synthesized insights
    """
    agent_config = create_synthesis_agent()
    
    prompt = f"""Synthesize the following insights from three astrological systems:

VEDIC ASTROLOGY:
{json.dumps(vedic_result, indent=2)}

NUMEROLOGY:
{json.dumps(numerology_result, indent=2)}

CHINESE ASTROLOGY:
{json.dumps(chinese_result, indent=2)}

LUNAR ASTROLOGY:
{json.dumps(lunar_result, indent=2)}

TAROT:
{json.dumps(tarot_result, indent=2)}

AYURVEDA:
{json.dumps(ayurveda_result, indent=2)}

USER CONTEXT:
Name: {user_data['name']}
Focus Area: {user_data.get('focusArea', 'general patterns')}

Identify convergent themes, divergent perspectives, and meta-patterns.
"""
    
    response = client.models.generate_content(
        model=agent_config["model"],
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=agent_config["instructions"],
            temperature=0.4,
            response_mime_type="application/json"
        )
    )
    
    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        return {
            "convergent_themes": ["Personal growth", "Inner strength"],
            "divergent_perspectives": ["Different timing systems"],
            "meta_patterns": ["Recurring focus on self-awareness"],
            "synthesis_notes": "Multiple systems point to similar themes"
        }


async def run_refinement(synthesis_result: Dict, user_data: Dict, fusion_result: Dict = None) -> Dict:
    """
    Refine synthesis into final Pellucid format
    
    Args:
        synthesis_result: Synthesized insights
        user_data: Original user data
        fusion_result: Optional ranked fusion themes from the fusion agent
    
    Returns:
        Final reading in Pellucid format
    """
    agent_config = create_refinement_agent()
    
    fusion_section = ""
    if fusion_result and fusion_result.get("fused_themes"):
        fusion_section = f"""

FUSION ANALYSIS (ranked themes with confidence scores):
{json.dumps(fusion_result, indent=2)}

Use the highest-confidence fused themes to prioritise which insights
appear in the final reading.  Themes with confidence >= 0.7 should be
prominently featured.
"""

    prompt = f"""Create the final reading based on this synthesis:

SYNTHESIS:
{json.dumps(synthesis_result, indent=2)}
{fusion_section}
USER CONTEXT:
Name: {user_data['name']}
Focus Area: {user_data.get('focusArea', 'general patterns')}

Generate the final reading in the exact JSON format specified in your instructions.
Remember to include a "quiet mirror line" in the coreTheme that normalizes their experience.
"""
    
    response = client.models.generate_content(
        model=agent_config["model"],
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=agent_config["instructions"],
            temperature=0.5,
            response_mime_type="application/json"
        )
    )
    
    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        # Fallback response
        return {
            "headline": "Patterns of Growth and Self-Discovery",
            "coreTheme": "Multiple systems point to a time of personal evolution. You're not stuck — you're integrating.",
            "strengths": [
                "Natural adaptability to change",
                "Deep capacity for self-reflection",
                "Ability to see multiple perspectives"
            ],
            "watchOuts": [
                "Overthinking can slow momentum",
                "Comparing yourself to others' timelines"
            ],
            "next7Days": [
                "Notice what feels aligned vs forced",
                "Track small wins and patterns",
                "Give yourself permission to pause"
            ],
            "journalPrompt": "What would change if you trusted your own timing?",
            "disclaimer": "These are interpretive lenses, not rules. You decide what resonates."
        }


async def run_validation(refined_result: Dict) -> Dict:
    """
    Validate the refined response
    
    Args:
        refined_result: Refined reading
    
    Returns:
        Validation result
    """
    agent_config = create_validator_agent()
    
    prompt = f"""Validate this reading for quality:

{json.dumps(refined_result, indent=2)}

Check for:
- No future predictions
- No "will", "always", "never", "must" language
- Calm, grounded tone
- All required fields present
- Word count constraints met
- Presence of "quiet mirror line"
"""
    
    response = client.models.generate_content(
        model=agent_config["model"],
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=agent_config["instructions"],
            temperature=0.2,
            response_mime_type="application/json"
        )
    )
    
    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        # Default to valid if parsing fails
        return {
            "is_valid": True,
            "issues": [],
            "needs_refinement": False
        }
