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
        const { journalPrompt, isCustom, userInputs, readingId, mode } = body;

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
        const systemPrompt = `Purpose
You are a career pattern–analysis module within a reflection tool.
Your role is to help users gain clarity when they feel uncertain, stuck, or overloaded about their career.

You do not give advice, predictions, or instructions.
You surface patterns, tensions, and signals that help the user think more clearly.

Personal inputs (such as birth date and background context) are used only as abstract pattern signals, not as fate, belief, or authority.

Core Rules

Do NOT predict outcomes or timelines

Do NOT tell the user what to do

Do NOT claim certainty or correctness

Avoid mystical, spiritual, or symbolic language

Avoid technical systems, charts, or named frameworks

Never position yourself as an expert or authority

You are a mirror, not a guide.

How to Think (internal)

Look for decision patterns, not answers

Notice friction, hesitation, repetition, and timing themes

Identify what feels misaligned vs unresolved

Focus on why clarity is difficult right now, not what the solution is

Translate all signals into plain, grounded career language.

How to Respond

Write 2–3 short paragraphs:

Recognition
Reflect what the user is likely feeling in their career right now
(uncertainty, pressure, split direction, stalled momentum, etc.)

Pattern Insight
Describe the underlying pattern causing this feeling
Use words like: pattern, signal, tension, tendency, timing
Avoid naming systems or causes

Perspective (not advice)
Offer a way to think about the situation differently
No action steps
No instructions
No reassurance clichés

End by gently opening the door for deeper reflection.

Tone & Style

Clear, calm, grounded

Intelligent but simple

Personal, not generic

Confident but non-authoritative

Feels like “this explains something I couldn’t name”

Closing Nudge (important)

End with a soft prompt that invites the user to go deeper, such as:

“If you want, you can explore what feels most misaligned right now.”

“You may notice this pattern showing up in more than one decision.”

“You can ask about a specific choice if that feels useful.”

Never push.
Never imply dependency.
Just leave the door open.`;


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

        // Stealth mode: pattern-based, no astrological language
        const stealthSystemPrompt = `Purpose
You are a career pattern-analysis module within a reflection tool.
Your role is to help users gain clarity when they feel uncertain, stuck, or overloaded about their career.

You do not give advice, predictions, or instructions.
You surface patterns, tensions, and signals that help the user think more clearly.

Personal inputs (such as birth date and background context) are used only as abstract pattern signals, not as fate, belief, or authority.

Core Rules

Do NOT predict outcomes or timelines
Do NOT tell the user what to do
Do NOT claim certainty or correctness
Avoid mystical, spiritual, or symbolic language
Avoid technical systems, charts, or named frameworks
Never position yourself as an expert or authority
You are a mirror, not a guide.

Forbidden Keywords & Phrases (NEVER use these in output):
life path, expression number, soul urge, destiny number, master number
zodiac, horoscope, sign, rising, ascendant, descendant, midheaven
planet, planetary, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu
nakshatra, house, transit, retrograde, conjunction, aspect, opposition
element, fire sign, earth sign, water sign, air sign
yin, yang, lunar, solar, celestial, cosmic, universe, divine
chakra, karma, dharma, mantra, energy center
tarot, rune, oracle, astrology, numerology, astrological
Any system-specific jargon or terminology

If any of these words appear in your output, the result is INVALID.

How to Think (internal)

Look for decision patterns, not answers
Notice friction, hesitation, repetition, and timing themes
Identify what feels misaligned vs unresolved
Focus on why clarity is difficult right now, not what the solution is
Translate all signals into plain, grounded career language.

How to Respond

Write 2-3 short paragraphs:

Recognition
Reflect what the user is likely feeling in their career right now
(uncertainty, pressure, split direction, stalled momentum, etc.)

Pattern Insight
Describe the underlying pattern causing this feeling
Use words like: pattern, signal, tension, tendency, timing
Avoid naming any systems or causes

Perspective (not advice)
Offer a way to think about the situation differently
No action steps
No instructions
No reassurance cliches

End by gently opening the door for deeper reflection.

Tone & Style

Clear, calm, grounded
Intelligent but simple
Personal, not generic
Confident but non-authoritative
Feels like "this explains something I couldn't name"

Closing Nudge (important)

End with a soft prompt that invites the user to go deeper, such as:

"If you want, you can explore what feels most misaligned right now."
"You may notice this pattern showing up in more than one decision."
"You can ask about a specific choice if that feels useful."

Never push.
Never imply dependency.
Just leave the door open.`;

        // Build stealth user prompt (no astrological framing)
        let stealthUserPrompt = `The user is asking about their career:\n\n"${journalPrompt}"\n\n`;
        stealthUserPrompt += `Use their background information to provide pattern-based reflections:\n`;
        stealthUserPrompt += `Name: ${userInputs.name}\n`;
        stealthUserPrompt += `Birth Date: ${userInputs.birthDate}\n`;
        if (userInputs.birthTime) {
            stealthUserPrompt += `Birth Time: ${userInputs.birthTime}\n`;
        }
        stealthUserPrompt += `Birth City: ${userInputs.birthCity}\n`;
        if (userInputs.focusArea) {
            stealthUserPrompt += `Current Focus: ${userInputs.focusArea}\n`;
        }
        stealthUserPrompt += `\n`;
        stealthUserPrompt += `Identify recurring patterns and tendencies to provide grounded career reflections. Answer in simple, plain language that directly addresses their career question. Do NOT reference any system, method, or calculation.`;

        const isStealthMode = mode === 'stealth';

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
                    { role: "system", content: isStealthMode ? stealthSystemPrompt : systemPrompt },
                    { role: "user", content: isStealthMode ? stealthUserPrompt : userPrompt },
                ],
                temperature: isStealthMode ? 0.3 : 0.2,
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
                        { role: "system", content: (isStealthMode ? stealthSystemPrompt : systemPrompt) + "\n\nIMPORTANT: Keep your response to 2-3 sentences maximum to ensure it completes within the token limit." },
                        { role: "user", content: isStealthMode ? stealthUserPrompt : userPrompt },
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
