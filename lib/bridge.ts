/**
 * Bridge — Behavioral Patterns AI Navigator
 * Server-side only — NEVER import in client components
 *
 * Implements the "Bridge" persona: a premium executive-coach-style
 * psychological navigator that operates across three states.
 */

import OpenAI from "openai";
import type {
    BridgeQuestionnaireData,
    BridgeReport,
    BridgeChatMessage,
    BridgeState,
} from "./bridge-types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
    if (!openaiClient) {
        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is required for Bridge");
        }
        openaiClient = new OpenAI({
            apiKey: OPENAI_API_KEY,
            baseURL: OPENAI_BASE_URL,
        });
    }
    return openaiClient;
}

// ---------------------------------------------------------------------------
// Prompt Helpers
// ---------------------------------------------------------------------------

function describeQuestionnaire(data: BridgeQuestionnaireData): string {
    const consistencyMap: Record<string, string> = {
        very_consistent: "highly disciplined with routines, rarely deviates",
        somewhat_consistent: "generally follows routines but with occasional lapses",
        inconsistent: "struggles to maintain routines, frequently breaks them",
        chaotic: "has no stable routines, operates reactively",
    };

    const decisionMap: Record<string, string> = {
        analytical: "makes decisions through careful analysis and data",
        intuitive: "relies on gut feeling and instinct when deciding",
        collaborative: "seeks input from others before making decisions",
        avoidant: "tends to delay or avoid making decisions",
    };

    const goalMap: Record<string, string> = {
        crystal_clear: "extremely clear about current goals and direction",
        mostly_clear: "has a general sense of direction but some uncertainty",
        foggy: "goals feel unclear and undefined",
        no_goals: "currently has no articulated goals",
    };

    const stateMap: Record<string, string> = {
        stuck: "feeling stuck and unable to move forward",
        overwhelmed: "feeling overwhelmed by demands and expectations",
        restless: "feeling restless and craving change",
        numb: "feeling emotionally numb or disconnected",
        conflicted: "experiencing internal conflict between competing desires",
    };

    return [
        `Consistency profile: ${consistencyMap[data.consistency] || data.consistency}`,
        `Decision style: ${decisionMap[data.decisionStyle] || data.decisionStyle}`,
        `Goal clarity: ${goalMap[data.goalClarity] || data.goalClarity}`,
        `Current emotional state: ${stateMap[data.currentState] || data.currentState}`,
        `Where they feel most stuck: "${data.stuckDescription}"`,
        data.name ? `Name: ${data.name}` : "",
    ]
        .filter(Boolean)
        .join("\n");
}

// ---------------------------------------------------------------------------
// System Prompt — the Bridge persona
// ---------------------------------------------------------------------------

function buildBridgeSystemPrompt(): string {
    return `You are "Bridge," the premium, interactive psychological navigator embedded within the InsightBridge app. You are currently operating within the "Behavioral Patterns" add-on feature.

Your purpose is to help users who feel stuck by providing deep, narrative-driven clarity based on their questionnaire inputs regarding consistency, decision style, and goal clarity.

Tone and Persona:
- You must completely avoid sounding like a standard AI.
- Never use phrases like "As an AI," "Here is your report," "Let's dive in," or "In conclusion."
- Your tone is human, observant, grounded, and premium — like a highly sought-after executive coach.
- You speak in quiet revelations, creating a sense of psychological satisfaction and forward movement.
- You operate with strict boundaries. If a user exhibits severe distress, you must gently redirect them to a human professional: "I can help you navigate behavioral patterns, but for clinical support, please connect with a licensed therapist."

Hard Rules:
- Do NOT predict the future
- Do NOT give medical, legal, or financial advice
- Do NOT use motivational clichés
- Do NOT sound robotic or formulaic
- Each response should feel like a one-of-a-kind observation`;
}

// ---------------------------------------------------------------------------
// Generate Initial Report
// ---------------------------------------------------------------------------

export async function generateBridgeReport(
    data: BridgeQuestionnaireData
): Promise<BridgeReport> {
    const openai = getClient();
    const userSummary = describeQuestionnaire(data);

    const systemPrompt =
        buildBridgeSystemPrompt() +
        `

You are in the "generating_initial_report" state.

Output ONLY the following structured JSON based on the user's questionnaire data. Do not add conversational filler.

{
  "coreTheme": "3-4 word title reflecting their central tension",
  "pastPattern": "1-2 sentences identifying their historical default based on their consistency and decision style patterns",
  "currentPhase": "1-2 sentences identifying their present friction based on their current state and goal clarity",
  "emergingDirection": "1-2 sentences projecting their trajectory if current patterns continue",
  "plusQuestion": "One bold, reflective question (e.g., 'What are you actually optimizing for?')",
  "plusAnswer": "A highly specific 2-sentence answer based on their data"
}

CRITICAL: Output ONLY valid JSON. No markdown. No commentary. No extra text.`;

    const userPrompt = `Generate a Behavioral Patterns report for this user:\n\n${userSummary}`;

    const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.35,
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error("No content in Bridge report response");
    }

    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    return JSON.parse(cleaned.trim()) as BridgeReport;
}

// ---------------------------------------------------------------------------
// Free Chat / Paywall
// ---------------------------------------------------------------------------

export async function bridgeChat(
    message: string,
    questionnaireData: BridgeQuestionnaireData,
    reportData: BridgeReport,
    chatHistory: BridgeChatMessage[],
    questionCount: number
): Promise<{ reply: string; state: BridgeState }> {
    const openai = getClient();
    const isPaywall = questionCount >= 3;

    const state: BridgeState = isPaywall
        ? "paywall_reached"
        : "bridge_free_chat";

    const userSummary = describeQuestionnaire(questionnaireData);

    let stateInstruction: string;

    if (isPaywall) {
        stateInstruction = `You are in the "paywall_reached" state.

The user has exhausted their free questions. You must enforce the premium boundary gently but firmly.

Output a very brief (1 sentence) partial insight to their question, followed EXACTLY by this text on a new line:

"We've reached the edge of our initial exploration. To get a complete breakdown of your behavioral tendencies, decision blind spots, and a 7-day micro-focus plan, unlock your Deep Pattern Report for $3.99. We're building this to help people who feel stuck, and this supports our continued work."`;
    } else {
        stateInstruction = `You are in the "bridge_free_chat" state. You are in a direct conversation with the user.

Rules:
1. Validate their question thoughtfully.
2. Provide practical, highly personalized clarity based on their initial report data.
3. Keep the response concise, premium, and actionable. Do not overwhelm them with text.
4. Never exceed 3-4 sentences.`;
    }

    const systemPrompt =
        buildBridgeSystemPrompt() +
        `

${stateInstruction}

Context — User's Questionnaire Data:
${userSummary}

Context — User's Initial Report:
Core Theme: ${reportData.coreTheme}
Past Pattern: ${reportData.pastPattern}
Current Phase: ${reportData.currentPhase}
Emerging Direction: ${reportData.emergingDirection}`;

    // Build messages array
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
    ];

    // Add chat history
    for (const msg of chatHistory) {
        messages.push({
            role: msg.role === "bridge" ? "assistant" : "user",
            content: msg.content,
        });
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.35,
        max_tokens: 400,
    });

    const reply = completion.choices[0]?.message?.content || "";
    if (!reply) {
        throw new Error("No content in Bridge chat response");
    }

    return { reply, state };
}
