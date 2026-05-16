"""
Tarot reading tools — complete 78-card deck (Major + Minor Arcana)
with upright / reversed meanings and multi-card spread support.
"""

import json
import random
from datetime import datetime
from typing import Dict, List, Optional


# ══════════════════════════════════════════════════════════════════════════════
#  Major Arcana (22 cards)
# ══════════════════════════════════════════════════════════════════════════════

MAJOR_ARCANA: List[Dict] = [
    {"name": "The Fool", "number": 0, "upright": "New beginnings, innocence, spontaneity", "reversed": "Recklessness, risk-taking, holding back", "element": "Air"},
    {"name": "The Magician", "number": 1, "upright": "Manifestation, resourcefulness, power", "reversed": "Manipulation, poor planning, untapped talents", "element": "Air"},
    {"name": "The High Priestess", "number": 2, "upright": "Intuition, sacred knowledge, subconscious", "reversed": "Secrets, withdrawal, disconnected from intuition", "element": "Water"},
    {"name": "The Empress", "number": 3, "upright": "Femininity, beauty, nature, abundance", "reversed": "Creative block, dependence, emptiness", "element": "Earth"},
    {"name": "The Emperor", "number": 4, "upright": "Authority, structure, control, stability", "reversed": "Tyranny, rigidity, coldness, domination", "element": "Fire"},
    {"name": "The Hierophant", "number": 5, "upright": "Spiritual wisdom, tradition, mentorship", "reversed": "Rebellion, new approaches, personal belief", "element": "Earth"},
    {"name": "The Lovers", "number": 6, "upright": "Love, harmony, relationships, values alignment", "reversed": "Disharmony, imbalance, misalignment", "element": "Air"},
    {"name": "The Chariot", "number": 7, "upright": "Control, willpower, success, determination", "reversed": "Lack of control, opposition, no direction", "element": "Water"},
    {"name": "Strength", "number": 8, "upright": "Courage, persuasion, influence, inner strength", "reversed": "Self-doubt, weakness, insecurity", "element": "Fire"},
    {"name": "The Hermit", "number": 9, "upright": "Soul-searching, introspection, inner guidance", "reversed": "Isolation, loneliness, withdrawal", "element": "Earth"},
    {"name": "Wheel of Fortune", "number": 10, "upright": "Good luck, karma, life cycles, turning point", "reversed": "Bad luck, resistance to change", "element": "Fire"},
    {"name": "Justice", "number": 11, "upright": "Fairness, truth, cause and effect, clarity", "reversed": "Unfairness, lack of accountability", "element": "Air"},
    {"name": "The Hanged Man", "number": 12, "upright": "Pause, surrender, letting go, new perspectives", "reversed": "Delays, resistance, indecision", "element": "Water"},
    {"name": "Death", "number": 13, "upright": "Endings, change, transformation, transition", "reversed": "Resistance to change, personal transformation delayed", "element": "Water"},
    {"name": "Temperance", "number": 14, "upright": "Balance, moderation, patience, meaning", "reversed": "Imbalance, excess, realignment needed", "element": "Fire"},
    {"name": "The Devil", "number": 15, "upright": "Shadow self, attachment, addiction, restriction", "reversed": "Releasing limiting beliefs, detachment", "element": "Earth"},
    {"name": "The Tower", "number": 16, "upright": "Sudden change, upheaval, revelation, awakening", "reversed": "Personal transformation, fear of change", "element": "Fire"},
    {"name": "The Star", "number": 17, "upright": "Hope, faith, purpose, renewal, spirituality", "reversed": "Lack of faith, despair, disconnection", "element": "Air"},
    {"name": "The Moon", "number": 18, "upright": "Illusion, fear, anxiety, subconscious, intuition", "reversed": "Release of fear, inner confusion clearing", "element": "Water"},
    {"name": "The Sun", "number": 19, "upright": "Positivity, fun, warmth, success, vitality", "reversed": "Inner child wounded, temporary setback", "element": "Fire"},
    {"name": "Judgement", "number": 20, "upright": "Reflection, reckoning, awakening, inner calling", "reversed": "Self-doubt, ignoring the call", "element": "Fire"},
    {"name": "The World", "number": 21, "upright": "Completion, integration, accomplishment, travel", "reversed": "Shortcuts, delays, seeking closure", "element": "Earth"},
]


# ══════════════════════════════════════════════════════════════════════════════
#  Minor Arcana helpers
# ══════════════════════════════════════════════════════════════════════════════

SUITS = ["Wands", "Cups", "Swords", "Pentacles"]
SUIT_ELEMENTS = {"Wands": "Fire", "Cups": "Water", "Swords": "Air", "Pentacles": "Earth"}
SUIT_THEMES = {
    "Wands": "passion, creativity, ambition",
    "Cups": "emotions, relationships, intuition",
    "Swords": "intellect, conflict, truth",
    "Pentacles": "material, career, finances",
}

_PIP_UP = {
    "Wands":     ["Inspiration", "Planning", "Progress", "Celebration", "Competition", "Victory", "Perseverance", "Rapid action", "Resilience", "Burden"],
    "Cups":      ["New love", "Partnership", "Friendship", "Meditation", "Regret", "Nostalgia", "Choices", "Walking away", "Contentment", "Harmony"],
    "Swords":    ["Breakthrough", "Difficult choice", "Heartbreak", "Rest", "Conflict", "Transition", "Deception", "Restriction", "Anxiety", "Painful ending"],
    "Pentacles": ["Opportunity", "Balance", "Teamwork", "Security", "Hardship", "Generosity", "Long-term vision", "Diligence", "Abundance", "Legacy"],
}
_PIP_REV = {
    "Wands":     ["Delays", "Disorganisation", "Obstacles", "Instability", "Inner conflict", "Ego", "Giving up", "Frustration", "Exhaustion", "Release"],
    "Cups":      ["Blocked feelings", "Imbalance", "Overindulgence", "Withdrawal", "Acceptance", "Unrealistic", "Lack of purpose", "Trying again", "Materialism", "Broken values"],
    "Swords":    ["Confusion", "Indecision", "Recovery", "Burnout", "Reconciliation", "Stuck", "Coming clean", "New perspective", "Hope", "Regeneration"],
    "Pentacles": ["Missed chance", "Over-committed", "Lack of teamwork", "Greed", "Improvement", "Selfishness", "Short-sighted", "Shortcuts", "Living beyond means", "Financial worry"],
}

