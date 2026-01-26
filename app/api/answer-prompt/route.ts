/**
 * API Route: Answer Career Question
 * Generates an astrological answer to the career question
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
        const { journalPrompt, isCustom, userInputs, readingId } = body;

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


        // Build the system prompt for answering the career question
        const systemPrompt = `You are an astrological career counselor who provides insights based on birth chart analysis.

Your role is to answer the user's career question by interpreting their astrological profile in simple, accessible language.

CRITICAL RULES:
- Use ALL available birth data (date, time, city) to calculate planetary positions, houses, and nakshatras
- Base your answer on actual astrological calculations, not generic statements
- NEVER use technical astrology terms (no "Saturn in 10th house", "Moon in Rohini nakshatra", etc.)
- Translate astrological patterns into simple career insights
- Speak like a wise counselor, not an astrologer
- Keep language conversational and easy to understand

How to Answer:
1. Consider their birth chart placements related to career (but don't name them)
2. Look at timing patterns from their birth date
3. Notice energy patterns that affect work and ambition
4. Translate these into practical career insights

Writing Style:
- Use everyday words and short sentences
- Speak directly to their career uncertainty
- Be specific to their situation, not generic
- Acknowledge both strengths and challenges
- Offer perspective, not predictions
- No mystical language or jargon

Structure your answer as 2-3 short paragraphs that:
1. Acknowledge what they might be feeling in their career
2. Explain the underlying pattern (without technical terms)
3. Offer a grounded perspective on moving forward

Example of good language:
"You might be feeling pulled between stability and change right now. There's a natural tension in your chart between wanting security and craving something more meaningful."

Example of BAD language (avoid):
"Your Saturn in the 10th house indicates career delays. Moon in Rohini nakshatra suggests creative talents."

Remember: Answer like a wise friend who understands astrology, not like an astrologer giving a technical reading.`;


        // Build user prompt with birth chart context
        let userPrompt = `The user is asking about their career:\\n\\n"${journalPrompt}"\\n\\n`;

        userPrompt += `Use their birth information to provide astrological insights:\\n`;
        userPrompt += `Name: ${userInputs.name}\\n`;
        userPrompt += `Birth Date: ${userInputs.birthDate}\\n`;
        if (userInputs.birthTime) {
            userPrompt += `Birth Time: ${userInputs.birthTime}\\n`;
        }
        userPrompt += `Birth City: ${userInputs.birthCity}\\n`;
        if (userInputs.focusArea) {
            userPrompt += `Current Focus: ${userInputs.focusArea}\\n`;
        }
        userPrompt += `\\n`;

        userPrompt += `Calculate their birth chart and provide career insights based on their planetary positions, timing patterns, and energy dynamics. Answer in simple, non-technical language that directly addresses their career question.`;

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
                max_tokens: 300,
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
                        { role: "system", content: systemPrompt + "\\n\\nIMPORTANT: Keep your response to 2-3 sentences maximum to ensure it completes within the token limit." },
                        { role: "user", content: userPrompt },
                    ],
                    temperature: 0.2,
                    max_tokens: 100,
                });

                answer = retryCompletion.choices[0]?.message?.content || answer;
            }
        }

        // Save journal response to Supabase
        await saveJournalResponse(readingId, journalPrompt, true, answer, isCustom);

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
