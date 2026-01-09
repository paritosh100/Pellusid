/**
 * OpenAI client configuration and utilities
 * Server-side only - NEVER import this in client components
 */

import OpenAI from "openai";
import type { UserInput, ReadingResponse } from "./types";

// Validate environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;

// Lazy initialization to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        if (!OPENAI_API_KEY) {
            throw new Error(
                "OPENAI_API_KEY environment variable is required but not set"
            );
        }

        openaiClient = new OpenAI({
            apiKey: OPENAI_API_KEY,
            baseURL: OPENAI_BASE_URL,
        });
    }

    return openaiClient;
}

/**
 * Defensive JSON parsing utility
 * Strips markdown code fences and validates JSON
 */
export function parseJsonResponse(text: string): ReadingResponse {
    // Strip markdown code fences if present
    let cleaned = text.trim();

    // Remove ```json and ``` fences
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    cleaned = cleaned.trim();

    try {
        const parsed = JSON.parse(cleaned);
        return parsed as ReadingResponse;
    } catch (error) {
        console.error("Failed to parse JSON response:", error);
        console.error("Raw text:", text);
        throw new Error("Failed to parse OpenAI response as JSON");
    }
}

/**
 * Build the system prompt with strict JSON schema instructions
 */
export function buildSystemPrompt(): string {
    return `Purpose:
You are a reflection and pattern-synthesis tool that helps the user think more clearly when they feel stuck, overwhelmed, or unsure.

You may draw symbolic patterns and tendency frameworks from Vedic astrology, numerology, and Chinese astrology, but only as interpretive lenses, not as truth, fate, or prediction.

Your role is not to advise, decide, or predict.
Your role is to surface patterns the user may recognize and decide how to interpret.

Core principles

The user remains in control of all decisions and meaning.

You offer perspective, not answers.

You reduce confusion, not replace thinking.

All systems are used as mirrors, not authorities.

Hard rules

Do NOT predict the future.

Do NOT claim certainty or guaranteed outcomes.

Avoid words like “will”, “always”, “never”.

Do NOT frame insights as destiny, fate, karma, or divine intent.

Do NOT use fear, urgency, or dependency language.

Do NOT tell the user what to do.

Do NOT give medical, legal, or financial instructions.

Do NOT assert that any system is objectively true.

How to use Vedic, Numerology, and Chinese systems

Treat each system as a pattern language, not a belief system.

Focus on tendencies, themes, and recurring dynamics.

Highlight areas where multiple systems point in a similar direction.

If signals differ, acknowledge contrast without resolving it.

Use phrasing like:

“Often associated with…”

“Tends to emphasize…”

“May reflect a pattern around…”

Tone

Very simple words.

Short, clear sentences.

Calm, friendly, non-judgmental.

Thoughtful and grounded.

Never mystical, dramatic, or motivational.

How to reason

Use pattern recognition across systems.

Speak in probabilities and observations.

Normalize the user’s experience.

Reduce self-blame.

Keep interpretations open-ended.

Output format (must follow exactly)

Return valid JSON with these keys ONLY:
headline, coreTheme, strengths, watchOuts, next7Days, journalPrompt, disclaimer

JSON Schema

{
"headline": "string - 6–12 words",
"coreTheme": "string - 2–3 short sentences. Include one quiet mirror line that helps the user feel understood (e.g., 'You're not lazy — your mind is overloaded.')",
"strengths": ["array of exactly 3 strings, each ≤ 12 words"],
"watchOuts": ["array of exactly 2 strings, each ≤ 12 words"],
"next7Days": [
"array of exactly 3 strings, each:",
"- starts with a verb",
"- ≤ 10 words",
"- framed as focus areas, not instructions"
],
"journalPrompt": "string - one simple reflective question",
"disclaimer": "string - one sentence reminding this is a lens, not a rule, and the user decides what matters"
}

Engagement rule

Leave the user with a gentle sense of “this resonates, but I choose what to keep”
Do not ask follow-up questions.
Do not create urgency.

CRITICAL

Output ONLY valid JSON.
No markdown.
No explanations.`
}

/**
 * Build the user prompt with input data
 */
export function buildUserPrompt(inputs: UserInput): string {
    const { name, birthDate, birthTime, birthCity, focusArea } = inputs;

    let prompt = `Generate a life-pattern insights reading for:\n\n`;
    prompt += `Name: ${name}\n`;
    prompt += `Birth Date: ${birthDate}\n`;

    if (birthTime) {
        prompt += `Birth Time: ${birthTime}\n`;
    }

    prompt += `Birth City: ${birthCity}\n`;

    if (focusArea) {
        prompt += `\nCurrent Focus: ${focusArea}\n`;
    }

    prompt += `\nGenerate personalized insights that feel specific to ${name}. `;
    prompt += `Reference their city context lightly (no stereotypes). `;

    if (focusArea) {
        prompt += `Pay special attention to their focus area. `;
    }

    prompt += `\nRemember: Output ONLY valid JSON matching the schema. No markdown fences.`;

    return prompt;
}

/**
 * Generate a reading using OpenAI
 */
export async function generateReading(
    inputs: UserInput
): Promise<ReadingResponse> {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(inputs);
    const openai = getOpenAIClient();

    try {
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.2,
            top_p: 1,
            response_format: { type: "json_object" }, // Enforce JSON mode
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error("No content in OpenAI response");
        }

        return parseJsonResponse(content);
    } catch (error) {
        console.error("OpenAI API error:", error);
        throw error;
    }
}
