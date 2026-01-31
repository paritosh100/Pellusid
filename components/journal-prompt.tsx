"use client";

/**
 * Journal Prompt Component
 * Interactive component with predefined career questions or custom question option
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionFeedback } from "@/components/section-feedback";
import type { UserInput } from "@/lib/types";

interface JournalPromptProps {
    journalPrompt: string;
    userInputs: UserInput;
    readingId: string;
    savedAnswer?: string | null;
    savedQuestion?: string | null;
    onAnswerGenerated?: (question: string, answer: string) => void;
}

const CAREER_QUESTIONS = [
    "What feels unclear or unsettled in your career right now?",
    "Which career direction feels most conflicted for you at the moment?",
    "What makes change feel harder than it should right now?",
    "Is there a career decision you keep circling but not committing to?",
    "What kind of work feels closer to \"right,\" even if you can't explain why?",
];

export function JournalPrompt({ journalPrompt, userInputs, readingId, savedAnswer, savedQuestion, onAnswerGenerated }: JournalPromptProps) {
    const [showOptions, setShowOptions] = useState(!savedAnswer);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(savedQuestion || null);
    const [customQuestion, setCustomQuestion] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [answer, setAnswer] = useState<string | null>(savedAnswer || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleQuestionSelect = (question: string) => {
        setSelectedQuestion(question);
        setShowCustomInput(false);
    };

    const handleCustomQuestionClick = () => {
        setShowCustomInput(true);
        setSelectedQuestion(null);
    };

    const handleExplore = async () => {
        const questionToAsk = showCustomInput ? customQuestion : (selectedQuestion || journalPrompt);

        if (showCustomInput && !customQuestion.trim()) {
            setError("Please enter a question");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/answer-prompt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    journalPrompt: questionToAsk,
                    isCustom: showCustomInput,
                    userInputs,
                    readingId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || "Failed to generate answer");
            }

            setAnswer(data.answer);
            setShowOptions(false);

            // Notify parent component to persist the answer
            if (onAnswerGenerated) {
                onAnswerGenerated(questionToAsk, data.answer);
            }
        } catch (err) {
            console.error("Error generating answer:", err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        setShowOptions(false);
    };

    return (
        <Card className="mb-0 sm:mb-6 shadow-none sm:shadow-lg border-0 bg-transparent sm:bg-gradient-to-br from-[#50ffb1]/20 to-[#8ae1fc]/20 dark:from-[#3c896d]/40 dark:to-[#546d64]/40">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent">Career Reflection</CardTitle>
                    <div className="self-end sm:self-auto">
                        <SectionFeedback section="journalPrompt" readingId={readingId} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {showOptions && !answer && (
                    <>
                        <p className="text-sm text-white mb-4" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                            Choose a question to explore, or ask your own:
                        </p>

                        {/* Predefined Questions */}
                        <div className="space-y-2">
                            {CAREER_QUESTIONS.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuestionSelect(question)}
                                    className={`w-full text-left p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${selectedQuestion === question
                                        ? "border-teal-400 bg-teal-500/20"
                                        : "border-white/20 hover:border-teal-400/60 hover:bg-teal-500/10"
                                        }`}
                                >
                                    <p className="text-sm text-white leading-relaxed" style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                                        {question}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* Custom Question Option */}
                        {!showCustomInput ? (
                            <button
                                onClick={handleCustomQuestionClick}
                                className="w-full text-left p-2 sm:p-3 rounded-lg border-2 border-dashed border-white/30 hover:border-teal-400/60 hover:bg-teal-500/10 transition-all duration-200"
                            >
                                <p className="text-sm text-white italic" style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                                    ✏️ Ask your own question...
                                </p>
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <textarea
                                    value={customQuestion}
                                    onChange={(e) => setCustomQuestion(e.target.value)}
                                    placeholder="Type your career question here..."
                                    className="w-full p-3 rounded-lg border-2 border-[#3c896d] dark:border-[#50ffb1] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3c896d] dark:focus:ring-[#50ffb1] min-h-[80px] resize-none"
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        setShowCustomInput(false);
                                        setCustomQuestion("");
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    ← Back to options
                                </button>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center pt-4">
                            <Button
                                onClick={handleExplore}
                                disabled={isLoading || (!selectedQuestion && !customQuestion.trim())}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ textShadow: '0 0 10px rgba(255,255,255,0.4)' }}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Thinking...
                                    </span>
                                ) : (
                                    "Get Insights"
                                )}
                            </Button>
                            <Button
                                onClick={handleSkip}
                                disabled={isLoading}
                                variant="outline"
                                className="px-6 py-2 border-2 border-teal-400/50 bg-black/20 text-white hover:bg-teal-500/20 hover:border-teal-400 transition-all duration-300"
                                style={{ textShadow: '0 0 10px rgba(255,255,255,0.4)' }}
                            >
                                Skip
                            </Button>
                        </div>
                    </>
                )}

                {/* Answer Display */}
                {answer && (
                    <div className="space-y-4">
                        <div className="p-4 bg-teal-900/30 rounded-lg border border-teal-500/30">
                            <p className="text-sm font-medium text-white mb-2" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                                Your Question:
                            </p>
                            <p className="text-base italic text-white" style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                                {selectedQuestion || customQuestion || journalPrompt}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-teal-500/30">
                            <h3 className="text-lg font-semibold text-white mb-3" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                                Pattern Insights
                            </h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-white leading-relaxed whitespace-pre-line text-base" style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                                    {answer}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message when skipped */}
                {!showOptions && !answer && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
                        You can always explore career questions later.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
