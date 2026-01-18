/**
 * ADK Client for Next.js integration
 * Provides functions to call the ADK backend from Next.js API routes
 */

const ADK_BACKEND_URL = process.env.ADK_BACKEND_URL || "http://localhost:8080";

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

/**
 * Generate a reading using the ADK multi-agent backend
 */
export async function generateReadingWithADK(
    request: ADKReadingRequest
): Promise<ADKReadingResponse> {
    const response = await fetch(`${ADK_BACKEND_URL}/api/adk/generate-reading`, {
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
    const response = await fetch(`${ADK_BACKEND_URL}/api/adk/answer-prompt`, {
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
    const response = await fetch(`${ADK_BACKEND_URL}/health`);

    if (!response.ok) {
        throw new Error("ADK Backend is not healthy");
    }

    return await response.json();
}
