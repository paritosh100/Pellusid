"use client";

/**
 * Welcome Card Component
 * Displays on first visit to guide users through the results interface
 * Light organic theme with sage-green accents
 */

import { motion } from "framer-motion";
import { X, Sparkles, CheckCircle, AlertTriangle, ArrowRight, AlignLeft } from "lucide-react";

interface WelcomeCardProps {
    onDismiss: () => void;
}

export function WelcomeCard({ onDismiss }: WelcomeCardProps) {
    const sections = [
        {
            icon: <Sparkles className="w-4 h-4" />,
            title: "Core Theme",
            description: "Your primary pattern for this period",
        },
        {
            icon: <CheckCircle className="w-4 h-4" />,
            title: "What's Working",
            description: "Strengths and positive energies",
        },
        {
            icon: <AlertTriangle className="w-4 h-4" />,
            title: "Energy Drains",
            description: "Challenges and friction points",
        },
        {
            icon: <ArrowRight className="w-4 h-4" />,
            title: "Next 7 Days",
            description: "Focus areas to consider",
        },
        {
            icon: <AlignLeft className="w-4 h-4" />,
            title: "Journal Prompt",
            description: "Personalized reflection questions",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex flex-col items-center bg-white border border-[#e4e4e0] rounded-2xl p-5 md:p-8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]"
            style={{ fontFamily: "var(--font-inter), var(--font-geist-sans), system-ui, sans-serif" }}
        >
            {/* Close button */}
            <button
                onClick={onDismiss}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-[#f5f5f2] transition-all duration-200 group"
                aria-label="Dismiss welcome card"
            >
                <X className="w-4 h-4 text-[#aaa] group-hover:text-[#555] transition-colors" />
            </button>

            {/* Sparkle icon */}
            <div className="mb-3">
                <div className="w-10 h-10 bg-[#e8f0ea] rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#4a7c59]" />
                </div>
            </div>

            {/* Header */}
            <h3
                className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#1a1a1a] tracking-tight text-center mb-1.5"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
                Welcome to Your <span className="italic text-[#4a7c59]">Insights</span>
            </h3>
            <p className="text-[#666] text-xs md:text-sm text-center leading-relaxed max-w-sm mb-5">
                Your personalized reading is ready. Here&apos;s what you&apos;ll discover on your journey:
            </p>


            {/* Sections Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 w-full mb-5">
                {sections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className="bg-[#fafaf8] border border-[#e8e8e4] rounded-xl p-3 hover:border-[#c8d8cc] hover:bg-[#f5f8f5] transition-all duration-200"
                    >
                        <div className="flex items-start gap-2">
                            <span className="text-[#4a7c59] flex-shrink-0 mt-0.5">
                                {section.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-[#1a1a1a] text-xs md:text-sm mb-0.5">
                                    {section.title}
                                </h4>
                                <p className="text-[10px] md:text-xs text-[#666] leading-snug">
                                    {section.description}
                                </p>

                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* CTA Button */}
            <motion.button
                onClick={onDismiss}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-[#3d6b4a] hover:bg-[#2f5a3c] text-white rounded-full font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md group"
            >
                <span className="flex items-center justify-center gap-2">
                    Start Exploring
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
            </motion.button>
        </motion.div>
    );
}
