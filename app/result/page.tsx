/**
 * Result Page - Display Generated Reading
 * Server component that fetches data and passes to client component
 * Supports both normal and stealth mode readings
 */

import { notFound } from "next/navigation";
import { getAnyReading } from "@/lib/storage";
import { ResultClient } from "@/components/result-client";
import { StealthResultClient } from "@/components/stealth-result-client";

// Force dynamic rendering (required for Vercel deployment)
export const dynamic = "force-dynamic";

interface ResultPageProps {
    searchParams: Promise<{ rid?: string }>;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
    const params = await searchParams;
    const readingId = params.rid;

    // Validate reading ID
    if (!readingId) {
        notFound();
    }

    // Fetch reading from either table
    const storedReading = await getAnyReading(readingId);

    if (!storedReading) {
        notFound();
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#fafaf8] text-[#1a2f2a]">
            {/* Client Component - render based on mode */}
            <div className="relative z-10">

                {storedReading.mode === 'stealth' ? (
                    <StealthResultClient
                        reading={storedReading.reading}
                        inputs={storedReading.inputs}
                        readingId={readingId}
                    />
                ) : (
                    <ResultClient
                        reading={storedReading.reading}
                        inputs={storedReading.inputs}
                        readingId={readingId}
                    />
                )}
            </div>
        </div>
    );
}
