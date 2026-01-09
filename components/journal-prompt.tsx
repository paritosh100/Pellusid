"use client";

/**
 * Journal Prompt Component
 * Interactive component for accepting/rejecting journal prompts
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserInput } from "@/lib/types";

interface JournalPromptProps {
    journalPrompt: string;
    userInputs: UserInput;
    readingId: string;
}

export function JournalPrompt({ journalPrompt, userInputs, readingId }: JournalPromptProps) {
    const [showButtons, setShowButtons] = useState(true);
    const [answer, setAnswer] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/answer-prompt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    journalPrompt,
                    userInputs,
                    readingId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || "Failed to generate answer");
            }

            setAnswer(data.answer);
            setShowButtons(false);
        } catch (err) {
            console.error("Error generating answer:", err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = () => {
        setShowButtons(false);
    };

    return (
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-[#50ffb1]/20 to-[#8ae1fc]/20 dark:from-[#3c896d]/40 dark:to-[#546d64]/40">
            <CardHeader>
                <CardTitle className="text-xl">Something to Think About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Journal Prompt Question */}
                <p className="text-lg italic text-gray-800 dark:text-gray-200">
                    {journalPrompt}
                </p>

                {/* Yes/No Buttons */}
                {showButtons && !answer && (
                    <div className="flex gap-3 justify-center pt-2">
                        <Button
                            onClick={handleAccept}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 transition-all duration-300 shadow-md hover:shadow-lg"
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
                                "Yes, explore this"
                            )}
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={isLoading}
                            variant="outline"
                            className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                        >
                            Not now
                        </Button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                    </div>
                )}

                {/* Answer Display */}
                {answer && (
                    <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            Reflection
                        </h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {answer}
                            </p>
                        </div>
                    </div>
                )}

                {/* Message when rejected */}
                {!showButtons && !answer && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
                        You can always come back to this question later.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
