"use client";

/**
 * Result Page Client Component
 * Dashboard layout with improved contrast and compact right sidebar
 */

import { useState } from "react";
import { ShareButton } from "@/components/share-button";
import { RegenerateButton } from "@/components/regenerate-button";
import { JournalPrompt } from "@/components/journal-prompt";
import { FeedbackWidget } from "@/components/feedback-widget";
import { SectionFeedback } from "@/components/section-feedback";
import { AppNameFeedback } from "@/components/app-name-feedback";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResultClientProps {
    reading: any;
    inputs: any;
    readingId: string;
}

type Section = 'coreTheme' | 'strengths' | 'frictions' | 'next7Days' | 'journal';

export function ResultClient({ reading, inputs, readingId }: ResultClientProps) {
    const [activeSection, setActiveSection] = useState<Section>('coreTheme');
    const [journalAnswer, setJournalAnswer] = useState<string | null>(null);
    const [journalQuestion, setJournalQuestion] = useState<string | null>(null);

    const handleAnswerGenerated = (question: string, answer: string) => {
        setJournalQuestion(question);
        setJournalAnswer(answer);
    };

    const sections = [
        { id: 'coreTheme' as Section, label: 'Core Theme', icon: '◈' },
        { id: 'strengths' as Section, label: "What's Working", icon: '✓' },
        { id: 'frictions' as Section, label: 'Energy Drains', icon: '⚠' },
        { id: 'next7Days' as Section, label: 'Next 7 Days', icon: '→' },
        { id: 'journal' as Section, label: 'Journal Prompt', icon: '✎' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'coreTheme':
                return (
                    <motion.div
                        key="coreTheme"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-teal-300 tracking-wide">Core Theme</h2>
                            <SectionFeedback section="coreTheme" readingId={readingId} />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2">
                            <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-line">
                                {reading.coreTheme}
                            </p>
                        </div>
                    </motion.div>
                );

            case 'strengths':
                return (
                    <motion.div
                        key="strengths"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-teal-300 tracking-wide">What's Working</h2>
                            <SectionFeedback section="strengths" readingId={readingId} />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2">
                            <ul className="space-y-2">
                                {reading.strengths.map((strength: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="text-green-400 mt-0 text-lg flex-shrink-0 leading-none">✓</span>
                                        <span className="text-gray-100 text-sm leading-relaxed">{strength}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                );

            case 'frictions':
                return (
                    <motion.div
                        key="frictions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-teal-300 tracking-wide">Energy Drains</h2>
                            <SectionFeedback section="frictions" readingId={readingId} />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2">
                            <ul className="space-y-2">
                                {reading.frictions.map((friction: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="text-amber-400 mt-0 text-lg flex-shrink-0 leading-none">⚠</span>
                                        <span className="text-gray-100 text-sm leading-relaxed">{friction}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                );

            case 'next7Days':
                return (
                    <motion.div
                        key="next7Days"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-2 flex-shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-teal-300 tracking-wide">Next 7 Days</h2>
                                <p className="text-gray-200 text-xs mt-1">Focus areas to consider</p>
                            </div>
                            <SectionFeedback section="next7Days" readingId={readingId} />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 mt-2">
                            <ul className="space-y-2">
                                {reading.next7Days.map((focus: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="text-teal-300 mt-0 font-bold text-base flex-shrink-0 leading-none">
                                            {index + 1}.
                                        </span>
                                        <span className="text-gray-100 text-sm leading-relaxed">{focus}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                );

            case 'journal':
                return (
                    <motion.div
                        key="journal"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full overflow-y-auto pr-2"
                    >
                        <JournalPrompt
                            journalPrompt={reading.journalPrompt}
                            userInputs={inputs}
                            readingId={readingId}
                            savedAnswer={journalAnswer}
                            savedQuestion={journalQuestion}
                            onAnswerGenerated={handleAnswerGenerated}
                        />
                    </motion.div>
                );
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left Sidebar - Navigation */}
            <aside className="hidden lg:flex lg:flex-col w-56 bg-black/70 backdrop-blur-2xl border-r border-white/10 flex-shrink-0">
                <div className="p-4 border-b border-white/10 flex-shrink-0">
                    <a href="/" className="group inline-block">
                        <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent group-hover:to-teal-100 transition-all">
                            PELLUCID
                        </span>
                        <span className="ml-1.5 text-[10px] text-gray-300 tracking-[0.2em]">INSIGHTS</span>
                    </a>
                </div>

                <nav className="flex-1 p-3 space-y-1.5 min-h-0">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2.5",
                                activeSection === section.id
                                    ? "bg-teal-500/30 border border-teal-400/50 text-teal-100 shadow-[0_0_15px_-5px_rgba(13,148,136,0.4)]"
                                    : "text-gray-200 hover:text-white hover:bg-white/10 border border-transparent"
                            )}
                        >
                            <span className="text-base">{section.icon}</span>
                            <span className="font-medium text-xs">{section.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-white/10 flex-shrink-0">
                    <a
                        href="/"
                        className="block text-center text-xs text-gray-200 hover:text-white transition-colors py-1.5"
                    >
                        ← New Reading
                    </a>
                </div>
            </aside>

            {/* Mobile Navigation - Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-2xl border-b border-white/10">
                <div className="p-3">
                    <a href="/" className="group inline-block mb-2">
                        <span className="text-lg font-bold tracking-tighter bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent">
                            PELLUCID
                        </span>
                        <span className="ml-1.5 text-[10px] text-gray-300 tracking-[0.2em]">INSIGHTS</span>
                    </a>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg whitespace-nowrap text-xs transition-all duration-300 flex items-center gap-1.5 border",
                                    activeSection === section.id
                                        ? "bg-teal-500/30 border-teal-400/50 text-teal-100"
                                        : "text-gray-200 bg-white/5 border-transparent"
                                )}
                            >
                                <span className="text-sm">{section.icon}</span>
                                <span>{section.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area - Fixed height, no scroll */}
            <main className="flex-1 flex flex-col h-screen pt-24 lg:pt-0 overflow-hidden">
                <div className="flex-1 flex flex-col p-4 lg:p-6 min-h-0">
                    {/* Header - Fixed */}
                    <div className="mb-4 flex-shrink-0">
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-white leading-tight">
                            {reading.headline}
                        </h1>
                    </div>

                    {/* Dynamic Content - Flexible height with darker background */}
                    <div className="flex-1 bg-[#0f2f2a]/40 backdrop-blur-md border border-teal-500/20 rounded-xl p-4 lg:p-6 min-h-0 mb-3">
                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>
                    </div>

                    {/* Disclaimer - Fixed */}
                    <div className="text-center p-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl flex-shrink-0">
                        <p className="text-[10px] text-gray-300 leading-relaxed">
                            {reading.disclaimer}
                        </p>
                    </div>
                </div>
            </main>

            {/* Right Sidebar - Compact, no scroll */}
            <aside className="hidden xl:flex xl:flex-col w-72 bg-black/70 backdrop-blur-2xl border-l border-white/10 flex-shrink-0 h-screen">
                <div className="p-3 flex flex-col h-full min-h-0">
                    <h3 className="text-sm font-bold text-white mb-3 flex-shrink-0">Help Us Improve</h3>

                    <div className="flex-1 flex flex-col gap-3 min-h-0">
                        <div className="flex-shrink-0">
                            <AppNameFeedback />
                        </div>

                        <div className="flex-shrink-0">
                            <FeedbackWidget readingId={readingId} />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Feedback - Bottom */}
            <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-2xl border-t border-white/10 p-3 space-y-3">
                <AppNameFeedback />
                <FeedbackWidget readingId={readingId} />
            </div>
        </div>
    );
}
