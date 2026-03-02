/**
 * Type definitions for the Behavioral Patterns (Bridge) add-on feature
 */

// Bridge app states
export type BridgeState = "generating_initial_report" | "bridge_free_chat" | "paywall_reached";

// Questionnaire input data
export interface BridgeQuestionnaireData {
    // Consistency: How consistent are you with your routines?
    consistency: "very_consistent" | "somewhat_consistent" | "inconsistent" | "chaotic";
    // Decision style: How do you typically make decisions?
    decisionStyle: "analytical" | "intuitive" | "collaborative" | "avoidant";
    // Goal clarity: How clear are your current goals?
    goalClarity: "crystal_clear" | "mostly_clear" | "foggy" | "no_goals";
    // Current emotional state
    currentState: "stuck" | "overwhelmed" | "restless" | "numb" | "conflicted";
    // Free-text: Where do you feel most stuck?
    stuckDescription: string;
    // Optional: user name if available
    name?: string;
}

// Structured report output from Bridge
export interface BridgeReport {
    coreTheme: string;           // 3-4 word title reflecting central tension
    pastPattern: string;         // 1-2 sentences on historical default
    currentPhase: string;        // 1-2 sentences on present friction
    emergingDirection: string;   // 1-2 sentences projecting trajectory
    plusQuestion: string;        // Bold reflective question
    plusAnswer: string;          // 2-sentence specific answer
}

// Chat message in Bridge free chat
export interface BridgeChatMessage {
    role: "bridge" | "user";
    content: string;
}

// API request/response types
export interface BridgeGenerateReportRequest {
    questionnaireData: BridgeQuestionnaireData;
}

export interface BridgeGenerateReportResponse {
    report: BridgeReport;
}

export interface BridgeChatRequest {
    message: string;
    questionnaireData: BridgeQuestionnaireData;
    reportData: BridgeReport;
    chatHistory: BridgeChatMessage[];
    questionCount: number;
}

export interface BridgeChatResponse {
    reply: string;
    state: BridgeState;
}
