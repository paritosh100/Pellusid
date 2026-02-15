/**
 * API Route: Generate Reading
 * POST /api/generate-reading
 * 
 * Server-side only - handles OpenAI API calls
 * Supports both normal and stealth modes
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateReading, generateStealthReading } from "@/lib/openai";
import { generateReadingWithADK } from "@/lib/adk-client";
import { saveReading, saveStealthReading } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { UserInput, GenerateReadingResponse, GenerateReadingError } from "@/lib/types";

// Force dynamic rendering (required for Vercel deployment)
export const dynamic = "force-dynamic";

// Feature flag for ADK backend
const USE_ADK_BACKEND = process.env.USE_ADK_BACKEND === "true";

// Validation schema using Zod
const UserInputSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)"),
    birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (use HH:mm)").optional(),
    birthCity: z.string().min(1, "Birth city is required").max(100, "City name too long"),
    focusArea: z.string().max(200, "Focus area too long (max 200 characters)").optional(),
    mode: z.enum(["normal", "stealth"]).optional().default("normal"),
});

export async function POST(request: NextRequest) {
    try {
        console.log('[API] Received generate-reading request');

        // Get authenticated user (optional - allows anonymous readings)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        console.log(`[API] User authenticated: ${!!user}`);

        // Parse request body
        const body = await request.json();
        console.log('[API] Request body parsed');

        // Validate inputs
        const validationResult = UserInputSchema.safeParse(body);

        if (!validationResult.success) {
            const errorMessage = validationResult.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join(", ");

            console.log('[API] Validation failed:', errorMessage);
            return NextResponse.json<GenerateReadingError>(
                { error: "Invalid input", details: errorMessage },
                { status: 400 }
            );
        }

        const inputs: UserInput = validationResult.data;
        const mode = validationResult.data.mode || 'normal';
        console.log(`[API] Inputs validated successfully, mode: ${mode}`);

        let readingId: string;

        if (mode === 'stealth') {
            // Stealth mode: pattern-based reflection, no astrological language
            console.log('[API] Starting stealth mode generation...');
            try {
                const stealthReading = await generateStealthReading(inputs);
                console.log('[API] Stealth generation successful');

                console.log('[API] Saving stealth reading to Supabase...');
                readingId = await saveStealthReading(inputs, stealthReading, user?.id);
                console.log(`[API] Stealth reading saved with ID: ${readingId}`);
            } catch (generationError) {
                console.error('[API] Stealth generation failed:', generationError);
                return NextResponse.json<GenerateReadingError>(
                    {
                        error: "Failed to generate reflection",
                        details: generationError instanceof Error ? generationError.message : "Unknown error"
                    },
                    { status: 500 }
                );
            }
        } else {
            // Normal mode: standard reading with astrological insights
            const backendName = USE_ADK_BACKEND ? "ADK" : "OpenAI";
            console.log(`[API] Starting ${backendName} generation...`);
            try {
                let reading;
                if (USE_ADK_BACKEND) {
                    reading = await generateReadingWithADK(inputs);
                    console.log('[API] ADK generation successful');
                } else {
                    reading = await generateReading(inputs);
                    console.log('[API] OpenAI generation successful');
                }

                console.log('[API] Saving reading to Supabase...');
                readingId = await saveReading(inputs, reading, user?.id);
                console.log(`[API] Reading saved with ID: ${readingId}`);
            } catch (generationError) {
                console.error(`[API] ${backendName} generation failed:`, generationError);
                return NextResponse.json<GenerateReadingError>(
                    {
                        error: "Failed to generate reading",
                        details: generationError instanceof Error ? generationError.message : "Unknown error"
                    },
                    { status: 500 }
                );
            }
        }

        // Return success response
        return NextResponse.json<GenerateReadingResponse>(
            { readingId, mode },
            { status: 200 }
        );

    } catch (error) {
        console.error("[API] Unexpected error in generate-reading API:", error);

        return NextResponse.json<GenerateReadingError>(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
