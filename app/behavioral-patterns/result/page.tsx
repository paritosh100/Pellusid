"use client";

/**
 * Behavioral Patterns Result Page
 * Decodes payload from URL and renders the Bridge result client
 */

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BridgeResultClient } from "@/components/bridge-result-client";

function BridgeResultContent() {
    const searchParams = useSearchParams();
    const encoded = searchParams.get("d");

    if (!encoded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
                <p className="text-[#888] text-sm">No report data found. Please complete the questionnaire first.</p>
            </div>
        );
    }

    try {
        const decoded = JSON.parse(atob(decodeURIComponent(encoded)));
        return (
            <BridgeResultClient
                questionnaire={decoded.questionnaire}
                report={decoded.report}
            />
        );
    } catch {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
                <p className="text-red-500 text-sm">Invalid report data. Please try again.</p>
            </div>
        );
    }
}

export default function BridgeResultPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
                    <div className="flex items-center gap-2 text-[#888] text-sm">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading your report...
                    </div>
                </div>
            }
        >
            <BridgeResultContent />
        </Suspense>
    );
}
