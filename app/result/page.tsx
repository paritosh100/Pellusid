/**
 * Result Page - Display Generated Reading
 * Server component that fetches and renders insights
 */

import { notFound } from "next/navigation";
import { getReading } from "@/lib/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "@/components/share-button";
import { RegenerateButton } from "@/components/regenerate-button";
import { JournalPrompt } from "@/components/journal-prompt";

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

    // Fetch reading from Supabase
    const storedReading = await getReading(readingId);

    if (!storedReading) {
        notFound();
    }

    const { reading, inputs } = storedReading;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#8ae1fc]/10 via-[#50ffb1]/10 to-[#3c896d]/10 dark:from-[#4d685a] dark:via-[#546d64] dark:to-[#3c896d]">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8 space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                        {reading.headline}
                    </h1>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <ShareButton />
                    <RegenerateButton inputs={inputs} />
                </div>

                {/* Core Theme */}
                <Card className="mb-6 shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {reading.coreTheme}
                        </p>
                    </CardContent>
                </Card>

                {/* Strengths */}
                <Card className="mb-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">What's Working</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {reading.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-green-600 dark:text-green-400 mt-1 text-lg">✓</span>
                                    <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Watch Outs */}
                <Card className="mb-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Things to Watch</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {reading.watchOuts.map((watchOut, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-amber-600 dark:text-amber-400 mt-1 text-lg">⚠</span>
                                    <span className="text-gray-700 dark:text-gray-300">{watchOut}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Next 7 Days */}
                <Card className="mb-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Next 7 Days</CardTitle>
                        <CardDescription>Focus areas to consider</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {reading.next7Days.map((focus, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="text-[#3c896d] dark:text-[#50ffb1] mt-1 font-bold">
                                        {index + 1}.
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-300">{focus}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Journal Prompt */}
                <JournalPrompt journalPrompt={reading.journalPrompt} userInputs={inputs} readingId={readingId} />

                {/* Disclaimer */}
                <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reading.disclaimer}
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <a
                        href="/"
                        className="text-[#3c896d] dark:text-[#50ffb1] hover:underline font-medium"
                    >
                        ← Generate Another Reading
                    </a>
                </div>
            </div>
        </div>
    );
}
