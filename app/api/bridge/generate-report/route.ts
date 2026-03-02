/**
 * API Route: Bridge — Generate Initial Report
 * POST /api/bridge/generate-report
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateBridgeReport } from "@/lib/bridge";
import type { BridgeGenerateReportResponse } from "@/lib/bridge-types";

export const dynamic = "force-dynamic";

const BridgeQuestionnaireSchema = z.object({
    consistency: z.enum(["very_consistent", "somewhat_consistent", "inconsistent", "chaotic"]),
    decisionStyle: z.enum(["analytical", "intuitive", "collaborative", "avoidant"]),
    goalClarity: z.enum(["crystal_clear", "mostly_clear", "foggy", "no_goals"]),
    currentState: z.enum(["stuck", "overwhelmed", "restless", "numb", "conflicted"]),
    stuckDescription: z.string().min(1, "Please describe where you feel stuck").max(500),
    name: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = BridgeQuestionnaireSchema.safeParse(body);

        if (!validation.success) {
            const errorMsg = validation.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join(", ");
            return NextResponse.json(
                { error: "Invalid input", details: errorMsg },
                { status: 400 }
            );
        }

        const report = await generateBridgeReport(validation.data);

        return NextResponse.json<BridgeGenerateReportResponse>(
            { report },
            { status: 200 }
        );
    } catch (error) {
        console.error("[Bridge] Report generation error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate report",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
