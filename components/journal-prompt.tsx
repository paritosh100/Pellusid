"use client";

/**
 * Journal Prompt Component
 * Interactive component with predefined career questions or custom question option
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionFeedback } from "@/components/section-feedback";
import { MessageSquare, ArrowRight } from "lucide-react";
import type { UserInput, ReadingMode } from "@/lib/types";


interface JournalPromptProps {
    journalPrompt: string;
    userInputs: UserInput;
    readingId: string;
    savedAnswer?: string | null;
    savedQuestion?: string | null;
    onAnswerGenerated?: (question: string, answer: string) => void;
    onOpenFeedback?: () => void;
    mode?: ReadingMode;
}

const CAREER_QUESTIONS = [
    "What feels unclear or unsettled in your career right now?",
    "Which career direction feels most conflicted for you at the moment?",
    "What makes change feel harder than it should right now?",
    "Is there a career decision you keep circling but not committing to?",
    "What kind of work feels closer to \"right,\" even if you can't explain why?",
];

export function JournalPrompt({ journalPrompt, userInputs, readingId, savedAnswer, savedQuestion, onAnswerGenerated, onOpenFeedback, mode }: JournalPromptProps) {
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
                    mode: mode || 'normal',
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
        <Card className="mb-0 sm:mb-8 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 bg-gray-50/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2 pt-2 px-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-4xl font-bold text-stitch-green font-playfair">Interpreting with AI</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-8">

                {showOptions && !answer && (
                    <>
                        <p className="text-sm text-gray-600 font-inter">
                            Choose a dimension to deepen your insight, or ask your own:
                        </p>


                        {/* Predefined Questions */}
                        <div className="space-y-3">
                            {CAREER_QUESTIONS.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuestionSelect(question)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all duration-300 font-inter ${selectedQuestion === question
                                        ? "border-stitch-accent bg-stitch-light-green text-stitch-accent"
                                        : "border-[#f0f0f0] bg-white hover:border-stitch-accent/30 hover:bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    <p className="text-sm font-medium">
                                        {question}
                                    </p>
                                </button>

                            ))}
                        </div>


                        {/* Custom Question Option */}
                        {!showCustomInput ? (
                            <button
                                onClick={handleCustomQuestionClick}
                                className="w-full text-left p-3 rounded-xl border border-dashed border-gray-200 hover:border-stitch-accent/40 hover:bg-gray-50 transition-all duration-300 group"
                            >
                                <p className="text-sm text-gray-500 group-hover:text-stitch-accent italic font-inter font-medium">
                                    ✏️ Ask your own question...
                                </p>
                            </button>


                        ) : (
                            <div className="space-y-2">
                                <textarea
                                    value={customQuestion}
                                    onChange={(e) => setCustomQuestion(e.target.value)}
                                    placeholder="Type your career question here..."
                                    className="w-full p-4 rounded-xl border-2 border-stitch-accent bg-white text-stitch-dark-green focus:outline-none focus:ring-4 focus:ring-stitch-accent/10 min-h-[100px] resize-none font-inter text-sm"


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
                                className="flex-1 bg-stitch-accent hover:bg-stitch-accent/90 text-white font-bold py-6 rounded-2xl shadow-lg shadow-stitch-accent/20 transition-all active:scale-[0.98]"
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
                                className="flex-1 py-6 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500 font-bold transition-all"
                            >
                                Skip
                            </Button>

                        </div>

                        {/* Feedback button */}
                        <div className="mt-8 pt-6 border-t border-[#e4e4e0]">
                            <button
                                onClick={onOpenFeedback}
                                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 hover:text-stitch-accent uppercase tracking-[0.2em] transition-colors"
                            >
                                <MessageSquare className="w-3 h-3" />
                                Share Your Feedback
                            </button>

                        </div>

                    </>
                )}

                {answer && (
                    <div className="space-y-8">
                        <div className="p-6 bg-stitch-light-green/50 rounded-2xl border border-stitch-green/10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stitch-green/80 mb-3">
                                YOUR QUESTION
                            </p>

                            <p className="text-xl font-bold font-inter text-stitch-dark-green">
                                "{selectedQuestion || customQuestion || journalPrompt}"
                            </p>

                        </div>

                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-stitch-green font-playfair">
                                Pattern Insights
                            </h3>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-lg text-stitch-dark-green font-inter leading-relaxed whitespace-pre-line">
                                    {answer}
                                </p>
                            </div>
                        </div>



                        {/* Feedback pills */}
                        <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resonates?</span>
                            <SectionFeedback section="journalPrompt" readingId={readingId} />
                        </div>


                    </div>
                )}

                {/* Message when skipped */}
                {!showOptions && !answer && (
                    <div className="py-12 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                            <ArrowRight className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-lg text-gray-500 italic mb-8 font-inter">
                            You can always explore deeper career insights later.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <a
                                href="/"
                                className="flex-1 bg-stitch-accent hover:bg-stitch-accent/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-stitch-accent/20 transition-all text-center uppercase tracking-widest text-xs"
                            >
                                Go Home
                            </a>

                            <button
                                onClick={onOpenFeedback}
                                className="flex-1 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-xs"
                            >
                                Feedback
                            </button>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
