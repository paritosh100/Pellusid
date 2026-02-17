"use client";

/**
 * Welcome Card Component
 * Displays on first visit to guide users through the results interface
 */

import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeCardProps {
    onDismiss: () => void;
}

export function WelcomeCard({ onDismiss }: WelcomeCardProps) {
    const sections = [
        {
            icon: "◈",
            title: "Core Theme",
            description: "Your primary pattern for this period",
            color: "text-teal-400"
        },
        {
            icon: "✓",
            title: "What's Working",
            description: "Strengths and positive energies",
            color: "text-green-400"
        },
        {
            icon: "⚠",
            title: "Energy Drains",
            description: "Challenges and friction points",
            color: "text-amber-400"
        },
        {
            icon: "→",
            title: "Next 7 Days",
            description: "Focus areas to consider",
            color: "text-purple-400"
        },
        {
            icon: "✎",
            title: "Journal Prompt",
            description: "Personalized reflection questions",
            color: "text-pink-400"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex flex-col bg-[#0a1f1c] border border-teal-500/30 rounded-2xl p-4 md:p-5 md:p-6 lg:p-8 shadow-[0_20px_60px_-12px_rgba(13,148,136,0.3)]"
        >
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-teal-400/40 rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-teal-400/40 rounded-br-2xl pointer-events-none" />

            {/* Animated background glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10 blur-2xl animate-pulse-slow pointer-events-none" />


            {/* Close button */}
            <button
                onClick={onDismiss}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group"
                aria-label="Dismiss welcome card"
            >
                <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {/* Header */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-teal-500/20 rounded-lg border border-teal-500/30">
                        <Sparkles className="w-4 h-4 text-teal-400" />
                    </div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                        Welcome to Your Insights
                    </h3>
                </div>
                <p className="text-gray-300 text-xs md:text-sm lg:text-base leading-relaxed ml-11">
                    Your personalized reading is ready. Here's what you'll discover on your journey:
                </p>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                {sections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 hover:border-teal-500/30 hover:bg-black/40 transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex items-start gap-2">
                            <span className={cn("text-lg flex-shrink-0", section.color)}>
                                {section.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white text-xs md:text-sm lg:text-base mb-0.5 group-hover:text-teal-300 transition-colors">
                                    {section.title}
                                </h4>
                                <p className="text-[10px] md:text-xs lg:text-sm text-gray-400 leading-snug">
                                    {section.description}
                                </p>
                            </div>
                        </div>
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-teal-500/0 to-purple-500/0 group-hover:from-teal-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                    </motion.div>
                ))}
            </div>



            {/* CTA Button */}
            <motion.button
                onClick={onDismiss}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-teal-500/20 to-purple-500/20 hover:from-teal-500/30 hover:to-purple-500/30 border border-teal-500/40 hover:border-teal-400/60 rounded-xl font-semibold text-white text-sm md:text-base lg:text-lg tracking-wide uppercase transition-all duration-300 shadow-[0_0_20px_-5px_rgba(13,148,136,0.3)] hover:shadow-[0_0_30px_-5px_rgba(13,148,136,0.5)] group"
            >
                <span className="flex items-center justify-center gap-2">
                    Start Exploring
                    <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </span>
            </motion.button>


            {/* Decorative floating elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl animate-drift pointer-events-none" />


            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                @keyframes drift {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(15px, -15px); }
                }
                .animate-float { animation: float 8s ease-in-out infinite; }
                .animate-drift { animation: drift 10s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </motion.div>
    );
}
