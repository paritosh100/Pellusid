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
            <div className="p-6 text-center bg-stitch-light-green rounded-2xl border border-stitch-accent/20">
                <p className="text-sm font-semibold text-stitch-accent">
                    ✓ Thank you for your feedback!
                </p>
            </div>

        );
    }

    return (
        <div className="space-y-6">
            {/* Overall Rating */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-green/80 mb-3 block">
                    Overall rating
                </label>


                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-8 w-8 ${star <= rating
                                    ? 'fill-stitch-accent text-stitch-accent'
                                    : 'text-gray-300'
                                    }`}

                            />

                        </button>
                    ))}
                </div>
            </div>

            {/* Text Feedback */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stitch-green/80 mb-3 block">
                    What would make this more helpful?
                </label>


                <Textarea
                    placeholder="Share your thoughts..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="resize-none text-sm bg-gray-50 border-gray-100 text-stitch-dark-green placeholder:text-gray-400 focus:border-stitch-green/30 focus:ring-0 rounded-xl"
                />
                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                    {feedbackText.length}/500 characters
                </p>
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !rating}
                className="w-full bg-stitch-accent hover:bg-stitch-accent/90 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-stitch-accent/20 transition-all active:scale-[0.98]"

            >
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
            </Button>

        </div>
    );
}

