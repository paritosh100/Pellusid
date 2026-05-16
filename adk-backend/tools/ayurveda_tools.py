"""
Ayurvedic wellness tools — dosha analysis, dietary guidance,
seasonal routines (Ritucharya), and lifestyle recommendations
based on traditional Ayurvedic principles.
"""

import json
from datetime import datetime
from typing import Dict, List, Optional


# ══════════════════════════════════════════════════════════════════════════════
#  Dosha Data
# ══════════════════════════════════════════════════════════════════════════════

DOSHAS: Dict[str, Dict] = {
    "Vata": {
        "elements": ["Air", "Ether"],
        "qualities": ["Light", "Cold", "Dry", "Rough", "Mobile", "Subtle"],
        "body_type": "Slender, light frame, prominent joints, dry skin",
        "temperament": "Creative, enthusiastic, quick-thinking, adaptable",
        "strengths": ["Creativity", "Flexibility", "Quick learning", "Multitasking"],
        "imbalance_signs": ["Anxiety", "Insomnia", "Dry skin", "Constipation", "Restlessness", "Joint pain"],
        "balancing_tastes": ["Sweet", "Sour", "Salty"],
        "aggravating_tastes": ["Bitter", "Pungent", "Astringent"],
        "ideal_foods": [
            "Warm soups and stews", "Cooked grains (rice, oats)", "Root vegetables",
            "Ghee and healthy oils", "Sweet fruits (bananas, mangoes)", "Nuts and seeds",
            "Warm milk with spices", "Avocado",
        ],
        "avoid_foods": [
            "Raw salads", "Cold drinks", "Dried fruits", "Crackers and chips",
            "Caffeine in excess", "Frozen foods",
        ],
        "lifestyle": [
            "Maintain a regular daily routine",
            "Favour warm, grounding activities",
            "Practice gentle yoga and meditation",
            "Oil massage (Abhyanga) with warm sesame oil",
            "Go to bed early (by 10 PM)",
            "Stay warm and avoid excessive wind/cold",
        ],
        "best_exercise": ["Yoga", "Walking", "Swimming", "Tai Chi", "Light dance"],
        "season_aggravated": "Autumn / Early Winter",
    },
    "Pitta": {
        "elements": ["Fire", "Water"],
        "qualities": ["Hot", "Sharp", "Light", "Oily", "Liquid", "Spreading"],
        "body_type": "Medium build, warm body temperature, strong digestion",
        "temperament": "Focused, driven, intelligent, decisive, passionate",
        "strengths": ["Leadership", "Determination", "Strong digestion", "Courage"],
        "imbalance_signs": ["Irritability", "Inflammation", "Acid reflux", "Skin rashes", "Overheating", "Perfectionism"],
        "balancing_tastes": ["Sweet", "Bitter", "Astringent"],
        "aggravating_tastes": ["Sour", "Salty", "Pungent"],
        "ideal_foods": [
            "Cooling foods (cucumber, melon)", "Sweet fruits (grapes, pears)",
            "Leafy greens", "Coconut and coconut oil", "Basmati rice",
            "Milk and ghee", "Mint and coriander", "Fennel",
        ],
        "avoid_foods": [
            "Spicy food", "Fermented foods", "Red meat", "Alcohol",
            "Tomatoes and citrus in excess", "Fried foods",
        ],
        "lifestyle": [
            "Stay cool — avoid excessive heat and sun",
            "Practice moderation in work and exercise",
            "Spend time in nature, especially near water",
            "Coconut oil massage",
            "Allow time for leisure and fun",
            "Practice cooling breathwork (Shitali pranayama)",
        ],
        "best_exercise": ["Swimming", "Cycling", "Moderate hiking", "Team sports", "Skiing"],
        "season_aggravated": "Summer",
    },
    "Kapha": {
        "elements": ["Earth", "Water"],
        "qualities": ["Heavy", "Slow", "Cool", "Oily", "Smooth", "Dense", "Stable"],
        "body_type": "Sturdy, strong build, smooth skin, thick hair",
        "temperament": "Calm, loyal, nurturing, steady, compassionate",
        "strengths": ["Endurance", "Loyalty", "Calmness", "Strong immunity"],
        "imbalance_signs": ["Weight gain", "Lethargy", "Congestion", "Depression", "Possessiveness", "Oversleeping"],
        "balancing_tastes": ["Pungent", "Bitter", "Astringent"],
        "aggravating_tastes": ["Sweet", "Sour", "Salty"],
        "ideal_foods": [
            "Light, warm, spicy food", "Legumes and beans", "Steamed vegetables",
            "Honey (in moderation)", "Ginger tea", "Light grains (barley, millet)",
            "Apples and berries", "Leafy greens",
        ],
        "avoid_foods": [
            "Heavy, oily foods", "Dairy in excess", "Ice cream and cold desserts",
            "Wheat and white rice in excess", "Red meat", "Excessive sugar",
        ],
        "lifestyle": [
            "Rise early (before 6 AM)",
            "Engage in vigorous daily exercise",
            "Seek variety and new experiences",
            "Dry brushing before bath",
            "Use stimulating essential oils (eucalyptus, rosemary)",
            "Keep spaces de-cluttered and well-lit",
        ],
        "best_exercise": ["Running", "HIIT", "Aerobics", "Vigorous hiking", "Dance", "Martial arts"],
        "season_aggravated": "Late Winter / Spring",
    },
}


