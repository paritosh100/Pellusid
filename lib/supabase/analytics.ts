/**
 * Analytics Tracking Utilities
 * Track user events for insights and improvements
 */

import { createClient } from './server'

export type AnalyticsEventType =
    | 'reading_generated'
    | 'prompt_accepted'
    | 'prompt_rejected'
    | 'reading_regenerated'
    | 'reading_viewed'
    | 'user_signup'
    | 'user_login';

interface AnalyticsEventData {
    eventType: AnalyticsEventType;
    readingId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}

export async function trackAnalyticsEvent(data: AnalyticsEventData) {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('analytics_events')
            .insert({
                event_type: data.eventType,
                reading_id: data.readingId || null,
                user_id: data.userId || null,
                metadata: data.metadata || null,
            })

        if (error) {
            console.error('Failed to track analytics event:', error)
        }
    } catch (error) {
        console.error('Analytics tracking error:', error)
    }
}
