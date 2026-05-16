/**
 * ADK Client for Next.js integration
 * Provides functions to call the ADK backend from Next.js API routes
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export interface ADKReadingRequest {
    name: string;
    birthDate: string;
    birthTime?: string;
    birthCity: string;
    focusArea?: string;
}

export interface ADKReadingResponse {
    headline: string;
    coreTheme: string;
    strengths: string[];
    frictions: string[];
    next7Days: string[];
    journalPrompt: string;
    disclaimer: string;
    _metadata?: {
        systems_analyzed: string[];
        model_used: string;
        workflow: string;
    };
}

export interface ADKJournalRequest {
    journalPrompt: string;
    userInputs: {
        name?: string;
        birthDate?: string;
        birthCity?: string;
        focusArea?: string;
    };
    readingId?: string;
}

export interface ADKJournalResponse {
    answer: string;
}

export interface BridgeReport {
    synthesis: string;
    keyThemes: string[];
    actionableAdvice: string[];
    disclaimer: string;
}

export interface BridgeMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface BridgeChatRequest {
    messages: BridgeMessage[];
    questionnaireData?: any;
}

export interface BridgeChatResponse {
    message: string;
    paywallTriggered?: boolean;
}

/**
 * Generate a reading using the ADK multi-agent backend
 */
export async function generateReadingWithADK(
    request: ADKReadingRequest
): Promise<ADKReadingResponse> {
    const response = await fetch(`${BACKEND_URL}/api/generate-reading-hybrid`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`ADK Backend error: ${error.detail || response.statusText}`);
    }

    return await response.json();
}

/**
 * Answer a journal prompt using the ADK backend
 */
export async function answerPromptWithADK(
    request: ADKJournalRequest
): Promise<ADKJournalResponse> {
    const response = await fetch(`${BACKEND_URL}/api/answer-prompt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`ADK Backend error: ${error.detail || response.statusText}`);
    }

    return await response.json();
}

/**
 * Check health of ADK backend
 */
export async function checkADKHealth(): Promise<{ status: string; version: string }> {
    const response = await fetch(`${BACKEND_URL}/health`);

    if (!response.ok) {
        throw new Error("ADK Backend is not healthy");
    }

    return await response.json();
}

/**
 * Generate a Bridge Report using the Python backend
 */
export async function generateBridgeReport(
    questionnaireData: any
): Promise<BridgeReport> {
    const response = await fetch(`${BACKEND_URL}/api/bridge/generate-report`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionnaireData }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`ADK Backend error: ${error.detail || response.statusText}`);
    }

    return await response.json();
}

/**
 * Continue a Bridge Chat using the Python backend
 */
export async function bridgeChat(
    request: BridgeChatRequest
): Promise<BridgeChatResponse> {
    const response = await fetch(`${BACKEND_URL}/api/bridge/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`ADK Backend error: ${error.detail || response.statusText}`);
    }

    return await response.json();
}
