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
        selectedBg: 'bg-stitch-accent text-white border-stitch-accent',
        hoverBorder: 'hover:border-stitch-accent/40',
        hoverText: 'hover:text-stitch-accent'
    },
    {
        type: 'useful' as SectionReaction,
        label: 'Useful',
        selectedBg: 'bg-stitch-accent text-white border-stitch-accent',
        hoverBorder: 'hover:border-stitch-accent/40',
        hoverText: 'hover:text-stitch-accent'
    },
    {
        type: 'vague' as SectionReaction,
        label: 'Vague',
        selectedBg: 'bg-stitch-light-green text-stitch-accent border-stitch-accent/30',
        hoverBorder: 'hover:border-stitch-accent/40',
        hoverText: 'hover:text-stitch-accent'
    },
    {
        type: 'off' as SectionReaction,
        label: 'Off',
        selectedBg: 'bg-[#fafaf8] text-gray-900 border-gray-400',
        hoverBorder: 'hover:border-red-200',
        hoverText: 'hover:text-red-600'
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
        <div className="flex items-center gap-1.5 flex-wrap">
            {reactions.map(({ type, label, selectedBg, hoverBorder, hoverText }) => (
                <button
                    key={type}
                    onClick={() => handleReaction(type)}
                    disabled={isSubmitting}
                    className={`
                        h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border
                        ${selectedReaction === type
                            ? selectedBg
                            : `bg-white text-gray-400 border-gray-100 ${hoverBorder} ${hoverText}`
                        }
                    `}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

