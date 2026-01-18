"""
Numerology calculation tools
"""
from datetime import datetime
from typing import Dict


def reduce_to_single_digit(number: int, allow_master: bool = True) -> int:
    """
    Reduce a number to single digit (1-9) or master number (11, 22, 33)
    
    Args:
        number: Number to reduce
        allow_master: If True, preserve master numbers 11, 22, 33
    
    Returns:
        Reduced number
    """
    while number > 9:
        if allow_master and number in [11, 22, 33]:
            return number
        number = sum(int(digit) for digit in str(number))
    return number


def calculate_life_path_number(birth_date: str) -> Dict:
    """
    Calculate Life Path Number from birth date
    
    Args:
        birth_date: Date in YYYY-MM-DD format
    
    Returns:
        Dictionary with life path number and meaning
    """
    # Parse date
    date_parts = birth_date.split("-")
    year = int(date_parts[0])
    month = int(date_parts[1])
    day = int(date_parts[2])
    
    # Reduce each component
    month_reduced = reduce_to_single_digit(month)
    day_reduced = reduce_to_single_digit(day)
    year_reduced = reduce_to_single_digit(year)
    
    # Sum and reduce
    total = month_reduced + day_reduced + year_reduced
    life_path = reduce_to_single_digit(total)
    
    # Meanings (simplified)
    meanings = {
        1: "Independence, leadership, pioneering spirit",
        2: "Cooperation, diplomacy, sensitivity to others",
        3: "Creativity, self-expression, communication",
        4: "Stability, structure, practical foundation",
        5: "Freedom, change, adaptability",
        6: "Responsibility, nurturing, service to others",
        7: "Analysis, introspection, spiritual seeking",
        8: "Ambition, material success, power",
        9: "Compassion, completion, humanitarian focus",
        11: "Intuition, inspiration, spiritual insight (master number)",
        22: "Master builder, large-scale achievement (master number)",
        33: "Master teacher, selfless service (master number)"
    }
    
    return {
        "life_path_number": life_path,
        "meaning": meanings.get(life_path, "Unknown"),
        "is_master_number": life_path in [11, 22, 33]
    }


def calculate_expression_number(full_name: str) -> Dict:
    """
    Calculate Expression Number (Destiny Number) from full name
    
    Args:
        full_name: Full name as given at birth
    
    Returns:
        Dictionary with expression number and meaning
    """
    # Pythagorean number chart
    letter_values = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    }
    
    # Calculate sum
    total = 0
    for char in full_name.upper():
        if char.isalpha():
            total += letter_values.get(char, 0)
    
    expression_number = reduce_to_single_digit(total)
    
    meanings = {
        1: "Natural leader, independent thinker",
        2: "Peacemaker, cooperative partner",
        3: "Creative communicator, expressive artist",
        4: "Reliable builder, practical organizer",
        5: "Adventurous spirit, freedom seeker",
        6: "Caring nurturer, responsible provider",
        7: "Analytical thinker, spiritual seeker",
        8: "Ambitious achiever, material success",
        9: "Humanitarian, compassionate helper",
        11: "Inspirational visionary, intuitive guide",
        22: "Master builder of lasting legacy",
        33: "Master teacher, selfless healer"
    }
    
    return {
        "expression_number": expression_number,
        "meaning": meanings.get(expression_number, "Unknown"),
        "is_master_number": expression_number in [11, 22, 33]
    }


def calculate_soul_urge_number(full_name: str) -> Dict:
    """
    Calculate Soul Urge Number (Heart's Desire) from vowels in name
    
    Args:
        full_name: Full name as given at birth
    
    Returns:
        Dictionary with soul urge number
    """
    letter_values = {
        'A': 1, 'E': 5, 'I': 9, 'O': 6, 'U': 3,
        'Y': 7  # Y is sometimes a vowel
    }
    
    total = 0
    for char in full_name.upper():
        if char in letter_values:
            total += letter_values[char]
    
    soul_urge = reduce_to_single_digit(total)
    
    return {
        "soul_urge_number": soul_urge,
        "is_master_number": soul_urge in [11, 22, 33]
    }


def get_personal_year(birth_date: str, current_year: int = None) -> int:
    """
    Calculate Personal Year number for current year
    
    Args:
        birth_date: Date in YYYY-MM-DD format
        current_year: Year to calculate for (defaults to current year)
    
    Returns:
        Personal year number (1-9)
    """
    if current_year is None:
        current_year = datetime.now().year
    
    # Parse birth month and day
    date_parts = birth_date.split("-")
    month = int(date_parts[1])
    day = int(date_parts[2])
    
    # Reduce components
    month_reduced = reduce_to_single_digit(month, allow_master=False)
    day_reduced = reduce_to_single_digit(day, allow_master=False)
    year_reduced = reduce_to_single_digit(current_year, allow_master=False)
    
    # Calculate personal year
    total = month_reduced + day_reduced + year_reduced
    personal_year = reduce_to_single_digit(total, allow_master=False)
    
    return personal_year


def calculate_numerology_profile(name: str, birth_date: str) -> Dict:
    """
    Calculate complete numerology profile
    
    Args:
        name: Full name
        birth_date: Birth date in YYYY-MM-DD format
    
    Returns:
        Complete numerology profile
    """
    life_path = calculate_life_path_number(birth_date)
    expression = calculate_expression_number(name)
    soul_urge = calculate_soul_urge_number(name)
    personal_year = get_personal_year(birth_date)
    
    return {
        "life_path": life_path,
        "expression": expression,
        "soul_urge": soul_urge,
        "personal_year": personal_year,
        "birth_date": birth_date,
        "name": name
    }


# Tool function for agent use
def numerology_profile_tool(name: str, birth_date: str) -> str:
    """
    Calculate numerology profile (tool wrapper for agents)
    
    Returns JSON string with profile data
    """
    import json
    profile = calculate_numerology_profile(name, birth_date)
    return json.dumps(profile, indent=2)
