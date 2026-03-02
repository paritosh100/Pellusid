/**
 * API Route: Bridge — Free Chat
 * POST /api/bridge/chat
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bridgeChat } from "@/lib/bridge";
import type { BridgeChatResponse } from "@/lib/bridge-types";

export const dynamic = "force-dynamic";

const BridgeChatSchema = z.object({
    message: z.string().min(1).max(1000),
    questionnaireData: z.object({
        consistency: z.enum(["very_consistent", "somewhat_consistent", "inconsistent", "chaotic"]),
        decisionStyle: z.enum(["analytical", "intuitive", "collaborative", "avoidant"]),
        goalClarity: z.enum(["crystal_clear", "mostly_clear", "foggy", "no_goals"]),
        currentState: z.enum(["stuck", "overwhelmed", "restless", "numb", "conflicted"]),
        stuckDescription: z.string(),
        name: z.string().optional(),
    }),
    reportData: z.object({
        coreTheme: z.string(),
        pastPattern: z.string(),
        currentPhase: z.string(),
        emergingDirection: z.string(),
        plusQuestion: z.string(),
        plusAnswer: z.string(),
    }),
    chatHistory: z.array(
        z.object({
            role: z.enum(["bridge", "user"]),
            content: z.string(),
        })
    ),
    questionCount: z.number().int().min(0),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = BridgeChatSchema.safeParse(body);

        if (!validation.success) {
            const errorMsg = validation.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join(", ");
            return NextResponse.json(
                { error: "Invalid input", details: errorMsg },
                { status: 400 }
            );
        }

        const { message, questionnaireData, reportData, chatHistory, questionCount } =
            validation.data;

        const result = await bridgeChat(
            message,
            questionnaireData,
            reportData,
            chatHistory,
            questionCount
        );

        return NextResponse.json<BridgeChatResponse>(result, { status: 200 });
    } catch (error) {
        console.error("[Bridge] Chat error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate response",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
