/**
 * Feedback Analytics Functions
 * Provides metrics and insights from user feedback
 */

import { createClient } from '@/lib/supabase/server';

export interface FeedbackMetrics {
    totalFeedback: number;
    averageRating: number;
    reactionBreakdown: Record<string, number>;
    topIssues: string[];
    satisfactionRate: number;
}

export async function getFeedbackMetrics(
    startDate?: Date,
    endDate?: Date
): Promise<FeedbackMetrics> {
    const supabase = await createClient();

    let query = supabase
        .from('reading_feedback')
        .select('*');

    if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
    }

    const { data: feedback, error } = await query;

    if (error || !feedback) {
        throw new Error('Failed to fetch feedback metrics');
    }

    // Calculate metrics
    const totalFeedback = feedback.length;

    const ratingsWithValues = feedback.filter(f => f.rating !== null);
    const averageRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, f) => sum + f.rating, 0) / ratingsWithValues.length
        : 0;

    const reactionBreakdown = feedback.reduce((acc, f) => {
        if (f.reaction_type) {
            acc[f.reaction_type] = (acc[f.reaction_type] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const positiveReactions = (reactionBreakdown['resonated'] || 0) + (reactionBreakdown['helpful'] || 0);
    const satisfactionRate = totalFeedback > 0 ? (positiveReactions / totalFeedback) * 100 : 0;

    // Extract common issues from feedback text
    const feedbackTexts = feedback
        .filter(f => f.feedback_text)
        .map(f => f.feedback_text.toLowerCase());

    const topIssues = extractTopIssues(feedbackTexts);

    return {
        totalFeedback,
        averageRating,
        reactionBreakdown,
        topIssues,
        satisfactionRate,
    };
}

function extractTopIssues(feedbackTexts: string[]): string[] {
    // Simple keyword extraction
    const keywords = ['vague', 'generic', 'unclear', 'confusing', 'inaccurate', 'too long', 'too short'];

    const issueCounts = keywords.reduce((acc, keyword) => {
        const count = feedbackTexts.filter(text => text.includes(keyword)).length;
        if (count > 0) {
            acc[keyword] = count;
        }
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(issueCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([keyword]) => keyword);
}

export async function getReadingFeedback(readingId: string) {
    const supabase = await createClient();

    const { data: reading } = await supabase
        .from('readings')
        .select('id')
        .eq('reading_id', readingId)
        .single();

    if (!reading) {
        return null;
    }

    const { data: feedback } = await supabase
        .from('reading_feedback')
        .select('*')
        .eq('reading_id', reading.id)
        .order('created_at', { ascending: false });

    return feedback;
}

/**
 * Get feedback summary for a specific reading
 */
export async function getReadingFeedbackSummary(readingId: string) {
    const feedback = await getReadingFeedback(readingId);

    if (!feedback || feedback.length === 0) {
        return null;
    }

    const reactions = feedback.reduce((acc, f) => {
        if (f.reaction_type) {
            acc[f.reaction_type] = (acc[f.reaction_type] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const ratings = feedback.filter(f => f.rating !== null);
    const avgRating = ratings.length > 0
        ? ratings.reduce((sum, f) => sum + f.rating, 0) / ratings.length
        : null;

    return {
        totalFeedback: feedback.length,
        reactions,
        averageRating: avgRating,
        hasDetailedFeedback: feedback.some(f => f.feedback_text),
    };
}
