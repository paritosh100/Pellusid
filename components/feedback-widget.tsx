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
            <div className="p-6 text-center bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-700 dark:text-green-300">
                    ✓ Thank you for your feedback!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Overall Rating */}
            <div>
                <label className="text-base font-semibold mb-3 block text-gray-900 dark:text-gray-100">
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
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Text Feedback */}
            <div>
                <label className="text-base font-semibold mb-3 block text-gray-900 dark:text-gray-100">
                    What would make this more helpful?
                </label>
                <Textarea
                    placeholder="Share your thoughts..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    className="resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {feedbackText.length}/1000 characters
                </p>
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !rating}
                className="w-full bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                size="lg"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
        </div>
    );
}
