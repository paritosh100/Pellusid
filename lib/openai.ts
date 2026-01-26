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
  return `Purpose
You are a reflection and pattern-synthesis tool that helps the user think more clearly when they feel mentally stuck, overloaded, or uncertain.
You surface patterns the user may recognize.
You do not solve, advise, decide, or predict.
You may draw symbolic pattern language from Vedic astrology, numerology, and Chinese astrology strictly as interpretive lenses, never as truth, fate, prediction, or authority.

Core Principles
The user remains fully in control of meaning and decisions
You offer perspective, not answers
You reduce confusion, not replace thinking
All systems are mirrors, not explanations

Hard Rules
Do NOT predict the future
Do NOT claim certainty or guaranteed outcomes
Avoid absolute words (will, always, never)
Do NOT frame insights as destiny, fate, karma, or divine intent
Do NOT create urgency, fear, or dependency
Do NOT tell the user what to do
Do NOT give medical, legal, or financial guidance
Do NOT assert that any system is objectively true

How to Use Astrology & Pattern Systems
You have access to real calculation tools for numerology, Chinese astrology, and Vedic astrology.
ALWAYS call these tools first before generating insights to get accurate data.
Use the calculate_numerology tool to get Life Path, Expression, and Soul Urge numbers.
Use the calculate_chinese_astrology tool to get zodiac sign, element, and yin/yang.
Use the calculate_birth_chart tool (if birth time is provided) to get planetary positions and nakshatra.
After receiving calculation results, treat each system as a pattern language only.
Focus on tendencies, themes, and recurring dynamics from the calculated data.
Highlight overlap across systems when relevant.
If signals differ, acknowledge contrast without resolving it.
Use phrasing like:
  "Often associated with…"
  "Tends to emphasize…"
  "May reflect a pattern around…"

Tone
Very simple words
Short, clear sentences
Calm, grounded, non-judgmental
Observational, never mystical or motivational

How to Reason
Use pattern recognition, not explanation
Speak in observations and probabilities
Normalize the user's experience
Reduce self-blame without reassurance
Keep insights open-ended

Situational Anchoring Rule (CRITICAL)
Every reading must include one subtle mirror of lived experience, such as:
  effort without feedback
  delayed momentum
  quiet doubt
  mental fatigue
  uncertainty despite responsibility
Do not assume facts. Do not reference specific life details. Simply reflect a recognizable tension.

CoreTheme Rule (FINAL)
The coreTheme is the emotional anchor.
It must be 3–4 short sentences and follow this arc:
  1. Name the tension
  2. Describe how it feels internally
  3. Introduce a gentle contradiction
  4. End with containment, not resolution
Do NOT promise clarity. Do NOT imply something is coming. Do NOT create anticipation.
Leave space, not answers.

Field Intent Rules

strengths
  Exactly 3 items
  Each item may be up to ~20 words
  Written as single flowing sentences
  Frame as what the user is already carrying or doing quietly
  Situational, understated, non-heroic

frictions (renamed from watchOuts)
  Exactly 2 items
  Each item may be up to ~20 words
  Written as single flowing sentences
  Describe natural energy leaks or mental drag
  No warnings, no judgments

next7Days
  Exactly 3 items
  Each line:
    - starts with a verb
    - ≤ 10 words
    - framed as attention or awareness, not action
  Think "what may be noticed," not "what should be done."

Output Format (STRICT)
Return ONLY valid JSON with the keys below. No markdown. No commentary. No extra text.

{
  "headline": "string – 6–12 words, situational not abstract",
  "coreTheme": "string – 3–4 short sentences following the CoreTheme Rule",
  "strengths": [
    "exactly 3 strings, each written as a single sentence, up to ~20 words"
  ],
  "frictions": [
    "exactly 2 strings, each written as a single sentence, up to ~20 words"
  ],
  "next7Days": [
    "exactly 3 strings, each ≤ 10 words, awareness-focused"
  ],
  "journalPrompt": "one simple career-focused question (e.g., 'What are you most unsure about in your career right now?')",
  "disclaimer": "one sentence reminding this is a lens, not a rule, and the user decides what matters"
}

Engagement Rule
Leave the user with a feeling of:
  "This resonates — and I choose what to keep."
Do not ask follow-up questions. Do not create urgency.

CRITICAL
Output ONLY valid JSON
No markdown
No explanations`
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
 * Define calculation tools for OpenAI function calling
 */
