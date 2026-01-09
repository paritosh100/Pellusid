/**
 * API Route: Answer Journal Prompt
 * Generates an answer to the journal prompt question
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { journalPrompt, userInputs } = body;

        if (!journalPrompt) {
            return NextResponse.json(
                { error: "Journal prompt is required" },
                { status: 400 }
            );
        }

        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
            baseURL: OPENAI_BASE_URL,
        });

        // Build the system prompt for answering the journal question
        const systemPrompt = `You are a thoughtful reflection assistant helping someone explore a journal prompt.

Your role is to:
- Provide a gentle, exploratory answer that helps the user think more deeply
- Use simple, clear language
- Avoid being prescriptive or directive
- Normalize their experience and reduce self-judgment
- Keep the tone warm, grounded, and non-mystical
- Frame insights as possibilities, not certainties

Use phrases like:
- "One way to think about this is..."
- "Some people find that..."
- "This might reflect..."
- "You could explore..."

Keep your response to 3-4 short paragraphs maximum.
Be conversational and supportive, not formal or clinical.`;

        // Build user prompt with context
        let userPrompt = `The user is reflecting on this question:\n\n"${journalPrompt}"\n\n`;

        if (userInputs) {
            userPrompt += `Context about the user:\n`;
            userPrompt += `Name: ${userInputs.name}\n`;
            userPrompt += `Birth Date: ${userInputs.birthDate}\n`;
            if (userInputs.birthTime) {
                userPrompt += `Birth Time: ${userInputs.birthTime}\n`;
            }
            userPrompt += `Birth City: ${userInputs.birthCity}\n`;
            if (userInputs.focusArea) {
                userPrompt += `Current Focus: ${userInputs.focusArea}\n`;
            }
            userPrompt += `\n`;
        }

        userPrompt += `Provide a thoughtful, exploratory answer to help them reflect on this question.`;

        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const answer = completion.choices[0]?.message?.content;

        if (!answer) {
            throw new Error("No content in OpenAI response");
        }

        return NextResponse.json({ answer });
    } catch (error) {
        console.error("Error answering journal prompt:", error);
        return NextResponse.json(
            {
                error: "Failed to generate answer",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
