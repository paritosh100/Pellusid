"use client";

/**
 * Result Page Client Component
 * Dashboard layout with improved contrast and compact right sidebar
 */

import { useState, useEffect } from "react";
import { ShareButton } from "@/components/share-button";
import { RegenerateButton } from "@/components/regenerate-button";
import { JournalPrompt } from "@/components/journal-prompt";
import { FeedbackWidget } from "@/components/feedback-widget";
import { SectionFeedback } from "@/components/section-feedback";
import { AppNameFeedback } from "@/components/app-name-feedback";
import { WelcomeCard } from "@/components/welcome-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageSquare, X, ChevronLeft, ChevronRight } from "lucide-react";

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
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [showWelcomeCard, setShowWelcomeCard] = useState(false);

    // Check if this is the user's first visit to this reading
    useEffect(() => {
        const storageKey = `reading-welcomed-${readingId}`;
        const hasSeenWelcome = localStorage.getItem(storageKey);

        if (!hasSeenWelcome) {
            setShowWelcomeCard(true);
        }
    }, [readingId]);

    // Handle welcome card dismissal
    const handleDismissWelcome = () => {
        const storageKey = `reading-welcomed-${readingId}`;
        localStorage.setItem(storageKey, 'true');
        setShowWelcomeCard(false);
    };

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

    // Navigation helpers
    const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
    const isFirstSection = currentSectionIndex === 0;
    const isLastSection = currentSectionIndex === sections.length - 1;

    const goToPreviousSection = () => {
        if (!isFirstSection) {
            setActiveSection(sections[currentSectionIndex - 1].id);
        }
    };

    const goToNextSection = () => {
        if (!isLastSection) {
            setActiveSection(sections[currentSectionIndex + 1].id);
        }
    };

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
                        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-shrink-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-teal-300 tracking-wide">Core Theme</h2>
                            <div className="hidden sm:block">
                                <SectionFeedback section="coreTheme" readingId={readingId} />
                            </div>
                        </div>
                        <div className="flex-shrink-0 pr-1 sm:pr-2">
                            <p className="text-lg sm:text-base leading-relaxed text-gray-100 whitespace-pre-line">
                                {reading.coreTheme}
                            </p>
                        </div>
                        {/* Mobile feedback pills - 2x2 grid below content */}
                        <div className="sm:hidden mt-3 pt-3 border-t border-white/10 flex-shrink-0">
                            <SectionFeedback section="coreTheme" readingId={readingId} />
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
                        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-shrink-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-teal-300 tracking-wide">What's Working</h2>
                            <div className="hidden sm:block">
                                <SectionFeedback section="strengths" readingId={readingId} />
                            </div>
                        </div>
                        <div className="flex-shrink-0 pr-1 sm:pr-2">
                            <ul className="space-y-3 sm:space-y-2">
                                {reading.strengths.map((strength: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-2 sm:gap-3"
                                    >
                                        <span className="text-green-400 mt-0.5 text-xl sm:text-lg flex-shrink-0 leading-none">✓</span>
                                        <span className="text-gray-100 text-lg sm:text-base leading-relaxed">{strength}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                        {/* Mobile feedback pills - 2x2 grid below content */}
                        <div className="sm:hidden mt-3 pt-3 border-t border-white/10 flex-shrink-0">
                            <SectionFeedback section="strengths" readingId={readingId} />
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
                        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-shrink-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-teal-300 tracking-wide">Energy Drains</h2>
                            <div className="hidden sm:block">
                                <SectionFeedback section="frictions" readingId={readingId} />
                            </div>
                        </div>
                        <div className="flex-shrink-0 pr-1 sm:pr-2">
                            <ul className="space-y-3 sm:space-y-2">
                                {reading.frictions.map((friction: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-2 sm:gap-3"
                                    >
                                        <span className="text-amber-400 mt-0.5 text-xl sm:text-lg flex-shrink-0 leading-none">⚠</span>
                                        <span className="text-gray-100 text-lg sm:text-base leading-relaxed">{friction}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                        {/* Mobile feedback pills - 2x2 grid below content */}
                        <div className="sm:hidden mt-3 pt-3 border-t border-white/10 flex-shrink-0">
                            <SectionFeedback section="frictions" readingId={readingId} />
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
                                <h2 className="text-xl sm:text-2xl font-bold text-teal-300 tracking-wide">Next 7 Days</h2>
                                <p className="text-gray-200 text-xs sm:text-xs mt-1">Focus areas to consider</p>
                            </div>
                            <div className="hidden sm:block">
                                <SectionFeedback section="next7Days" readingId={readingId} />
                            </div>
                        </div>
                        <div className="flex-shrink-0 pr-1 sm:pr-2 mt-2">
                            <ul className="space-y-3 sm:space-y-2">
                                {reading.next7Days.map((focus: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-2 sm:gap-3"
                                    >
                                        <span className="text-teal-300 mt-0.5 font-bold text-lg sm:text-base flex-shrink-0 leading-none">
                                            {index + 1}.
                                        </span>
                                        <span className="text-gray-100 text-lg sm:text-base leading-relaxed">{focus}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                        {/* Mobile feedback pills - 2x2 grid below content */}
                        <div className="sm:hidden mt-3 pt-3 border-t border-white/10 flex-shrink-0">
                            <SectionFeedback section="next7Days" readingId={readingId} />
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
                            onOpenFeedback={() => setIsRightPanelOpen(true)}
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
                    <div className="flex items-center justify-between mb-2">
                        <a href="/" className="group inline-block">
                            <span className="text-lg font-bold tracking-tighter bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent">
                                PELLUCID
                            </span>
                            <span className="ml-1.5 text-[10px] text-gray-300 tracking-[0.2em]">INSIGHTS</span>
                        </a>
                        <button
                            onClick={() => setIsRightPanelOpen(true)}
                            className="px-3 py-1.5 bg-white/5 rounded-lg text-teal-300 hover:text-white hover:bg-white/10 transition-all border border-white/10 text-xs font-medium"
                        >
                            we need your feedback!
                        </button>
                    </div>
                    <div className="hidden gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "px-3 py-2 rounded-lg whitespace-nowrap text-sm transition-all duration-300 flex items-center gap-1.5 border",
                                    activeSection === section.id
                                        ? "bg-teal-500/30 border-teal-400/50 text-teal-100"
                                        : "text-gray-200 bg-white/5 border-transparent"
                                )}
                            >
                                <span className="text-base">{section.icon}</span>
                                <span>{section.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area - Fixed height, no scroll */}
            {/* Main Content Area - Fixed height, no scroll */}
            <main className="flex-1 flex flex-col h-screen pt-16 lg:pt-0 pb-16 lg:pb-0 overflow-hidden relative">

                <div className="flex-1 flex flex-col p-0 sm:p-4 lg:p-6 min-h-0">
                    {/* Header - Fixed */}
                    <div className="mb-2 sm:mb-4 flex-shrink-0 px-4 sm:px-0 pt-2 sm:pt-0">
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-white leading-tight">
                            {reading.headline}
                        </h1>
                    </div>


                    {/* Dynamic Content - Flexible height with darker background */}
                    <div className={cn(
                        "flex-1 sm:bg-[#0f2f2a]/40 sm:backdrop-blur-md sm:border sm:border-teal-500/20 sm:rounded-xl lg:p-6 min-h-0 mb-1 sm:mb-3",
                        activeSection === 'journal' ? "p-3 sm:p-4" : "p-3 sm:p-4"
                    )}>
                        <AnimatePresence mode="wait">
                            {!showWelcomeCard && renderContent()}
                        </AnimatePresence>
                    </div>



                    {/* Disclaimer - Fixed (hidden when welcome card is shown) */}
                    {!showWelcomeCard && (
                        <div className="text-center p-2 sm:p-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl flex-shrink-0">
                            <p className="text-[10px] text-gray-300 leading-relaxed">
                                {reading.disclaimer}
                            </p>
                        </div>
                    )}

                </div>
            </main>

            {/* Mobile Navigation Bar - Fixed at bottom */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-6 z-40">
                {/* Left Arrow */}
                <motion.button
                    onClick={goToPreviousSection}
                    disabled={isFirstSection}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isFirstSection ? 0.3 : 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-white/5 border border-white/20",
                        !isFirstSection && "hover:bg-teal-500/20 hover:border-teal-500/40 hover:shadow-[0_0_20px_-5px_rgba(13,148,136,0.4)]",
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

                {/* Section Indicator */}
                <div className="flex items-center gap-1.5">
                    {sections.map((section, index) => (
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

                {/* Right Arrow */}
                <motion.button
                    onClick={goToNextSection}
                    disabled={isLastSection}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isLastSection ? 0.3 : 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-white/5 border border-white/20",
                        !isLastSection && "hover:bg-teal-500/20 hover:border-teal-500/40 hover:shadow-[0_0_20px_-5px_rgba(13,148,136,0.4)]",
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

            {/* Mobile Right Panel - Slide-over */}
            <AnimatePresence>
                {isRightPanelOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRightPanelOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
                        />
                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-[85vw] sm:w-96 bg-[#0a1f1c] border-l border-white/10 z-[51] shadow-2xl lg:hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-teal-400" />
                                    Feedback
                                </h3>
                                <button
                                    onClick={() => setIsRightPanelOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                <AppNameFeedback />
                                <FeedbackWidget readingId={readingId} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Full-screen Welcome Card Overlay */}
            <AnimatePresence>
                {showWelcomeCard && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gradient-to-br from-teal-900/30 via-purple-900/20 to-blue-900/30 backdrop-blur-3xl z-[60]"
                        />
                        {/* Welcome Card */}
                        <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
                            <div className="w-full h-full max-w-4xl max-h-[90vh] overflow-hidden">
                                <WelcomeCard onDismiss={handleDismissWelcome} />
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
