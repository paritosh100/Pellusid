"""
Astrological calculation tools for agents
"""
import swisseph as swe
from datetime import datetime
from typing import Dict, List, Tuple
import pytz


# Initialize Swiss Ephemeris
swe.set_ephe_path(None)  # Use built-in ephemeris


def get_timezone_for_city(city: str) -> str:
    """
    Get timezone for a city (simplified mapping)
    In production, use a proper geocoding API
    """
    city_timezones = {
        "new york": "America/New_York",
        "los angeles": "America/Los_Angeles",
        "chicago": "America/Chicago",
        "london": "Europe/London",
        "paris": "Europe/Paris",
        "tokyo": "Asia/Tokyo",
        "mumbai": "Asia/Kolkata",
        "delhi": "Asia/Kolkata",
        "sydney": "Australia/Sydney",
        # Add more as needed
    }
    
    city_lower = city.lower()
    return city_timezones.get(city_lower, "UTC")


def calculate_julian_day(
    birth_date: str,
    birth_time: str = "12:00",
    birth_city: str = "New York"
) -> float:
    """
    Calculate Julian Day for birth chart calculations
    
    Args:
        birth_date: Date in YYYY-MM-DD format
        birth_time: Time in HH:MM format (24-hour)
        birth_city: City name for timezone
    
    Returns:
        Julian Day number
    """
    # Parse date and time
    date_parts = birth_date.split("-")
    year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
    
    time_parts = birth_time.split(":")
    hour, minute = int(time_parts[0]), int(time_parts[1])
    
    # Get timezone and convert to UTC
    tz_name = get_timezone_for_city(birth_city)
    local_tz = pytz.timezone(tz_name)
    
    local_dt = datetime(year, month, day, hour, minute)
    local_dt = local_tz.localize(local_dt)
    utc_dt = local_dt.astimezone(pytz.UTC)
    
    # Calculate Julian Day
    jd = swe.julday(
        utc_dt.year,
        utc_dt.month,
        utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0
    )
    
    return jd


def calculate_planetary_positions(julian_day: float) -> Dict[str, Dict]:
    """
    Calculate positions of major planets
    
    Returns:
        Dictionary with planet positions in degrees
    """
    planets = {
        "Sun": swe.SUN,
        "Moon": swe.MOON,
        "Mercury": swe.MERCURY,
        "Venus": swe.VENUS,
        "Mars": swe.MARS,
        "Jupiter": swe.JUPITER,
        "Saturn": swe.SATURN,
        "Rahu": swe.MEAN_NODE,  # North Node
    }
    
    positions = {}
    
    for planet_name, planet_id in planets.items():
        result = swe.calc_ut(julian_day, planet_id)
        longitude = result[0][0]  # Ecliptic longitude
        
        # Calculate zodiac sign (0-11 for Aries-Pisces)
        sign_num = int(longitude / 30)
        degree_in_sign = longitude % 30
        
        signs = [
            "Aries", "Taurus", "Gemini", "Cancer",
            "Leo", "Virgo", "Libra", "Scorpio",
            "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        
        positions[planet_name] = {
            "longitude": round(longitude, 2),
            "sign": signs[sign_num],
            "degree_in_sign": round(degree_in_sign, 2)
        }
    
    return positions


def calculate_ascendant(
    julian_day: float,
    latitude: float = 40.7128,  # Default: New York
    longitude: float = -74.0060
) -> Dict:
    """
    Calculate Ascendant (Lagna)
    
    Args:
        julian_day: Julian Day number
        latitude: Geographic latitude
        longitude: Geographic longitude
    
    Returns:
        Ascendant information
    """
    houses = swe.houses(julian_day, latitude, longitude, b'P')  # Placidus system
    ascendant_degree = houses[0][0]  # First house cusp = Ascendant
    
    sign_num = int(ascendant_degree / 30)
    degree_in_sign = ascendant_degree % 30
    
    signs = [
        "Aries", "Taurus", "Gemini", "Cancer",
        "Leo", "Virgo", "Libra", "Scorpio",
        "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    
    return {
        "sign": signs[sign_num],
        "degree": round(degree_in_sign, 2),
        "longitude": round(ascendant_degree, 2)
    }


def get_nakshatra(longitude: float) -> str:
    """
    Get Nakshatra (lunar mansion) for a given longitude
    
    Args:
        longitude: Ecliptic longitude in degrees
    
    Returns:
        Nakshatra name
    """
    nakshatras = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
        "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha",
        "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha",
        "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
        "Uttara Bhadrapada", "Revati"
    ]
    
    # Each nakshatra is 13.333... degrees
    nakshatra_index = int(longitude / (360 / 27))
    return nakshatras[nakshatra_index % 27]


def calculate_birth_chart(
    birth_date: str,
    birth_time: str = "12:00",
    birth_city: str = "New York"
) -> Dict:
    """
    Main function to calculate complete birth chart
    
    Args:
        birth_date: Date in YYYY-MM-DD format
        birth_time: Time in HH:MM format
        birth_city: City name
    
    Returns:
        Complete birth chart data
    """
    jd = calculate_julian_day(birth_date, birth_time, birth_city)
    
    # Get planetary positions
    planets = calculate_planetary_positions(jd)
    
    # Get Moon's nakshatra (most important)
    moon_longitude = planets["Moon"]["longitude"]
    moon_nakshatra = get_nakshatra(moon_longitude)
    
    # Get Ascendant (simplified - using default coordinates)
    # In production, geocode the city to get lat/long
    ascendant = calculate_ascendant(jd)
    
    return {
        "planets": planets,
        "ascendant": ascendant,
        "moon_nakshatra": moon_nakshatra,
        "birth_date": birth_date,
        "birth_time": birth_time,
        "birth_city": birth_city
    }


# Tool function for agent use
def vedic_birth_chart_tool(
    birth_date: str,
    birth_time: str = "12:00",
    birth_city: str = "New York"
) -> str:
    """
    Calculate Vedic birth chart (tool wrapper for agents)
    
    Returns JSON string with chart data
    """
    import json
    chart = calculate_birth_chart(birth_date, birth_time, birth_city)
    return json.dumps(chart, indent=2)
