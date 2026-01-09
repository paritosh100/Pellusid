"use client";

/**
 * Regenerate Button Component
 * Submits the same inputs to generate a new reading
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { UserInput } from "@/lib/types";

interface RegenerateButtonProps {
    inputs: UserInput;
}

export function RegenerateButton({ inputs }: RegenerateButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegenerate = async () => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/generate-reading", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || "Failed to regenerate");
            }

            // Redirect to new reading
            router.push(`/result?rid=${data.readingId}`);
        } catch (error) {
            console.error("Regenerate error:", error);
            alert("Failed to regenerate reading. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
            {isLoading ? (
                <>
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
                    Regenerating...
                </>
            ) : (
                <>
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    Regenerate
                </>
            )}
        </Button>
    );
}
