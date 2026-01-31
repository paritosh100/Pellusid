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
            <Card className="shadow-lg border border-teal-500/20 bg-[#0f2f2a]/60 backdrop-blur-sm">
                <CardContent className="pt-4 pb-3 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/20 mb-2">
                        <Sparkles className="w-4 h-4 text-teal-300" />
                    </div>
                    <p className="text-sm font-medium text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                        Thanks for your feedback!
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                        Your vote for <span className="font-semibold text-teal-300">
                            {APP_NAME_OPTIONS.find(opt => opt.id === selectedName)?.name}
                        </span> has been recorded.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border border-teal-500/20 bg-[#0f2f2a]/60 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-300" />
                    <CardTitle className="text-sm text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                        Help Us Choose a Name!
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-gray-300">
                    Which name resonates most with you?
                </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3">
                {error && (
                    <div className="mb-2 p-2 rounded-lg bg-red-900/30 border border-red-500/30">
                        <p className="text-xs text-red-300">{error}</p>
                    </div>
                )}
                <div className="grid gap-2">
                    {APP_NAME_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            disabled={loading}
                            className="group relative p-2.5 rounded-lg border-2 border-white/10
                                     hover:border-teal-400/50 hover:bg-teal-500/10
                                     transition-all duration-200 text-left
                                     focus:outline-none focus:ring-2 focus:ring-teal-400/50
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-sm text-white group-hover:text-teal-200 transition-colors"
                                        style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                                        {option.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-300 mt-0.5">
                                        {option.description}
                                    </p>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 border-white/20 
                                              group-hover:border-teal-400/50
                                              transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
