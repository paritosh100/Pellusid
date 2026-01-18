/**
 * API Route: Answer Journal Prompt
 * Generates an answer to the journal prompt question
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { answerPromptWithADK } from "@/lib/adk-client";
import { saveJournalResponse } from "@/lib/storage";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;

// Feature flag for ADK backend
const USE_ADK_BACKEND = process.env.USE_ADK_BACKEND === "true";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { journalPrompt, userInputs, readingId } = body;

        if (!journalPrompt) {
            return NextResponse.json(
                { error: "Journal prompt is required" },
                { status: 400 }
            );
        }

        if (!readingId) {
            return NextResponse.json(
                { error: "Reading ID is required" },
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
        const systemPrompt = `You are a reflection and pattern-synthesis assistant.
Your role is to help the user notice possible recurring patterns in their own words, not to solve, advise, or guide.

Respond with one grounded paragraph that:
- Reflects back a recognizable tension implied by the user's journal entry
- Uses simple, calm, observational language
- Normalizes confusion or mixed feelings without reassurance or motivation
- Reduces self-blame without offering solutions

You may draw from Vedic astrology, numerology, or Chinese astrology only as interpretive lenses, never as truth, prediction, or authority.
If multiple lenses align, note the overlap gently. If they differ, acknowledge contrast without resolving it.

Important Rules
- Do NOT give advice, suggestions, or next steps
- Do NOT predict outcomes or imply future change
- Do NOT use absolute or motivational language
- Do NOT tell the user what to do
- Do NOT introduce urgency or dependency

Include one subtle mirror of lived experience (such as delayed momentum, mental fatigue, quiet doubt, or effort without feedback), without assuming facts.

The response should feel like:
"This reflects something you may already sense."

End with containment, not resolution. Do not ask questions.`;


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

        let answer: string;

        if (USE_ADK_BACKEND) {
            // Use Google ADK backend
            const adkResponse = await answerPromptWithADK({
                journalPrompt,
                userInputs,
                readingId
            });
            answer = adkResponse.answer;
        } else {
            // Use OpenAI backend
            const completion = await openai.chat.completions.create({
                model: OPENAI_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.2,
                max_tokens: 150,
            });

            answer = completion.choices[0]?.message?.content || "";

            if (!answer) {
                throw new Error("No content in OpenAI response");
            }

            // If response was cut off due to token limit, request a shorter version
            if (completion.choices[0]?.finish_reason === "length") {
                const retryCompletion = await openai.chat.completions.create({
                    model: OPENAI_MODEL,
                    messages: [
                        { role: "system", content: systemPrompt + "\n\nIMPORTANT: Keep your response to 2-3 sentences maximum to ensure it completes within the token limit." },
                        { role: "user", content: userPrompt },
                    ],
                    temperature: 0.2,
                    max_tokens: 100,
                });

                answer = retryCompletion.choices[0]?.message?.content || answer;
            }
        }

        // Save journal response to Supabase
        await saveJournalResponse(readingId, journalPrompt, true, answer);

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
