/**
 * API Route: Submit App Name Vote
 * POST /api/app-name-vote
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { selectedName, readingId } = await request.json();

        // Validate input
        const validNames = ['pellucid', 'intuitwithme', 'insightbridge'];
        if (!selectedName || !validNames.includes(selectedName)) {
            return NextResponse.json(
                { error: 'Invalid app name selection' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get user ID if authenticated
        const { data: { user } } = await supabase.auth.getUser();

        // Generate or get session ID for anonymous users
        const sessionId = request.cookies.get('session_id')?.value ||
            crypto.randomUUID();

        // Check if this session/user has already voted
        let existingVoteQuery = supabase
            .from('app_name_votes')
            .select('id');

        if (user) {
            existingVoteQuery = existingVoteQuery.eq('user_id', user.id);
        } else {
            existingVoteQuery = existingVoteQuery.eq('session_id', sessionId);
        }

        const { data: existingVote } = await existingVoteQuery.single();

        if (existingVote) {
            return NextResponse.json(
                { error: 'You have already voted' },
                { status: 409 }
            );
        }

        // Insert the vote
        const { error } = await supabase
            .from('app_name_votes')
            .insert({
                user_id: user?.id || null,
                session_id: user ? null : sessionId,
                selected_name: selectedName,
                reading_id: readingId || null,
            });

        if (error) {
            console.error('Error saving vote:', error);
            return NextResponse.json(
                { error: 'Failed to save vote' },
                { status: 500 }
            );
        }

        // Set session cookie for anonymous users
        const response = NextResponse.json({ success: true });
        if (!user) {
            response.cookies.set('session_id', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 365, // 1 year
            });
        }

        return response;
    } catch (error) {
        console.error('Error in app name vote API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve vote counts
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: votes, error } = await supabase
            .from('app_name_votes')
            .select('selected_name');

        if (error) {
            throw error;
        }

        // Count votes for each option
        const voteCounts = votes.reduce((acc, vote) => {
            acc[vote.selected_name] = (acc[vote.selected_name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const total = votes.length;

        return NextResponse.json({
            total,
            votes: voteCounts,
            percentages: {
                pellucid: total > 0 ? ((voteCounts.pellucid || 0) / total * 100).toFixed(1) : 0,
                intuitwithme: total > 0 ? ((voteCounts.intuitwithme || 0) / total * 100).toFixed(1) : 0,
                insightbridge: total > 0 ? ((voteCounts.insightbridge || 0) / total * 100).toFixed(1) : 0,
            }
        });
    } catch (error) {
        console.error('Error fetching vote counts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch vote counts' },
            { status: 500 }
        );
    }
}
