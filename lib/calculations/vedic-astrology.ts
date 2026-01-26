/**
 * Vedic astrology calculation tools
 * Uses sweph-wasm (WebAssembly Swiss Ephemeris) for accurate astronomical data
 * Compatible with Next.js/Vercel serverless environment
 */

import SwissEPH from 'sweph-wasm';

export interface PlanetPosition {
    longitude: number;
    sign: string;
    degreeInSign: number;
}

export interface AscendantInfo {
    sign: string;
    degree: number;
    longitude: number;
}

export interface BirthChart {
    planets: Record<string, PlanetPosition>;
    ascendant: AscendantInfo;
    moonNakshatra: string;
    birthDate: string;
    birthTime: string;
    birthCity: string;
}

const ZODIAC_SIGNS = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
];

const NAKSHATRAS = [
    'Ashwini',
    'Bharani',
    'Krittika',
    'Rohini',
    'Mrigashira',
    'Ardra',
    'Punarvasu',
    'Pushya',
    'Ashlesha',
    'Magha',
    'Purva Phalguni',
    'Uttara Phalguni',
    'Hasta',
    'Chitra',
    'Swati',
    'Vishakha',
    'Anuradha',
    'Jyeshtha',
    'Mula',
    'Purva Ashadha',
    'Uttara Ashadha',
    'Shravana',
    'Dhanishta',
    'Shatabhisha',
    'Purva Bhadrapada',
    'Uttara Bhadrapada',
    'Revati',
];

// Planet IDs (Swiss Ephemeris constants)
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MERCURY = 2;
const SE_VENUS = 3;
const SE_MARS = 4;
const SE_JUPITER = 5;
const SE_SATURN = 6;
const SE_MEAN_NODE = 11; // Rahu (North Node)

// Flags
const SEFLG_SWIEPH = 2; // Use Swiss Ephemeris

// Initialize Swiss Ephemeris instance
let sweph: Awaited<ReturnType<typeof SwissEPH.init>> | null = null;

async function getSweph() {
    if (!sweph) {
        // Provide explicit path to WASM file in public directory
        sweph = await SwissEPH.init('/public/wasm/swisseph.wasm');
        await sweph.swe_set_ephe_path(); // Initialize ephemeris path
    }
    return sweph;
}

/**
 * Get timezone offset for a city (simplified mapping)
 */
function getTimezoneOffset(city: string): number {
    const cityTimezones: Record<string, number> = {
        'new york': -5,
        'los angeles': -8,
        chicago: -6,
        london: 0,
        paris: 1,
        tokyo: 9,
        mumbai: 5.5,
        delhi: 5.5,
        sydney: 10,
    };

    return cityTimezones[city.toLowerCase()] || 0;
}

/**
 * Get zodiac sign and degree from ecliptic longitude
 */
function getZodiacInfo(longitude: number): { sign: string; degree: number } {
    const normalizedLon = ((longitude % 360) + 360) % 360;
    const signNum = Math.floor(normalizedLon / 30);
    const degreeInSign = normalizedLon % 30;

    return {
        sign: ZODIAC_SIGNS[signNum],
        degree: degreeInSign,
    };
}

/**
 * Get Nakshatra (lunar mansion) for a given longitude
 */
export function getNakshatra(longitude: number): string {
    const normalizedLon = ((longitude % 360) + 360) % 360;
    const nakshatraIndex = Math.floor(normalizedLon / (360 / 27));
    return NAKSHATRAS[nakshatraIndex % 27];
}

/**
 * Calculate planetary positions using Swiss Ephemeris WebAssembly
 */
export async function calculatePlanetaryPositions(
    birthDate: string,
    birthTime: string,
    birthCity: string
): Promise<Record<string, PlanetPosition>> {
    const positions: Record<string, PlanetPosition> = {};

    try {
        const swe = await getSweph();

        // Parse date and time
        const [year, month, day] = birthDate.split('-').map(Number);
        const [hour, minute] = birthTime.split(':').map(Number);

        // Get timezone offset and convert to UTC
        const tzOffset = getTimezoneOffset(birthCity);
        const utcHour = hour - tzOffset + minute / 60;

        // Calculate Julian Day
        const jd = swe.swe_julday(year, month, day, utcHour, 1); // 1 = Gregorian calendar

        // Planet IDs and names
        const planets = [
            { id: SE_SUN, name: 'Sun' },
            { id: SE_MOON, name: 'Moon' },
            { id: SE_MERCURY, name: 'Mercury' },
            { id: SE_VENUS, name: 'Venus' },
            { id: SE_MARS, name: 'Mars' },
            { id: SE_JUPITER, name: 'Jupiter' },
            { id: SE_SATURN, name: 'Saturn' },
            { id: SE_MEAN_NODE, name: 'Rahu' },
        ];

        // Calculate each planet's position
        for (const planet of planets) {
            const result = swe.swe_calc_ut(jd, planet.id, SEFLG_SWIEPH);

            if (result && typeof result === 'object' && 'longitude' in result) {
                const longitude = result.longitude as number;
                const planetInfo = getZodiacInfo(longitude);
                positions[planet.name] = {
                    longitude,
                    sign: planetInfo.sign,
                    degreeInSign: planetInfo.degree,
                };
            }
        }
    } catch (error) {
        console.error('Error calculating planetary positions:', error);
    }

    return positions;
}

/**
 * Calculate Ascendant using Swiss Ephemeris WebAssembly
 */
export async function calculateAscendant(
    birthDate: string,
    birthTime: string,
    birthCity: string,
    latitude: number = 40.7128,
    longitude: number = -74.006
): Promise<AscendantInfo> {
    try {
        const swe = await getSweph();

        // Parse date and time
        const [year, month, day] = birthDate.split('-').map(Number);
        const [hour, minute] = birthTime.split(':').map(Number);

        // Get timezone offset and convert to UTC
        const tzOffset = getTimezoneOffset(birthCity);
        const utcHour = hour - tzOffset + minute / 60;

        // Calculate Julian Day
        const jd = swe.swe_julday(year, month, day, utcHour, 1);

        // Calculate houses (Placidus system = 'P')
        const houses = swe.swe_houses(jd, latitude, longitude, 'P');

        if (houses && typeof houses === 'object' && 'ascendant' in houses) {
            const ascendantLon = houses.ascendant as number;
            const ascInfo = getZodiacInfo(ascendantLon);
            return {
                sign: ascInfo.sign,
                degree: ascInfo.degree,
                longitude: ascendantLon,
            };
        }
    } catch (error) {
        console.error('Error calculating ascendant:', error);
    }

    // Fallback
    return {
        sign: 'Aries',
        degree: 0,
        longitude: 0,
    };
}

/**
 * Calculate complete birth chart using Swiss Ephemeris WebAssembly
 */
export async function calculateBirthChart(
    birthDate: string,
    birthTime: string = '12:00',
    birthCity: string = 'New York'
): Promise<BirthChart> {
    // Calculate positions using Swiss Ephemeris
    const planets = await calculatePlanetaryPositions(birthDate, birthTime, birthCity);
    const ascendant = await calculateAscendant(birthDate, birthTime, birthCity);

    // Get Moon's nakshatra
    const moonLongitude = planets['Moon']?.longitude || 0;
    const moonNakshatra = getNakshatra(moonLongitude);

    return {
        planets,
        ascendant,
        moonNakshatra,
        birthDate,
        birthTime,
        birthCity,
    };
}
