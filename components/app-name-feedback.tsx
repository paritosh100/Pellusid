'use client';

/**
 * App Name Feedback Component
 * Allows users to vote on their preferred app name
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const APP_NAME_OPTIONS = [
    { id: 'pellucid', name: 'Pellucid', description: 'Clear, transparent insights' },
    { id: 'intuitwithme', name: 'IntuitWithMe', description: 'Personal intuitive guidance' },
    { id: 'insightbridge', name: 'InsightBridge', description: 'Connecting you to clarity' },
] as const;

export function AppNameFeedback() {
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleVote = async (nameId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/app-name-vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedName: nameId,
                    readingId: typeof window !== 'undefined'
                        ? new URLSearchParams(window.location.search).get('rid')
                        : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setError('You have already voted!');
                } else {
                    setError(data.error || 'Failed to submit vote');
                }
                setLoading(false);
                return;
            }

            setSelectedName(nameId);
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting vote:', err);
            setError('Failed to submit vote. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Card className="mb-6 shadow-lg border-2 border-[#50ffb1]/30 bg-gradient-to-br from-white/95 to-[#50ffb1]/5 dark:from-gray-800/95 dark:to-[#3c896d]/10 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#50ffb1]/20 mb-3">
                        <Sparkles className="w-6 h-6 text-[#3c896d] dark:text-[#50ffb1]" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Thanks for your feedback!
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Your vote for <span className="font-semibold text-[#3c896d] dark:text-[#50ffb1]">
                            {APP_NAME_OPTIONS.find(opt => opt.id === selectedName)?.name}
                        </span> has been recorded.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6 shadow-lg border-2 border-[#50ffb1]/30 bg-gradient-to-br from-white/95 to-[#50ffb1]/5 dark:from-gray-800/95 dark:to-[#3c896d]/10 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#3c896d] dark:text-[#50ffb1]" />
                    <CardTitle className="text-xl">Help Us Choose a Name!</CardTitle>
                </div>
                <CardDescription>
                    Which name resonates most with you?
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}
                <div className="grid gap-3">
                    {APP_NAME_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            disabled={loading}
                            className="group relative p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 
                                     hover:border-[#3c896d] dark:hover:border-[#50ffb1] 
                                     hover:bg-[#50ffb1]/5 dark:hover:bg-[#3c896d]/10
                                     transition-all duration-200 text-left
                                     focus:outline-none focus:ring-2 focus:ring-[#3c896d] dark:focus:ring-[#50ffb1]
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 
                                                 group-hover:text-[#3c896d] dark:group-hover:text-[#50ffb1] 
                                                 transition-colors">
                                        {option.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {option.description}
                                    </p>
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 
                                              group-hover:border-[#3c896d] dark:group-hover:border-[#50ffb1]
                                              transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
