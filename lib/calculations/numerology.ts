/**
 * Numerology calculation tools
 * Pure TypeScript implementation - no external dependencies
 */

export interface NumerologyNumber {
    number: number;
    meaning: string;
    isMasterNumber: boolean;
}

export interface NumerologyProfile {
    lifePath: NumerologyNumber;
    expression: NumerologyNumber;
    soulUrge: NumerologyNumber;
    personalYear: number;
    birthDate: string;
    name: string;
}

/**
 * Reduce a number to single digit (1-9) or master number (11, 22, 33)
 */
function reduceToSingleDigit(num: number, allowMaster: boolean = true): number {
    while (num > 9) {
        if (allowMaster && [11, 22, 33].includes(num)) {
            return num;
        }
        num = num
            .toString()
            .split('')
            .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
    }
    return num;
}

/**
 * Calculate Life Path Number from birth date
 */
export function calculateLifePathNumber(birthDate: string): NumerologyNumber {
    const [year, month, day] = birthDate.split('-').map(Number);

    // Reduce each component
    const monthReduced = reduceToSingleDigit(month);
    const dayReduced = reduceToSingleDigit(day);
    const yearReduced = reduceToSingleDigit(year);

    // Sum and reduce
    const total = monthReduced + dayReduced + yearReduced;
    const lifePath = reduceToSingleDigit(total);

    const meanings: Record<number, string> = {
        1: 'Independence, leadership, pioneering spirit',
        2: 'Cooperation, diplomacy, sensitivity to others',
        3: 'Creativity, self-expression, communication',
        4: 'Stability, structure, practical foundation',
        5: 'Freedom, change, adaptability',
        6: 'Responsibility, nurturing, service to others',
        7: 'Analysis, introspection, spiritual seeking',
        8: 'Ambition, material success, power',
        9: 'Compassion, completion, humanitarian focus',
        11: 'Intuition, inspiration, spiritual insight (master number)',
        22: 'Master builder, large-scale achievement (master number)',
        33: 'Master teacher, selfless service (master number)',
    };

    return {
        number: lifePath,
        meaning: meanings[lifePath] || 'Unknown',
        isMasterNumber: [11, 22, 33].includes(lifePath),
    };
}

/**
 * Calculate Expression Number (Destiny Number) from full name
 */
export function calculateExpressionNumber(fullName: string): NumerologyNumber {
    // Pythagorean number chart
    const letterValues: Record<string, number> = {
        A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
        J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
        S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
    };

    // Calculate sum
    let total = 0;
    for (const char of fullName.toUpperCase()) {
        if (/[A-Z]/.test(char)) {
            total += letterValues[char] || 0;
        }
    }

    const expressionNumber = reduceToSingleDigit(total);

    const meanings: Record<number, string> = {
        1: 'Natural leader, independent thinker',
        2: 'Peacemaker, cooperative partner',
        3: 'Creative communicator, expressive artist',
        4: 'Reliable builder, practical organizer',
        5: 'Adventurous spirit, freedom seeker',
        6: 'Caring nurturer, responsible provider',
        7: 'Analytical thinker, spiritual seeker',
        8: 'Ambitious achiever, material success',
        9: 'Humanitarian, compassionate helper',
        11: 'Inspirational visionary, intuitive guide',
        22: 'Master builder of lasting legacy',
        33: 'Master teacher, selfless healer',
    };

    return {
        number: expressionNumber,
        meaning: meanings[expressionNumber] || 'Unknown',
        isMasterNumber: [11, 22, 33].includes(expressionNumber),
    };
}

/**
 * Calculate Soul Urge Number (Heart's Desire) from vowels in name
 */
export function calculateSoulUrgeNumber(fullName: string): NumerologyNumber {
    const vowelValues: Record<string, number> = {
        A: 1,
        E: 5,
        I: 9,
        O: 6,
        U: 3,
        Y: 7, // Y is sometimes a vowel
    };

    let total = 0;
    for (const char of fullName.toUpperCase()) {
        if (char in vowelValues) {
            total += vowelValues[char];
        }
    }

    const soulUrge = reduceToSingleDigit(total);

    return {
        number: soulUrge,
        meaning: '', // Simplified - can add meanings if needed
        isMasterNumber: [11, 22, 33].includes(soulUrge),
    };
}

/**
 * Calculate Personal Year number for current year
 */
export function getPersonalYear(
    birthDate: string,
    currentYear?: number
): number {
    const year = currentYear || new Date().getFullYear();
    const [, month, day] = birthDate.split('-').map(Number);

    // Reduce components (no master numbers for personal year)
    const monthReduced = reduceToSingleDigit(month, false);
    const dayReduced = reduceToSingleDigit(day, false);
    const yearReduced = reduceToSingleDigit(year, false);

    // Calculate personal year
    const total = monthReduced + dayReduced + yearReduced;
    return reduceToSingleDigit(total, false);
}

/**
 * Calculate complete numerology profile
 */
export function calculateNumerologyProfile(
    name: string,
    birthDate: string
): NumerologyProfile {
    return {
        lifePath: calculateLifePathNumber(birthDate),
        expression: calculateExpressionNumber(name),
        soulUrge: calculateSoulUrgeNumber(name),
        personalYear: getPersonalYear(birthDate),
        birthDate,
        name,
    };
}
