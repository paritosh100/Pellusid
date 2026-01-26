/**
 * Chinese astrology calculation tools
 * Pure TypeScript implementation - no external dependencies
 */

export interface ChineseZodiacTraits {
    keywords: string[];
    themes: string[];
}

export interface ChineseElementTraits {
    qualities: string[];
    themes: string[];
}

export interface ChineseAstrologyProfile {
    zodiacSign: string;
    element: string;
    yinYang: string;
    fullSign: string;
    zodiacTraits: ChineseZodiacTraits;
    elementTraits: ChineseElementTraits;
    birthYear: number;
}

/**
 * Get Chinese Zodiac sign based on birth year
 */
export function getChineseZodiacSign(birthYear: number): string {
    // Chinese zodiac follows 12-year cycle starting from Rat
    // 1924 was Year of the Rat
    const zodiacAnimals = [
        'Rat',
        'Ox',
        'Tiger',
        'Rabbit',
        'Dragon',
        'Snake',
        'Horse',
        'Goat',
        'Monkey',
        'Rooster',
        'Dog',
        'Pig',
    ];

    // Calculate position in cycle
    const index = (birthYear - 1924) % 12;
    return zodiacAnimals[index];
}

/**
 * Get Chinese element based on birth year
 */
export function getChineseElement(birthYear: number): string {
    // Elements follow 10-year cycle (2 years per element)
    const lastDigit = birthYear % 10;

    const elementMap: Record<number, string> = {
        0: 'Metal',
        1: 'Metal',
        2: 'Water',
        3: 'Water',
        4: 'Wood',
        5: 'Wood',
        6: 'Fire',
        7: 'Fire',
        8: 'Earth',
        9: 'Earth',
    };

    return elementMap[lastDigit];
}

/**
 * Determine if year is Yin or Yang
 */
export function getYinYang(birthYear: number): string {
    return birthYear % 2 === 1 ? 'Yang' : 'Yin';
}

/**
 * Get personality traits associated with zodiac sign
 */
export function getZodiacTraits(zodiacSign: string): ChineseZodiacTraits {
    const traits: Record<string, ChineseZodiacTraits> = {
        Rat: {
            keywords: ['Clever', 'Resourceful', 'Adaptable'],
            themes: ['Quick thinking', 'Opportunity seizing', 'Social charm'],
        },
        Ox: {
            keywords: ['Diligent', 'Reliable', 'Strong'],
            themes: ['Steady progress', 'Methodical approach', 'Perseverance'],
        },
        Tiger: {
            keywords: ['Brave', 'Confident', 'Competitive'],
            themes: ['Bold action', 'Leadership', 'Independence'],
        },
        Rabbit: {
            keywords: ['Gentle', 'Compassionate', 'Elegant'],
            themes: ['Diplomacy', 'Artistic sensitivity', 'Peaceful resolution'],
        },
        Dragon: {
            keywords: ['Charismatic', 'Ambitious', 'Energetic'],
            themes: ['Natural leadership', 'Big visions', 'Magnetic presence'],
        },
        Snake: {
            keywords: ['Wise', 'Intuitive', 'Mysterious'],
            themes: ['Deep thinking', 'Strategic planning', 'Inner wisdom'],
        },
        Horse: {
            keywords: ['Energetic', 'Independent', 'Free-spirited'],
            themes: ['Movement and change', 'Personal freedom', 'Enthusiasm'],
        },
        Goat: {
            keywords: ['Creative', 'Gentle', 'Empathetic'],
            themes: ['Artistic expression', 'Emotional sensitivity', 'Nurturing'],
        },
        Monkey: {
            keywords: ['Clever', 'Playful', 'Curious'],
            themes: ['Problem-solving', 'Adaptability', 'Innovation'],
        },
        Rooster: {
            keywords: ['Confident', 'Hardworking', 'Observant'],
            themes: ['Attention to detail', 'Direct communication', 'Punctuality'],
        },
        Dog: {
            keywords: ['Loyal', 'Honest', 'Protective'],
            themes: ['Strong values', 'Trustworthiness', 'Justice'],
        },
        Pig: {
            keywords: ['Generous', 'Compassionate', 'Diligent'],
            themes: ['Enjoying life', 'Helping others', 'Sincerity'],
        },
    };

    return traits[zodiacSign] || { keywords: [], themes: [] };
}

/**
 * Get characteristics associated with element
 */
export function getElementTraits(element: string): ChineseElementTraits {
    const elementTraits: Record<string, ChineseElementTraits> = {
        Wood: {
            qualities: ['Growth', 'Expansion', 'Creativity'],
            themes: ['New beginnings', 'Flexibility', 'Idealism'],
        },
        Fire: {
            qualities: ['Passion', 'Energy', 'Transformation'],
            themes: ['Dynamic action', 'Enthusiasm', 'Inspiration'],
        },
        Earth: {
            qualities: ['Stability', 'Nurturing', 'Practicality'],
            themes: ['Grounding', 'Reliability', 'Harvest'],
        },
        Metal: {
            qualities: ['Strength', 'Determination', 'Structure'],
            themes: ['Clarity', 'Precision', 'Refinement'],
        },
        Water: {
            qualities: ['Wisdom', 'Flexibility', 'Intuition'],
            themes: ['Flow', 'Depth', 'Adaptability'],
        },
    };

    return elementTraits[element] || { qualities: [], themes: [] };
}

/**
 * Calculate complete Chinese astrology profile
 */
export function calculateChineseAstrology(
    birthDate: string
): ChineseAstrologyProfile {
    const birthYear = parseInt(birthDate.split('-')[0], 10);

    const zodiacSign = getChineseZodiacSign(birthYear);
    const element = getChineseElement(birthYear);
    const yinYang = getYinYang(birthYear);

    return {
        zodiacSign,
        element,
        yinYang,
        fullSign: `${element} ${zodiacSign}`,
        zodiacTraits: getZodiacTraits(zodiacSign),
        elementTraits: getElementTraits(element),
        birthYear,
    };
}
