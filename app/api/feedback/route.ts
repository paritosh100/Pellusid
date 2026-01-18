/**
 * API Route: Feedback Submission and Retrieval
 * Handles user feedback for readings (reactions and detailed feedback)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SectionRatingSchema = z.object({
    reaction: z.enum(['hit', 'useful', 'vague', 'off']).optional(),
    helpful: z.boolean().optional(),
    rating: z.number().min(1).max(5).optional(),
});

const FeedbackSchema = z.object({
    readingId: z.string().uuid(),
    reactionType: z.enum(['resonated', 'too_vague', 'off_base', 'helpful', 'not_helpful']).optional(),
    feedbackText: z.string().max(1000).optional(),
    rating: z.number().min(1).max(5).optional(),
    toneRating: z.number().min(1).max(5).optional(),
    accuracyRating: z.number().min(1).max(5).optional(),
    helpfulnessRating: z.number().min(1).max(5).optional(),
    sectionRatings: z.object({
        headline: SectionRatingSchema.optional(),
        coreTheme: SectionRatingSchema.optional(),
        strengths: SectionRatingSchema.optional(),
        frictions: SectionRatingSchema.optional(),
        next7Days: SectionRatingSchema.optional(),
        journalPrompt: SectionRatingSchema.optional(),
    }).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const feedback = FeedbackSchema.parse(body);

        const supabase = await createClient();

        // Get current user (may be null for anonymous)
        const { data: { user } } = await supabase.auth.getUser();

        // Get reading database ID
        const { data: reading } = await supabase
            .from('readings')
            .select('id')
            .eq('reading_id', feedback.readingId)
            .single();

        if (!reading) {
            return NextResponse.json(
                { error: 'Reading not found' },
                { status: 404 }
            );
        }

        // Insert feedback
        const { data, error } = await supabase
            .from('reading_feedback')
            .insert({
                reading_id: reading.id,
                user_id: user?.id || null,
                reaction_type: feedback.reactionType,
                feedback_text: feedback.feedbackText,
                rating: feedback.rating,
                tone_rating: feedback.toneRating,
                accuracy_rating: feedback.accuracyRating,
                helpfulness_rating: feedback.helpfulnessRating,
                section_ratings: feedback.sectionRatings || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to save feedback:', error);
            return NextResponse.json(
                { error: 'Failed to save feedback' },
                { status: 500 }
            );
        }

        // Track analytics event
        await supabase.from('analytics_events').insert({
            event_type: 'feedback_submitted',
            reading_id: reading.id,
            user_id: user?.id || null,
            metadata: {
                reaction_type: feedback.reactionType,
                has_text: !!feedback.feedbackText,
                rating: feedback.rating,
            },
        });

        return NextResponse.json({ success: true, feedbackId: data.id });
    } catch (error) {
        console.error('Feedback submission error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid feedback data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get feedback for a reading
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const readingId = searchParams.get('readingId');

        if (!readingId) {
            return NextResponse.json(
                { error: 'Reading ID required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Get reading database ID
        const { data: reading } = await supabase
            .from('readings')
            .select('id')
            .eq('reading_id', readingId)
            .single();

        if (!reading) {
            return NextResponse.json(
                { error: 'Reading not found' },
                { status: 404 }
            );
        }

        // Get user's feedback for this reading
        const { data: feedbackData } = await supabase
            .from('reading_feedback')
            .select('*')
            .eq('reading_id', reading.id)
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return NextResponse.json({ feedback: feedbackData });
    } catch (error) {
        console.error('Feedback retrieval error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve feedback' },
            { status: 500 }
        );
    }
}
