"use client";

/**
 * Stealth Result Page Client Component
 * Pattern-based reflection display — no astrological language
 * 4 sections: Past Patterns, Current Phase, Growth Direction, Your Report
 */

import { useState } from "react";
import Image from "next/image";
import { ShareButton } from "@/components/share-button";

import { JournalPrompt } from "@/components/journal-prompt";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StealthReadingResponse, UserInput } from "@/lib/types";

interface StealthResultClientProps {
    reading: StealthReadingResponse;
    inputs: UserInput;
    readingId: string;
}

type StealthSection = 'whereYouveBeen' | 'whereYouAre' | 'direction' | 'summary' | 'deepQuestion';

export function StealthResultClient({ reading, inputs, readingId }: StealthResultClientProps) {
    const [activeSection, setActiveSection] = useState<StealthSection>('whereYouveBeen');
    const [journalAnswer, setJournalAnswer] = useState<string | null>(null);
    const [journalQuestion, setJournalQuestion] = useState<string | null>(null);

    const handleAnswerGenerated = (question: string, answer: string) => {
        setJournalQuestion(question);
        setJournalAnswer(answer);
    };

    const sections = [
        { id: 'whereYouveBeen' as StealthSection, label: 'Past Patterns', icon: '↺' },
        { id: 'whereYouAre' as StealthSection, label: 'Current Phase', icon: '◉' },
        { id: 'direction' as StealthSection, label: 'Growth Direction', icon: '↗' },
        { id: 'summary' as StealthSection, label: 'Your Report', icon: '◈' },
        { id: 'deepQuestion' as StealthSection, label: 'Ask a Question', icon: '✏' },
    ];

    const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
    const isFirstSection = currentSectionIndex === 0;
    const isLastSection = currentSectionIndex === sections.length - 1;

    const goToPreviousSection = () => {
        if (!isFirstSection) setActiveSection(sections[currentSectionIndex - 1].id);
    };

    const goToNextSection = () => {
        if (!isLastSection) setActiveSection(sections[currentSectionIndex + 1].id);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'whereYouveBeen':
                return (
                    <motion.div
                        key="whereYouveBeen"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col"
                    >
                        <div className="mb-2 sm:mb-3 flex-shrink-0">
                            <h2 className="text-2xl sm:text-3xl font-bold text-teal-300 tracking-wide">Past Patterns</h2>
                            <p className="text-gray-400 text-sm mt-1">Recurring themes from earlier phases</p>
                        </div>
                        <div className="pr-1 sm:pr-2">
                            <p className="text-xl sm:text-lg leading-relaxed text-gray-100 whitespace-pre-line">
                                {reading.whereYouveBeen}
                            </p>
                        </div>
                    </motion.div>
                );

            case 'whereYouAre':
                return (
                    <motion.div
                        key="whereYouAre"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col"
                    >
                        <div className="mb-2 sm:mb-3 flex-shrink-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-teal-300 tracking-wide">Current Phase</h2>
                            <p className="text-gray-400 text-sm mt-1">Where you are right now</p>
                        </div>
                        <div className="pr-1 sm:pr-2">
                            <p className="text-xl sm:text-lg leading-relaxed text-gray-100 whitespace-pre-line">
                                {reading.whereYouAre}
                            </p>
                        </div>
                    </motion.div>
                );

            case 'direction':
                return (
                    <motion.div
                        key="direction"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col"
                    >
                        <div className="mb-2 sm:mb-3 flex-shrink-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-teal-300 tracking-wide">Growth Direction</h2>
                            <p className="text-gray-400 text-sm mt-1">Where things are naturally moving</p>
                        </div>
                        <div className="pr-1 sm:pr-2">
                            <p className="text-xl sm:text-lg leading-relaxed text-gray-100 whitespace-pre-line">
                                {reading.direction}
                            </p>
                        </div>
                    </motion.div>
                );

            case 'summary':
                return (
                    <motion.div
                        key="summary"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col space-y-4"
                    >
                        <div className="mb-1 flex-shrink-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-teal-300 tracking-wide">Your Report</h2>
                        </div>

                        {/* Dominant Pattern */}
                        <div className="pr-1 sm:pr-2">
                            <h3 className="text-base font-semibold text-teal-200/80 uppercase tracking-wider mb-2">Dominant Pattern</h3>
                            <p className="text-xl sm:text-lg leading-relaxed text-gray-100">
                                {reading.summary.dominantPattern}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10" />

                        {/* Career & Work Style */}
                        <div className="pr-1 sm:pr-2">
                            <h3 className="text-base font-semibold text-teal-200/80 uppercase tracking-wider mb-2">Career & Work Style</h3>
                            <p className="text-xl sm:text-lg leading-relaxed text-gray-100">
                                {reading.summary.careerWorkStyle}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10" />

                        {/* Decision & Alignment */}
                        <div className="pr-1 sm:pr-2">
                            <h3 className="text-base font-semibold text-teal-200/80 uppercase tracking-wider mb-2">Decision & Alignment</h3>
                            <p className="text-xl sm:text-lg leading-relaxed text-gray-100">
                                {reading.summary.decisionAlignment}
                            </p>
                        </div>
                    </motion.div>
                );

            case 'deepQuestion':
                return (
                    <motion.div
                        key="deepQuestion"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="pr-2"
                    >
                        <JournalPrompt
                            journalPrompt={reading.closingNudge}
                            userInputs={inputs}
                            readingId={readingId}
                            savedAnswer={journalAnswer}
                            savedQuestion={journalQuestion}
                            onAnswerGenerated={handleAnswerGenerated}
                            onOpenFeedback={() => { }}
                            mode="stealth"
                        />
                    </motion.div>
                );
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left Sidebar - Navigation */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-black/70 backdrop-blur-2xl border-r border-white/10 flex-shrink-0">
                <div className="p-5 border-b border-white/10 flex-shrink-0">
                    <a href="/" className="group inline-flex items-center gap-2">
                        <Image
                            src="/Abstract_intuitive.png"
                            alt="InsightBridge Logo"
                            width={32}
                            height={32}
                            className="rounded-lg object-contain brightness-110 saturate-150"
                        />
                        <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent group-hover:to-teal-100 transition-all uppercase">
                            InsightBridge
                        </span>
                        <span className="ml-1.5 text-xs text-gray-300 tracking-[0.2em]">REFLECT</span>
                    </a>

                </div>

                <nav className="flex-1 p-4 space-y-2 min-h-0">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-3",
                                activeSection === section.id
                                    ? "bg-teal-500/30 border border-teal-400/50 text-teal-100 shadow-[0_0_15px_-5px_rgba(13,148,136,0.4)]"
                                    : "text-gray-200 hover:text-white hover:bg-white/10 border border-transparent"
                            )}
                        >
                            <span className="text-lg">{section.icon}</span>
                            <span className="font-medium text-sm">{section.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 flex-shrink-0">
                    <a
                        href="/"
                        className="block text-center text-sm text-gray-200 hover:text-white transition-colors py-2"
                    >
                        ← New Reflection
                    </a>
                </div>
            </aside>

            {/* Mobile Navigation - Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-2xl border-b border-white/10">
                <div className="p-3">
                    <div className="flex items-center justify-between">
                        <a href="/" className="group inline-flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5 text-white/60 group-hover:text-teal-300 transition-colors" />
                            <Image
                                src="/Abstract_intuitive.png"
                                alt="InsightBridge Logo"
                                width={24}
                                height={24}
                                className="rounded-md object-contain brightness-110"
                            />
                            <span className="text-lg font-bold tracking-tighter bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent uppercase">
                                InsightBridge
                            </span>
                            <span className="ml-0.5 text-[10px] text-gray-300 tracking-[0.2em]">REFLECT</span>
                        </a>

                        <ShareButton />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col pt-16 lg:pt-0 pb-16 lg:pb-0 overflow-y-auto relative">
                <div className="flex flex-col p-0 sm:p-4 lg:p-6">
                    {/* Header */}
                    <div className="mb-3 sm:mb-5 flex-shrink-0 px-4 sm:px-0 pt-2 sm:pt-0">
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-white leading-tight">
                            Pattern Reflection for {inputs.name}
                        </h1>
                        <p className="text-gray-400 text-base mt-2">Based on structured pattern recognition</p>
                    </div>

                    {/* Dynamic Content */}
                    <div className="sm:bg-[#0f2f2a]/40 sm:backdrop-blur-md sm:border sm:border-teal-500/20 sm:rounded-xl p-6 sm:p-8 lg:p-12 mb-4 sm:mb-6">

                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>
                    </div>

                    {/* Closing Nudge */}
                    <div className="text-center p-3 sm:p-4 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl flex-shrink-0">
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {reading.closingNudge}
                        </p>
                    </div>
                </div>
            </main>

            {/* Mobile Navigation Bar - Fixed at bottom */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-6 z-40">
                <motion.button
                    onClick={goToPreviousSection}
                    disabled={isFirstSection}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isFirstSection ? 0.3 : 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-white/5 border border-white/20",
                        !isFirstSection && "hover:bg-teal-500/20 hover:border-teal-500/40",
                        "active:scale-95",
                        isFirstSection && "cursor-not-allowed"
                    )}
                    aria-label="Previous section"
                >
                    <ChevronLeft className={cn(
                        "w-6 h-6 transition-colors",
                        isFirstSection ? "text-gray-600" : "text-teal-300"
                    )} />
                </motion.button>

                <div className="flex items-center gap-1.5">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                activeSection === section.id
                                    ? "w-8 bg-teal-400"
                                    : "w-1.5 bg-white/20"
                            )}
                        />
                    ))}
                </div>

                <motion.button
                    onClick={goToNextSection}
                    disabled={isLastSection}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isLastSection ? 0.3 : 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-white/5 border border-white/20",
                        !isLastSection && "hover:bg-teal-500/20 hover:border-teal-500/40",
                        "active:scale-95",
                        isLastSection && "cursor-not-allowed"
                    )}
                    aria-label="Next section"
                >
                    <ChevronRight className={cn(
                        "w-6 h-6 transition-colors",
                        isLastSection ? "text-gray-600" : "text-teal-300"
                    )} />
                </motion.button>
            </div>
        </div>
    );
}
