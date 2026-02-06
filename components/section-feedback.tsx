'use client';

import { useState } from 'react';

interface SectionFeedbackProps {
    section: 'headline' | 'coreTheme' | 'strengths' | 'frictions' | 'next7Days' | 'journalPrompt';
    readingId: string;
}

type SectionReaction = 'hit' | 'useful' | 'vague' | 'off';

const reactions = [
    {
        type: 'hit' as SectionReaction,
        label: 'Hit',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800',
        selectedBg: 'bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500',
        hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    },
    {
        type: 'useful' as SectionReaction,
        label: 'Useful',
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800',
        selectedBg: 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500',
        hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    },
    {
        type: 'vague' as SectionReaction,
        label: 'Vague',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-800',
        selectedBg: 'bg-amber-600 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-500',
        hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    },
    {
        type: 'off' as SectionReaction,
        label: 'Off',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
        selectedBg: 'bg-red-600 dark:bg-red-500 text-white border-red-600 dark:border-red-500',
        hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    },
];

export function SectionFeedback({ section, readingId }: SectionFeedbackProps) {
    const [selectedReaction, setSelectedReaction] = useState<SectionReaction | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReaction = async (reaction: SectionReaction) => {
        setSelectedReaction(reaction);
        setIsSubmitting(true);

        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    readingId,
                    sectionRatings: {
                        [section]: {
                            reaction,
                            helpful: reaction === 'hit' || reaction === 'useful'
                        }
                    }
                }),
            });
        } catch (error) {
            console.error('Failed to submit section feedback:', error);
            setSelectedReaction(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-1.5">
            {reactions.map(({ type, label, textColor, borderColor, selectedBg, hoverBg }) => (
                <button
                    key={type}
                    onClick={() => handleReaction(type)}
                    disabled={isSubmitting}
                    className={`
            h-8 px-3 sm:h-6 sm:px-2.5 md:h-7 md:px-3 rounded-full text-xs sm:text-[10px] md:text-xs font-medium transition-all border
            ${selectedReaction === type
                            ? selectedBg
                            : `bg-white dark:bg-gray-900 ${textColor} ${borderColor} ${hoverBg}`
                        }
          `}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