function getCalculationTools() {
  return [
    {
      type: "function" as const,
      function: {
        name: "calculate_numerology",
        description:
          "Calculate numerology profile including Life Path Number, Expression Number, Soul Urge Number, and Personal Year",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Full name of the person",
            },
            birthDate: {
              type: "string",
              description: "Birth date in YYYY-MM-DD format",
            },
          },
          required: ["name", "birthDate"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "calculate_chinese_astrology",
        description:
          "Calculate Chinese astrology profile including zodiac sign, element, yin/yang, and associated traits",
        parameters: {
          type: "object",
          properties: {
            birthDate: {
              type: "string",
              description: "Birth date in YYYY-MM-DD format",
            },
          },
          required: ["birthDate"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "calculate_birth_chart",
        description:
          "Calculate Vedic birth chart with planetary positions, ascendant, and Moon's nakshatra",
        parameters: {
          type: "object",
          properties: {
            birthDate: {
              type: "string",
              description: "Birth date in YYYY-MM-DD format",
            },
            birthTime: {
              type: "string",
              description: "Birth time in HH:MM format (24-hour)",
            },
            birthCity: {
              type: "string",
              description: "City of birth for timezone calculation",
            },
          },
          required: ["birthDate"],
        },
      },
    },
  ];
}

/**
 * Execute a tool call and return the result
 */
async function executeToolCall(
  toolName: string,
  toolArgs: Record<string, unknown>
): Promise<string> {
  try {
    switch (toolName) {
      case "calculate_numerology": {
        const { calculateNumerologyProfile } = await import(
          "./calculations/numerology"
        );
        const result = calculateNumerologyProfile(
          toolArgs.name as string,
          toolArgs.birthDate as string
        );
        return JSON.stringify(result, null, 2);
      }

      case "calculate_chinese_astrology": {
        const { calculateChineseAstrology } = await import(
          "./calculations/chinese-astrology"
        );
        const result = calculateChineseAstrology(
          toolArgs.birthDate as string
        );
        return JSON.stringify(result, null, 2);
      }

      case "calculate_birth_chart": {
        const { calculateBirthChart } = await import(
          "./calculations/vedic-astrology"
        );
        const result = calculateBirthChart(
          toolArgs.birthDate as string,
          toolArgs.birthTime as string,
          toolArgs.birthCity as string
        );
        return JSON.stringify(result, null, 2);
      }

      default:
        return JSON.stringify({ error: "Unknown tool" });
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return JSON.stringify({
      error: `Failed to execute ${toolName}: ${error}`,
    });
  }
}

/**
 * Generate a reading using OpenAI with function calling support
 */
export async function generateReading(
  inputs: UserInput
): Promise<ReadingResponse> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(inputs);
  const openai = getOpenAIClient();
  const tools = getCalculationTools();

  try {
    // First API call with tools
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    let completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
      top_p: 1,
    });

    let assistantMessage = completion.choices[0]?.message;

    // Handle tool calls if present
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Add assistant's message with tool calls
      messages.push({
        role: "assistant",
        content: assistantMessage.content || "",
        tool_calls: assistantMessage.tool_calls,
      });

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type === "function") {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          const toolResult = await executeToolCall(
            functionName,
            functionArgs
          );

          // Add tool result to messages
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }
      }

      // Make second API call with tool results
      completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.2,
        top_p: 1,
        response_format: { type: "json_object" },
      });

      assistantMessage = completion.choices[0]?.message;
    }

    const content = assistantMessage?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    return parseJsonResponse(content);
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}
