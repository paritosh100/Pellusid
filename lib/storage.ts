/**
 * Storage layer using Supabase
 * Replaces in-memory storage with persistent database
 */

import { v4 as uuidv4 } from "uuid";
import type { StoredReading, UserInput, ReadingResponse } from "./types";
import { createClient } from "./supabase/server";
import { trackAnalyticsEvent } from "./supabase/analytics";

/**
 * Save a reading to Supabase
 * @param inputs - User input data
 * @param reading - Generated reading response
 * @param userId - Optional user ID if authenticated
 * @returns readingId - Unique identifier for the reading
 */
export async function saveReading(
    inputs: UserInput,
    reading: ReadingResponse,
    userId?: string | null
): Promise<string> {
    const readingId = uuidv4();
    const supabase = await createClient();

    const { data, error } = await supabase.from("readings").insert({
        reading_id: readingId,
        user_id: userId || null,
        name: inputs.name,
        birth_date: inputs.birthDate,
        birth_time: inputs.birthTime || null,
        birth_city: inputs.birthCity,
        focus_area: inputs.focusArea || null,
        headline: reading.headline,
        core_theme: reading.coreTheme,
        strengths: reading.strengths,
        watch_outs: reading.watchOuts,
        next_7_days: reading.next7Days,
        journal_prompt: reading.journalPrompt,
        disclaimer: reading.disclaimer,
    }).select('id').single();

    if (error) {
        console.error("[Storage] Failed to save reading:", error);
        throw new Error("Failed to save reading to database");
    }

    console.log(`[Storage] Saved reading with ID: ${readingId}`);

    // Track analytics event using the database UUID
    if (data?.id) {
        await trackAnalyticsEvent({
            eventType: "reading_generated",
            readingId: data.id,
            userId: userId || undefined,
            metadata: {
                hasFocusArea: !!inputs.focusArea,
                hasBirthTime: !!inputs.birthTime,
            },
        });
    }

    return readingId;
}

/**
 * Retrieve a reading from Supabase
 * @param readingId - Unique identifier for the reading
 * @returns StoredReading or null if not found
 */
export async function getReading(
    readingId: string
): Promise<StoredReading | null> {
    console.log(`[Storage] Attempting to retrieve reading: ${readingId}`);
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("readings")
        .select("*")
        .eq("reading_id", readingId)
        .single();

    if (error || !data) {
        console.log(`[Storage] Reading not found: ${readingId}`);
        return null;
    }

    // Transform database record to StoredReading format
    const storedReading: StoredReading = {
        readingId: data.reading_id,
        inputs: {
            name: data.name,
            birthDate: data.birth_date,
            birthTime: data.birth_time || undefined,
            birthCity: data.birth_city,
            focusArea: data.focus_area || undefined,
        },
        reading: {
            headline: data.headline,
            coreTheme: data.core_theme,
            strengths: data.strengths,
            watchOuts: data.watch_outs,
            next7Days: data.next_7_days,
            journalPrompt: data.journal_prompt,
            disclaimer: data.disclaimer,
        },
        timestamp: new Date(data.created_at).getTime(),
    };

    console.log(`[Storage] Reading found: ${readingId}`);

    // Track analytics event using database UUID
    await trackAnalyticsEvent({
        eventType: "reading_viewed",
        readingId: data.id,
        userId: data.user_id || undefined,
    });

    return storedReading;
}

/**
 * Get all readings for a specific user
 * @param userId - User ID
 * @returns Array of stored readings
 */
export async function getUserReadings(
    userId: string
): Promise<StoredReading[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error || !data) {
        console.error("[Storage] Failed to fetch user readings:", error);
        return [];
    }

    return data.map((record) => ({
        readingId: record.reading_id,
        inputs: {
            name: record.name,
            birthDate: record.birth_date,
            birthTime: record.birth_time || undefined,
            birthCity: record.birth_city,
            focusArea: record.focus_area || undefined,
        },
        reading: {
            headline: record.headline,
            coreTheme: record.core_theme,
            strengths: record.strengths,
            watchOuts: record.watch_outs,
            next7Days: record.next_7_days,
            journalPrompt: record.journal_prompt,
            disclaimer: record.disclaimer,
        },
        timestamp: new Date(record.created_at).getTime(),
    }));
}

/**
 * Save a journal response to Supabase
 * @param readingId - Reading ID (UUID from database)
 * @param journalPrompt - The journal prompt question
 * @param accepted - Whether user accepted or rejected
 * @param answer - Generated answer if accepted
 */
export async function saveJournalResponse(
    readingId: string,
    journalPrompt: string,
    accepted: boolean,
    answer?: string
): Promise<void> {
    const supabase = await createClient();

    // First, get the database UUID for this reading_id
    const { data: reading } = await supabase
        .from("readings")
        .select("id, user_id")
        .eq("reading_id", readingId)
        .single();

    if (!reading) {
        console.error("[Storage] Reading not found for journal response");
        return;
    }

    const { error } = await supabase.from("journal_responses").insert({
        reading_id: reading.id,
        journal_prompt: journalPrompt,
        user_accepted: accepted,
        generated_answer: answer || null,
    });

    if (error) {
        console.error("[Storage] Failed to save journal response:", error);
        throw new Error("Failed to save journal response");
    }

    // Track analytics event
    await trackAnalyticsEvent({
        eventType: accepted ? "prompt_accepted" : "prompt_rejected",
        readingId,
        userId: reading.user_id || undefined,
    });
}

/**
 * Get all readings (for debugging/admin purposes)
 * @returns Array of all stored readings
 */
export async function getAllReadings(): Promise<StoredReading[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("readings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

    if (error || !data) {
        console.error("[Storage] Failed to fetch all readings:", error);
        return [];
    }

    return data.map((record) => ({
        readingId: record.reading_id,
        inputs: {
            name: record.name,
            birthDate: record.birth_date,
            birthTime: record.birth_time || undefined,
            birthCity: record.birth_city,
            focusArea: record.focus_area || undefined,
        },
        reading: {
            headline: record.headline,
            coreTheme: record.core_theme,
            strengths: record.strengths,
            watchOuts: record.watch_outs,
            next7Days: record.next_7_days,
            journalPrompt: record.journal_prompt,
            disclaimer: record.disclaimer,
        },
        timestamp: new Date(record.created_at).getTime(),
    }));
}
