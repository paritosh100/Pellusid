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
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0c] text-white selection:bg-teal-500/30">
            {/* Noise Layer */}
            <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.05]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Static Background Blobs */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-[#1e1b4b] rounded-full mix-blend-screen blur-[120px] opacity-60" />
                <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] bg-[#0d9488] rounded-full mix-blend-screen blur-[100px] opacity-40" />
                <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-[#3c896d]/20 rounded-full mix-blend-screen blur-[80px]" />
            </div>

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
