/**
 * API Route: Generate Reading
 * POST /api/generate-reading
 * 
 * Server-side only - handles OpenAI API calls
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateReading } from "@/lib/openai";
import { saveReading } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import type { UserInput, GenerateReadingResponse, GenerateReadingError } from "@/lib/types";

// Force dynamic rendering (required for Vercel deployment)
export const dynamic = "force-dynamic";

// Validation schema using Zod
const UserInputSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (use YYYY-MM-DD)"),
    birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (use HH:mm)").optional(),
    birthCity: z.string().min(1, "Birth city is required").max(100, "City name too long"),
    focusArea: z.string().max(200, "Focus area too long (max 200 characters)").optional(),
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
        console.log('[API] Inputs validated successfully');

        // Generate reading using OpenAI
        console.log('[API] Starting OpenAI generation...');
        let reading;
        try {
            reading = await generateReading(inputs);
            console.log('[API] OpenAI generation successful');
        } catch (openaiError) {
            console.error("[API] OpenAI generation failed:", openaiError);

            return NextResponse.json<GenerateReadingError>(
                {
                    error: "Failed to generate reading",
                    details: openaiError instanceof Error ? openaiError.message : "Unknown error"
                },
                { status: 500 }
            );
        }

        // Save to Supabase
        console.log('[API] Saving reading to Supabase...');
        const readingId = await saveReading(inputs, reading, user?.id);
        console.log(`[API] Reading saved successfully with ID: ${readingId}`);

        // Return success response
        return NextResponse.json<GenerateReadingResponse>(
            { readingId },
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
