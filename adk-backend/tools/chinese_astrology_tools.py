"""
Chinese astrology calculation tools
"""
from typing import Dict


def get_chinese_zodiac_sign(birth_year: int) -> str:
    """
    Get Chinese Zodiac sign based on birth year
    
    Args:
        birth_year: Year of birth
    
    Returns:
        Chinese Zodiac animal sign
    """
    # Chinese zodiac follows 12-year cycle starting from Rat
    # 1924 was Year of the Rat
    zodiac_animals = [
        "Rat", "Ox", "Tiger", "Rabbit",
        "Dragon", "Snake", "Horse", "Goat",
        "Monkey", "Rooster", "Dog", "Pig"
    ]
    
    # Calculate position in cycle
    # Rat years: 1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020...
    index = (birth_year - 1924) % 12
    return zodiac_animals[index]


def get_chinese_element(birth_year: int) -> str:
    """
    Get Chinese element based on birth year
    
    Args:
        birth_year: Year of birth
    
    Returns:
        Element (Wood, Fire, Earth, Metal, Water)
    """
    # Elements follow 10-year cycle (2 years per element)
    # Each element has Yin and Yang year
    elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
    
    # Calculate position in cycle
    # The cycle: Wood (4,5), Fire (6,7), Earth (8,9), Metal (0,1), Water (2,3)
    last_digit = birth_year % 10
    
    element_map = {
        0: "Metal", 1: "Metal",
        2: "Water", 3: "Water",
        4: "Wood", 5: "Wood",
        6: "Fire", 7: "Fire",
        8: "Earth", 9: "Earth"
    }
    
    return element_map[last_digit]


def get_yin_yang(birth_year: int) -> str:
    """
    Determine if year is Yin or Yang
    
    Args:
        birth_year: Year of birth
    
    Returns:
        "Yang" for odd years, "Yin" for even years
    """
    return "Yang" if birth_year % 2 == 1 else "Yin"


def get_zodiac_traits(zodiac_sign: str) -> Dict:
    """
    Get personality traits associated with zodiac sign
    
    Args:
        zodiac_sign: Chinese zodiac animal
    
    Returns:
        Dictionary with traits
    """
    traits = {
        "Rat": {
            "keywords": ["Clever", "Resourceful", "Adaptable"],
            "themes": ["Quick thinking", "Opportunity seizing", "Social charm"]
        },
        "Ox": {
            "keywords": ["Diligent", "Reliable", "Strong"],
            "themes": ["Steady progress", "Methodical approach", "Perseverance"]
        },
        "Tiger": {
            "keywords": ["Brave", "Confident", "Competitive"],
            "themes": ["Bold action", "Leadership", "Independence"]
        },
        "Rabbit": {
            "keywords": ["Gentle", "Compassionate", "Elegant"],
            "themes": ["Diplomacy", "Artistic sensitivity", "Peaceful resolution"]
        },
        "Dragon": {
            "keywords": ["Charismatic", "Ambitious", "Energetic"],
            "themes": ["Natural leadership", "Big visions", "Magnetic presence"]
        },
        "Snake": {
            "keywords": ["Wise", "Intuitive", "Mysterious"],
            "themes": ["Deep thinking", "Strategic planning", "Inner wisdom"]
        },
        "Horse": {
            "keywords": ["Energetic", "Independent", "Free-spirited"],
            "themes": ["Movement and change", "Personal freedom", "Enthusiasm"]
        },
        "Goat": {
            "keywords": ["Creative", "Gentle", "Empathetic"],
            "themes": ["Artistic expression", "Emotional sensitivity", "Nurturing"]
        },
        "Monkey": {
            "keywords": ["Clever", "Playful", "Curious"],
            "themes": ["Problem-solving", "Adaptability", "Innovation"]
        },
        "Rooster": {
            "keywords": ["Confident", "Hardworking", "Observant"],
            "themes": ["Attention to detail", "Direct communication", "Punctuality"]
        },
        "Dog": {
            "keywords": ["Loyal", "Honest", "Protective"],
            "themes": ["Strong values", "Trustworthiness", "Justice"]
        },
        "Pig": {
            "keywords": ["Generous", "Compassionate", "Diligent"],
            "themes": ["Enjoying life", "Helping others", "Sincerity"]
        }
    }
    
    return traits.get(zodiac_sign, {"keywords": [], "themes": []})


def get_element_traits(element: str) -> Dict:
    """
    Get characteristics associated with element
    
    Args:
        element: Chinese element
    
    Returns:
        Dictionary with element characteristics
    """
    element_traits = {
        "Wood": {
            "qualities": ["Growth", "Expansion", "Creativity"],
            "themes": ["New beginnings", "Flexibility", "Idealism"]
        },
        "Fire": {
            "qualities": ["Passion", "Energy", "Transformation"],
            "themes": ["Dynamic action", "Enthusiasm", "Inspiration"]
        },
        "Earth": {
            "qualities": ["Stability", "Nurturing", "Practicality"],
            "themes": ["Grounding", "Reliability", "Harvest"]
        },
        "Metal": {
            "qualities": ["Strength", "Determination", "Structure"],
            "themes": ["Clarity", "Precision", "Refinement"]
        },
        "Water": {
            "qualities": ["Wisdom", "Flexibility", "Intuition"],
            "themes": ["Flow", "Depth", "Adaptability"]
        }
    }
    
    return element_traits.get(element, {"qualities": [], "themes": []})


def calculate_chinese_astrology(birth_date: str) -> Dict:
    """
    Calculate complete Chinese astrology profile
    
    Args:
        birth_date: Date in YYYY-MM-DD format
    
    Returns:
        Complete Chinese astrology profile
    """
    # Parse year
    birth_year = int(birth_date.split("-")[0])
    
    # Get zodiac sign and element
    zodiac_sign = get_chinese_zodiac_sign(birth_year)
    element = get_chinese_element(birth_year)
    yin_yang = get_yin_yang(birth_year)
    
    # Get traits
    zodiac_traits = get_zodiac_traits(zodiac_sign)
    element_traits = get_element_traits(element)
    
    return {
        "zodiac_sign": zodiac_sign,
        "element": element,
        "yin_yang": yin_yang,
        "full_sign": f"{element} {zodiac_sign}",
        "zodiac_traits": zodiac_traits,
        "element_traits": element_traits,
        "birth_year": birth_year
    }


# Tool function for agent use
def chinese_astrology_tool(birth_date: str) -> str:
    """
    Calculate Chinese astrology profile (tool wrapper for agents)
    
    Returns JSON string with profile data
    """
    import json
    profile = calculate_chinese_astrology(birth_date)
    return json.dumps(profile, indent=2)