# ── Prakriti (constitution) questionnaire scoring ────────────────────────────

# Each trait maps to one or more doshas. The questionnaire expects
# a dict like {"frame": "light", "skin": "dry", ...} and we score
# how strongly each dosha is represented.

_TRAIT_SCORES: Dict[str, Dict[str, Dict[str, int]]] = {
    "frame": {
        "light":  {"Vata": 2, "Pitta": 0, "Kapha": 0},
        "medium": {"Vata": 0, "Pitta": 2, "Kapha": 0},
        "heavy":  {"Vata": 0, "Pitta": 0, "Kapha": 2},
    },
    "skin": {
        "dry":    {"Vata": 2, "Pitta": 0, "Kapha": 0},
        "warm":   {"Vata": 0, "Pitta": 2, "Kapha": 0},
        "oily":   {"Vata": 0, "Pitta": 0, "Kapha": 2},
    },
    "digestion": {
        "irregular": {"Vata": 2, "Pitta": 0, "Kapha": 0},
        "strong":    {"Vata": 0, "Pitta": 2, "Kapha": 0},
        "slow":      {"Vata": 0, "Pitta": 0, "Kapha": 2},
    },
    "temperament": {
        "anxious":   {"Vata": 2, "Pitta": 0, "Kapha": 0},
        "intense":   {"Vata": 0, "Pitta": 2, "Kapha": 0},
        "calm":      {"Vata": 0, "Pitta": 0, "Kapha": 2},
    },
    "sleep": {
        "light":     {"Vata": 2, "Pitta": 0, "Kapha": 0},
        "moderate":  {"Vata": 0, "Pitta": 2, "Kapha": 0},
        "deep":      {"Vata": 0, "Pitta": 0, "Kapha": 2},
    },
    "climate_preference": {
        "warm":   {"Vata": 2, "Pitta": 0, "Kapha": 0},
        "cool":   {"Vata": 0, "Pitta": 2, "Kapha": 0},
        "dry":    {"Vata": 0, "Pitta": 0, "Kapha": 2},
    },
    "energy": {
        "variable":  {"Vata": 2, "Pitta": 0, "Kapha": 0},
        "driven":    {"Vata": 0, "Pitta": 2, "Kapha": 0},
        "steady":    {"Vata": 0, "Pitta": 0, "Kapha": 2},
    },
    "stress_response": {
        "worry":      {"Vata": 2, "Pitta": 0, "Kapha": 0},
        "irritation": {"Vata": 0, "Pitta": 2, "Kapha": 0},
        "withdrawal": {"Vata": 0, "Pitta": 0, "Kapha": 2},
    },
}


