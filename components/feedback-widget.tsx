'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface FeedbackWidgetProps {
    readingId: string;
}

export function FeedbackWidget({ readingId }: FeedbackWidgetProps) {
    const [feedbackText, setFeedbackText] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    readingId,
                    feedbackText,
                    rating: rating || undefined,
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="p-3 text-center bg-teal-900/30 border border-teal-500/30 rounded-lg">
                <p className="text-xs text-teal-200" style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                    ✓ Thank you for your feedback!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-3 bg-[#0f2f2a]/60 backdrop-blur-sm rounded-lg border border-teal-500/20">
            {/* Overall Rating */}
            <div>
                <label className="text-xs font-semibold mb-2 block text-white" style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                    Overall rating
                </label>
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-6 w-6 ${star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-500'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Text Feedback */}
            <div>
                <label className="text-xs font-semibold mb-2 block text-white" style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                    What would make this more helpful?
                </label>
                <Textarea
                    placeholder="Share your thoughts..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="resize-none text-xs bg-black/30 border-white/10 text-white placeholder:text-gray-400 focus:border-teal-400/50 focus:ring-teal-400/50"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                    {feedbackText.length}/500 characters
                </p>
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !rating}
                className="w-full bg-teal-600/80 hover:bg-teal-600 text-white text-xs py-2 border border-teal-500/30 shadow-lg"
                size="sm"
                style={{ textShadow: '0 0 8px rgba(255,255,255,0.2)' }}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
        </div>
    );
}
