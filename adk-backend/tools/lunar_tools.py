"""
Lunar calculation tools — uses the *ephem* library for precise Moon
phase, illumination, rise / set times, and zodiac position.
"""

import json
import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import ephem


# ── Constants ─────────────────────────────────────────────────────────────────

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

MOON_PHASE_NAMES = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
]

# Spiritual / reflective themes for each phase
PHASE_THEMES: Dict[str, Dict] = {
    "New Moon": {
        "keywords": ["Intention", "Seed-planting", "Fresh start"],
        "guidance": (
            "A time for setting intentions and beginning new projects. "
            "Reflect on what you want to cultivate in the coming cycle."
        ),
        "energy": "introspective",
    },
    "Waxing Crescent": {
        "keywords": ["Momentum", "Commitment", "Emergence"],
        "guidance": (
            "Your intentions are taking root. Nurture them with small, "
            "consistent actions and stay open to early signs of growth."
        ),
        "energy": "building",
    },
    "First Quarter": {
        "keywords": ["Action", "Decision", "Challenge"],
        "guidance": (
            "Obstacles may surface — treat them as catalysts. Make decisive "
            "choices that align your actions with your New Moon intentions."
        ),
        "energy": "dynamic",
    },
    "Waxing Gibbous": {
        "keywords": ["Refinement", "Patience", "Adjustment"],
        "guidance": (
            "Fine-tune your approach. Review progress, adjust course where "
            "needed, and trust the process as things develop."
        ),
        "energy": "refining",
    },
    "Full Moon": {
        "keywords": ["Culmination", "Illumination", "Release"],
        "guidance": (
            "Emotions and clarity peak. Celebrate what has blossomed and "
            "release what no longer serves you."
        ),
        "energy": "expansive",
    },
    "Waning Gibbous": {
        "keywords": ["Gratitude", "Sharing", "Teaching"],
        "guidance": (
            "Share the wisdom you have gained. Practice gratitude and give "
            "back to your community."
        ),
        "energy": "distributing",
    },
    "Last Quarter": {
        "keywords": ["Letting go", "Forgiveness", "Transition"],
        "guidance": (
            "Release old habits, grudges, and patterns that have run their "
            "course. Make space for the next cycle."
        ),
        "energy": "releasing",
    },
    "Waning Crescent": {
        "keywords": ["Rest", "Surrender", "Reflection"],
        "guidance": (
            "The quietest phase — honour rest and stillness. Reflect on "
            "lessons learned before the next New Moon."
        ),
        "energy": "restorative",
    },
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _phase_name(phase_fraction: float) -> str:
    """Map a 0-1 phase fraction to a human-readable phase name."""
    # Divide the cycle into 8 equal segments
    index = int(phase_fraction * 8) % 8
    return MOON_PHASE_NAMES[index]


def _ecliptic_sign(ra_rad: float, dec_rad: float, body: ephem.Body) -> str:
    """Return the zodiac sign for an *ephem* body using ecliptic longitude."""
    ecl = ephem.Ecliptic(body)
    lon_deg = math.degrees(float(ecl.lon))
    sign_index = int(lon_deg / 30) % 12
    return ZODIAC_SIGNS[sign_index]


def _ecliptic_degree(body: ephem.Body) -> float:
    """Return ecliptic longitude in degrees for an *ephem* body."""
    ecl = ephem.Ecliptic(body)
    return round(math.degrees(float(ecl.lon)), 2)


# ── Core Functions ────────────────────────────────────────────────────────────

def get_current_moon_phase(date_str: Optional[str] = None) -> Dict:
    """
    Calculate the Moon's phase for a given date (or today).

    Args:
        date_str: Date in YYYY-MM-DD format.  Defaults to *now*.

    Returns:
        Dictionary with phase_name, illumination, phase_fraction,
        zodiac_sign, ecliptic_longitude, and thematic guidance.
    """
    if date_str:
        d = ephem.Date(date_str.replace("-", "/"))
    else:
        d = ephem.now()

    moon = ephem.Moon(d)

    phase_frac = moon.phase / 100.0  # ephem gives 0-100 %
    # For the 8-segment name we need a 0-1 cycle position.
    # Compute Sun-Moon elongation to get true cycle position.
    sun = ephem.Sun(d)
    elongation = float(moon.ra) - float(sun.ra)
    if elongation < 0:
        elongation += 2 * math.pi
    cycle_pos = elongation / (2 * math.pi)

    phase_name = _phase_name(cycle_pos)
    sign = _ecliptic_sign(moon.ra, moon.dec, moon)
    lon_deg = _ecliptic_degree(moon)

    theme = PHASE_THEMES.get(phase_name, {})

    return {
        "phase_name": phase_name,
        "illumination_pct": round(moon.phase, 2),
        "phase_fraction": round(cycle_pos, 4),
        "zodiac_sign": sign,
        "ecliptic_longitude": lon_deg,
        "date": str(ephem.Date(d)).replace("/", "-"),
        "theme": theme,
    }


def get_moon_sign(date_str: Optional[str] = None) -> Dict:
    """
    Return the zodiac sign and degree the Moon occupies.

    Args:
        date_str: Date in YYYY-MM-DD format.  Defaults to *now*.

    Returns:
        Dictionary with sign, degree_in_sign, ecliptic_longitude.
    """
    d = ephem.Date(date_str.replace("-", "/")) if date_str else ephem.now()
    moon = ephem.Moon(d)
    lon_deg = _ecliptic_degree(moon)
    sign_index = int(lon_deg / 30) % 12
    degree_in_sign = round(lon_deg % 30, 2)

    return {
        "sign": ZODIAC_SIGNS[sign_index],
        "degree_in_sign": degree_in_sign,
        "ecliptic_longitude": lon_deg,
        "date": str(ephem.Date(d)).replace("/", "-"),
    }


def get_upcoming_moon_events(date_str: Optional[str] = None, count: int = 4) -> List[Dict]:
    """
    Return the next *count* major lunar events (new / first-quarter /
    full / last-quarter moons).

    Args:
        date_str: Starting date in YYYY-MM-DD format.  Defaults to *now*.
        count:    Number of upcoming events to return (default 4).

    Returns:
        List of dicts with event_type and date.
    """
    d = ephem.Date(date_str.replace("-", "/")) if date_str else ephem.now()

    event_funcs = [
        ("New Moon", ephem.next_new_moon),
        ("First Quarter", ephem.next_first_quarter_moon),
        ("Full Moon", ephem.next_full_moon),
        ("Last Quarter", ephem.next_last_quarter_moon),
    ]

    events: List[Dict] = []
    for name, func in event_funcs:
        event_date = func(d)
        events.append({
            "event_type": name,
            "date": str(ephem.Date(event_date)).replace("/", "-"),
        })

    # Sort chronologically and take only the requested count
    events.sort(key=lambda e: e["date"])
    return events[:count]


def get_moon_rise_set(
    date_str: Optional[str] = None,
    latitude: str = "40.7128",
    longitude: str = "-74.0060",
) -> Dict:
    """
    Calculate moonrise and moonset for a location.

    Args:
        date_str:  Date in YYYY-MM-DD format.  Defaults to *now*.
        latitude:  Observer latitude as a string (degrees).
        longitude: Observer longitude as a string (degrees).

    Returns:
        Dictionary with moonrise and moonset times (UTC).
    """
    observer = ephem.Observer()
    observer.lat = latitude
    observer.lon = longitude
    observer.elevation = 0
    if date_str:
        observer.date = ephem.Date(date_str.replace("-", "/"))
    else:
        observer.date = ephem.now()

    moon = ephem.Moon()

    try:
        rise_time = observer.next_rising(moon)
        rise_str = str(ephem.Date(rise_time)).replace("/", "-")
    except ephem.NeverUpError:
        rise_str = "Moon does not rise on this date at this location"
    except ephem.AlwaysUpError:
        rise_str = "Moon is always above the horizon (circumpolar)"

    # Reset observer date before computing setting
    if date_str:
        observer.date = ephem.Date(date_str.replace("-", "/"))
    else:
        observer.date = ephem.now()

    try:
        set_time = observer.next_setting(ephem.Moon())
        set_str = str(ephem.Date(set_time)).replace("/", "-")
    except ephem.NeverUpError:
        set_str = "Moon does not set on this date at this location"
    except ephem.AlwaysUpError:
        set_str = "Moon is always above the horizon (circumpolar)"

    return {
        "moonrise_utc": rise_str,
        "moonset_utc": set_str,
        "latitude": latitude,
        "longitude": longitude,
    }


def calculate_lunar_profile(date_str: Optional[str] = None) -> Dict:
    """
    Assemble a complete lunar snapshot — phase, sign, rise/set,
    upcoming events, and spiritual guidance.

    Args:
        date_str: Date in YYYY-MM-DD format.  Defaults to *now*.

    Returns:
        Full lunar profile dictionary.
    """
    phase = get_current_moon_phase(date_str)
    sign = get_moon_sign(date_str)
    events = get_upcoming_moon_events(date_str, count=4)
    rise_set = get_moon_rise_set(date_str)

    return {
        "phase": phase,
        "moon_sign": sign,
        "rise_set": rise_set,
        "upcoming_events": events,
    }


# ── Agent tool wrapper ────────────────────────────────────────────────────────

def lunar_phase_tool(date_str: Optional[str] = None) -> str:
    """
    Calculate current Moon phase and lunar profile (tool wrapper for agents).

    Returns JSON string with full lunar data.
    """
    profile = calculate_lunar_profile(date_str)
    return json.dumps(profile, indent=2)
