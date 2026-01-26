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
}

const CAREER_QUESTIONS = [
    "What are you most unsure about in your career right now?",
    "What's holding you back from making a career change?",
    "Where do you feel most stuck in your professional life?",
    "What career decision are you avoiding?",
];

export function JournalPrompt({ journalPrompt, userInputs, readingId }: JournalPromptProps) {
    const [showOptions, setShowOptions] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const [customQuestion, setCustomQuestion] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);
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
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-[#50ffb1]/20 to-[#8ae1fc]/20 dark:from-[#3c896d]/40 dark:to-[#546d64]/40">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Career Reflection</CardTitle>
                    <SectionFeedback section="journalPrompt" readingId={readingId} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {showOptions && !answer && (
                    <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Choose a question to explore, or ask your own:
                        </p>

                        {/* Predefined Questions */}
                        <div className="space-y-2">
                            {CAREER_QUESTIONS.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuestionSelect(question)}
                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${selectedQuestion === question
                                        ? "border-[#3c896d] dark:border-[#50ffb1] bg-[#50ffb1]/10 dark:bg-[#3c896d]/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-[#3c896d]/50 dark:hover:border-[#50ffb1]/50"
                                        }`}
                                >
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {question}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* Custom Question Option */}
                        {!showCustomInput ? (
                            <button
                                onClick={handleCustomQuestionClick}
                                className="w-full text-left p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#3c896d] dark:hover:border-[#50ffb1] transition-all duration-200"
                            >
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
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
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                            >
                                Skip
                            </Button>
                        </div>
                    </>
                )}

                {/* Answer Display */}
                {answer && (
                    <div className="space-y-4">
                        <div className="p-4 bg-[#50ffb1]/10 dark:bg-[#3c896d]/20 rounded-lg border border-[#50ffb1]/30 dark:border-[#3c896d]/30">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Your Question:
                            </p>
                            <p className="text-base italic text-gray-800 dark:text-gray-200">
                                {selectedQuestion || customQuestion || journalPrompt}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-purple-200 dark:border-purple-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                Astrological Insights
                            </h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
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