# ── Ritucharya (seasonal routine) ───────────────────────────────────────────

RITUCHARYA: Dict[str, Dict] = {
    "Spring": {
        "dominant_dosha": "Kapha",
        "guidance": "Kapha accumulated in winter begins to melt. Focus on lightening, detoxifying, and re-energising.",
        "diet": ["Light, warm, spicy foods", "Honey water in the morning", "Avoid dairy and heavy sweets", "Favour bitter greens"],
        "lifestyle": ["Vigorous exercise", "Dry brushing", "Declutter your space", "Rise before sunrise"],
    },
    "Summer": {
        "dominant_dosha": "Pitta",
        "guidance": "Pitta rises with the heat. Prioritise cooling, calming, and hydrating practices.",
        "diet": ["Sweet, juicy fruits", "Coconut water", "Cooling herbs (mint, coriander)", "Avoid spicy and fried foods"],
        "lifestyle": ["Moonlit walks", "Swimming", "Light clothing", "Avoid midday sun"],
    },
    "Autumn": {
        "dominant_dosha": "Vata",
        "guidance": "Vata increases with dry, windy weather. Ground yourself with warmth and routine.",
        "diet": ["Warm, oily, nourishing meals", "Root vegetables", "Ghee and sesame oil", "Warm spiced milk"],
        "lifestyle": ["Oil massage", "Regular sleep schedule", "Gentle yoga", "Stay warm"],
    },
    "Winter": {
        "dominant_dosha": "Kapha",
        "guidance": "Agni (digestive fire) is strongest. Eat heartily but stay active to prevent stagnation.",
        "diet": ["Heavier grains and proteins", "Warm soups", "Spiced teas", "Moderate use of ghee"],
        "lifestyle": ["Stay active", "Keep warm", "Self-massage with warm oil", "Practice energising breathwork"],
    },
}


# ══════════════════════════════════════════════════════════════════════════════
#  Core Functions
# ══════════════════════════════════════════════════════════════════════════════

def determine_dosha(traits: Dict[str, str]) -> Dict:
    """
    Score a Prakriti questionnaire and return the dominant dosha(s).

    Args:
        traits: Dict mapping trait categories to selected values.
                Valid categories: frame, skin, digestion, temperament,
                sleep, climate_preference, energy, stress_response.
                See _TRAIT_SCORES for accepted values per category.

    Returns:
        Dict with scores, primary_dosha, secondary_dosha, and constitution label.
    """
    scores = {"Vata": 0, "Pitta": 0, "Kapha": 0}

    for category, value in traits.items():
        mapping = _TRAIT_SCORES.get(category, {})
        contribution = mapping.get(value.lower(), {})
        for dosha, pts in contribution.items():
            scores[dosha] += pts

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    primary = ranked[0][0]
    secondary = ranked[1][0] if ranked[1][1] > 0 else None

    # Determine constitution label (e.g. "Vata-Pitta")
    if secondary and ranked[1][1] >= ranked[0][1] * 0.6:
        constitution = f"{primary}-{secondary}"
    else:
        constitution = primary

    return {
        "scores": scores,
        "primary_dosha": primary,
        "secondary_dosha": secondary,
        "constitution": constitution,
    }


def get_dosha_profile(dosha_name: str) -> Dict:
    """
    Return the full profile for a single dosha.

    Args:
        dosha_name: One of "Vata", "Pitta", "Kapha" (case-insensitive).

    Returns:
        Dosha profile dict or error dict.
    """
    key = dosha_name.strip().capitalize()
    profile = DOSHAS.get(key)
    if not profile:
        return {"error": f"Unknown dosha: {dosha_name}. Choose Vata, Pitta, or Kapha."}
    return {"dosha": key, **profile}


