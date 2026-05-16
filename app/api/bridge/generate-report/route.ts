import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
            console.error("[API Proxy] BACKEND_URL is not configured.");
            return NextResponse.json({ error: "Backend configuration missing" }, { status: 500 });
        }

        const url = `${backendUrl}/api/bridge/generate-report`;

        const body = await request.json();

        const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }

        console.log(`[API Proxy] Forwarding request to ${url}`);

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (!response.ok) {
                console.error(`[API Proxy] Error from Python backend:`, response.status, data);
            }
            return NextResponse.json(data, { status: response.status });
        } else {
            const textData = await response.text();
            console.error(`[API Proxy] Non-JSON error from Python backend:`, response.status, textData);
            return new NextResponse(textData, {
                status: response.status,
                headers: { "Content-Type": "text/plain" }
            });
        }
    } catch (error) {
        console.error("[API Proxy] Request failed:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
