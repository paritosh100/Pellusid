/**
 * Section-Specific Feedback Analytics
 * Provides metrics for individual reading sections
 */

import { createClient } from '@/lib/supabase/server';

export interface SectionMetrics {
    section: string;
    totalFeedback: number;
    reactionBreakdown: {
        hit: number;
        useful: number;
        vague: number;
        off: number;
    };
    positivePercentage: number; // hit + useful
    averageRating?: number;
}

export async function getSectionMetrics(
    startDate?: Date,
    endDate?: Date
): Promise<SectionMetrics[]> {
    const supabase = await createClient();

    let query = supabase
        .from('reading_feedback')
        .select('section_ratings')
        .not('section_ratings', 'is', null);

    if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
    }

    const { data: feedback, error } = await query;

    if (error || !feedback) {
        throw new Error('Failed to fetch section metrics');
    }

    // Aggregate section ratings
    const sections = ['headline', 'coreTheme', 'strengths', 'frictions', 'next7Days', 'journalPrompt'];

    const metrics = sections.map(section => {
        const sectionData = feedback
            .map(f => f.section_ratings?.[section])
            .filter(Boolean);

        const reactionBreakdown = {
            hit: sectionData.filter(s => s.reaction === 'hit').length,
            useful: sectionData.filter(s => s.reaction === 'useful').length,
            vague: sectionData.filter(s => s.reaction === 'vague').length,
            off: sectionData.filter(s => s.reaction === 'off').length,
        };

        const totalFeedback = Object.values(reactionBreakdown).reduce((sum, count) => sum + count, 0);
        const positiveCount = reactionBreakdown.hit + reactionBreakdown.useful;
        const positivePercentage = totalFeedback > 0 ? (positiveCount / totalFeedback) * 100 : 0;

        const ratings = sectionData
            .map(s => s.rating)
            .filter((r): r is number => typeof r === 'number');

        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : undefined;

        return {
            section,
            totalFeedback,
            reactionBreakdown,
            positivePercentage,
            averageRating,
        };
    });

    return metrics.sort((a, b) => b.positivePercentage - a.positivePercentage);
}

export async function getWorstPerformingSections(limit: number = 3): Promise<SectionMetrics[]> {
    const metrics = await getSectionMetrics();
    return metrics
        .filter(m => m.totalFeedback >= 5) // Only sections with enough feedback
        .sort((a, b) => a.positivePercentage - b.positivePercentage)
        .slice(0, limit);
}

export async function getBestPerformingSections(limit: number = 3): Promise<SectionMetrics[]> {
    const metrics = await getSectionMetrics();
    return metrics
        .filter(m => m.totalFeedback >= 5)
        .sort((a, b) => b.positivePercentage - a.positivePercentage)
        .slice(0, limit);
}

/**
 * Get section performance comparison
 */
export async function getSectionComparison() {
    const metrics = await getSectionMetrics();

    const sectionNames: Record<string, string> = {
        headline: 'Headline',
        coreTheme: 'Core Theme',
        strengths: 'Strengths',
        frictions: 'Frictions',
        next7Days: 'Next 7 Days',
        journalPrompt: 'Journal Prompt',
    };

    return metrics.map(m => ({
        ...m,
        displayName: sectionNames[m.section] || m.section,
    }));
}