COURT_RANKS = ["Page", "Knight", "Queen", "King"]
_COURT_UP = {
    "Wands":     ["Discovery", "Energy", "Courage", "Leadership"],
    "Cups":      ["Creativity", "Romance", "Compassion", "Emotional balance"],
    "Swords":    ["Curiosity", "Action", "Independence", "Authority"],
    "Pentacles": ["Ambition", "Hard work", "Nurturing", "Wealth"],
}
_COURT_REV = {
    "Wands":     ["Immaturity", "Impulsiveness", "Jealousy", "Overbearing"],
    "Cups":      ["Emotional immaturity", "Moodiness", "Co-dependency", "Manipulation"],
    "Swords":    ["Deception", "Aggression", "Bitterness", "Tyranny"],
    "Pentacles": ["Laziness", "Boredom", "Self-centredness", "Poor judgment"],
}


def _build_minor_arcana() -> List[Dict]:
    cards: List[Dict] = []
    for suit in SUITS:
        el = SUIT_ELEMENTS[suit]
        for i in range(10):
            rank_label = "Ace" if i == 0 else str(i + 1)
            cards.append({
                "name": f"{rank_label} of {suit}", "number": i + 1, "suit": suit,
                "upright": _PIP_UP[suit][i], "reversed": _PIP_REV[suit][i], "element": el,
            })
        for j, cr in enumerate(COURT_RANKS):
            cards.append({
                "name": f"{cr} of {suit}", "number": None, "suit": suit,
                "upright": _COURT_UP[suit][j], "reversed": _COURT_REV[suit][j], "element": el,
            })
    return cards


FULL_DECK: List[Dict] = MAJOR_ARCANA + _build_minor_arcana()


# ══════════════════════════════════════════════════════════════════════════════
#  Spreads
# ══════════════════════════════════════════════════════════════════════════════

SPREADS: Dict[str, Dict] = {
    "single": {"name": "Single Card", "positions": ["Card"], "description": "Quick daily guidance."},
    "three_card": {"name": "Past / Present / Future", "positions": ["Past", "Present", "Future"], "description": "Classic three-card timeline spread."},
    "celtic_cross": {
        "name": "Celtic Cross", "description": "In-depth ten-card reading.",
        "positions": ["Present", "Challenge", "Foundation", "Recent past", "Best outcome", "Near future", "Self-image", "External influences", "Hopes & fears", "Final outcome"],
    },
    "relationship": {"name": "Relationship", "positions": ["You", "Partner", "Connection", "Challenge", "Advice"], "description": "Five-card relationship insight."},
    "mind_body_spirit": {"name": "Mind / Body / Spirit", "positions": ["Mind", "Body", "Spirit"], "description": "Holistic three-card check-in."},
}


# ══════════════════════════════════════════════════════════════════════════════
#  Core functions
# ══════════════════════════════════════════════════════════════════════════════

def draw_cards(count: int = 1, allow_reversed: bool = True, seed: Optional[int] = None) -> List[Dict]:
    """Draw *count* random cards (1-10) from the 78-card deck."""
    count = max(1, min(count, 10))
    rng = random.Random(seed)
    drawn = rng.sample(FULL_DECK, count)
    result: List[Dict] = []
    for card in drawn:
        orientation = "reversed" if allow_reversed and rng.random() < 0.35 else "upright"
        result.append({**card, "orientation": orientation, "active_meaning": card[orientation]})
    return result


def perform_spread(spread_type: str = "three_card", question: Optional[str] = None, allow_reversed: bool = True, seed: Optional[int] = None) -> Dict:
    """Perform a named tarot spread."""
    spread = SPREADS.get(spread_type, SPREADS["three_card"])
    positions = spread["positions"]
    cards = draw_cards(len(positions), allow_reversed=allow_reversed, seed=seed)
    positioned = [{"position": pos, **cards[i]} for i, pos in enumerate(positions)]
    return {
        "spread_name": spread["name"], "spread_type": spread_type,
        "description": spread["description"],
        "question": question or "General guidance",
        "cards": positioned,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


def get_card_by_name(card_name: str) -> Optional[Dict]:
    """Look up a specific card by name (case-insensitive partial match)."""
    lower = card_name.strip().lower()
    for card in FULL_DECK:
        if lower in card["name"].lower():
            return card
    return None


def get_daily_card(date_str: Optional[str] = None) -> Dict:
    """Draw a deterministic card-of-the-day seeded by the date."""
    dt = datetime.strptime(date_str, "%Y-%m-%d") if date_str else datetime.utcnow()
    seed = int(dt.strftime("%Y%m%d"))
    card = draw_cards(1, allow_reversed=True, seed=seed)[0]
    card["date"] = dt.strftime("%Y-%m-%d")
    return card


# ── Agent tool wrapper ────────────────────────────────────────────────────────

def tarot_reading_tool(spread_type: str = "three_card", question: str = "General guidance") -> str:
    """Perform a tarot reading (tool wrapper for agents). Returns JSON string."""
    reading = perform_spread(spread_type=spread_type, question=question)
    return json.dumps(reading, indent=2)