def get_dietary_recommendations(dosha_name: str) -> Dict:
    """
    Return dietary guidance for a dosha.

    Args:
        dosha_name: Primary dosha name.

    Returns:
        Dict with ideal_foods, avoid_foods, balancing/aggravating tastes.
    """
    key = dosha_name.strip().capitalize()
    profile = DOSHAS.get(key)
    if not profile:
        return {"error": f"Unknown dosha: {dosha_name}"}

    return {
        "dosha": key,
        "balancing_tastes": profile["balancing_tastes"],
        "aggravating_tastes": profile["aggravating_tastes"],
        "ideal_foods": profile["ideal_foods"],
        "avoid_foods": profile["avoid_foods"],
    }


def get_lifestyle_recommendations(dosha_name: str) -> Dict:
    """
    Return lifestyle, exercise, and routine guidance for a dosha.
    """
    key = dosha_name.strip().capitalize()
    profile = DOSHAS.get(key)
    if not profile:
        return {"error": f"Unknown dosha: {dosha_name}"}

    return {
        "dosha": key,
        "lifestyle": profile["lifestyle"],
        "best_exercise": profile["best_exercise"],
        "imbalance_signs": profile["imbalance_signs"],
        "season_aggravated": profile["season_aggravated"],
    }


def _current_season(date_str: Optional[str] = None) -> str:
    """Return the Northern-Hemisphere season for the given date."""
    if date_str:
        month = int(date_str.split("-")[1])
    else:
        month = datetime.utcnow().month

    if month in (3, 4, 5):
        return "Spring"
    if month in (6, 7, 8):
        return "Summer"
    if month in (9, 10, 11):
        return "Autumn"
    return "Winter"


def get_seasonal_routine(date_str: Optional[str] = None) -> Dict:
    """
    Return Ritucharya (seasonal Ayurvedic routine) for the current
    or specified date.

    Args:
        date_str: YYYY-MM-DD (defaults to today).

    Returns:
        Seasonal guidance dict.
    """
    season = _current_season(date_str)
    routine = RITUCHARYA[season]
    return {"season": season, **routine}


def calculate_ayurveda_profile(
    traits: Dict[str, str],
    date_str: Optional[str] = None,
) -> Dict:
    """
    Assemble a complete Ayurvedic wellness profile: dosha assessment,
    dietary guidance, lifestyle tips, and seasonal routine.

    Args:
        traits:   Prakriti questionnaire answers (see determine_dosha).
        date_str: Optional date for seasonal routine.

    Returns:
        Full Ayurvedic profile dict.
    """
    dosha_result = determine_dosha(traits)
    primary = dosha_result["primary_dosha"]

    return {
        "dosha_assessment": dosha_result,
        "dosha_profile": get_dosha_profile(primary),
        "diet": get_dietary_recommendations(primary),
        "lifestyle": get_lifestyle_recommendations(primary),
        "seasonal_routine": get_seasonal_routine(date_str),
    }


# ── Agent tool wrapper ────────────────────────────────────────────────────────

def ayurveda_profile_tool(
    frame: str = "medium",
    skin: str = "warm",
    digestion: str = "strong",
    temperament: str = "intense",
    sleep: str = "moderate",
    climate_preference: str = "cool",
    energy: str = "driven",
    stress_response: str = "irritation",
) -> str:
    """
    Determine Ayurvedic dosha and return full wellness profile
    (tool wrapper for agents).

    Accepts individual trait arguments so an LLM can call this
    function directly from a user conversation.

    Returns JSON string with profile data.
    """
    traits = {
        "frame": frame,
        "skin": skin,
        "digestion": digestion,
        "temperament": temperament,
        "sleep": sleep,
        "climate_preference": climate_preference,
        "energy": energy,
        "stress_response": stress_response,
    }
    profile = calculate_ayurveda_profile(traits)
    return json.dumps(profile, indent=2)
