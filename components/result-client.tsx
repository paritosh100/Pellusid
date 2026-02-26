"use client";

/**
 * Result Page Client Component
 * Dashboard layout with improved contrast and compact right sidebar
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShareButton } from "@/components/share-button";

import { RegenerateButton } from "@/components/regenerate-button";
import { JournalPrompt } from "@/components/journal-prompt";
import { FeedbackWidget } from "@/components/feedback-widget";
import { SectionFeedback } from "@/components/section-feedback";
import { WelcomeCard } from "@/components/welcome-card";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageSquare, X, ChevronLeft, ChevronRight, LayoutGrid, CheckCircle2, AlertTriangle, ArrowRight, PenLine } from "lucide-react";


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
        { id: 'coreTheme' as Section, label: 'Core Theme', icon: <LayoutGrid className="w-4 h-4" /> },
        { id: 'strengths' as Section, label: "What's Working", icon: <CheckCircle2 className="w-4 h-4" /> },
        { id: 'frictions' as Section, label: 'Energy Drains', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'next7Days' as Section, label: 'Next 7 Days', icon: <ArrowRight className="w-4 h-4" /> },
        { id: 'journal' as Section, label: 'Journal Prompt', icon: <PenLine className="w-4 h-4" /> },
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
        const NavigationButtons = () => (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-stitch-light-green/30">
                <div className="flex gap-1.5 items-center">
                    {sections.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 rounded-full transition-all duration-300",
                                i === currentSectionIndex ? "w-4 bg-stitch-accent" : "w-1 bg-stitch-light-green"
                            )}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={goToPreviousSection}
                        disabled={isFirstSection}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-[10px] tracking-widest uppercase",
                            isFirstSection
                                ? "opacity-0 pointer-events-none"
                                : "text-[#888] hover:text-stitch-accent hover:bg-stitch-light-green/50"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <button
                        onClick={goToNextSection}
                        disabled={isLastSection}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-[10px] tracking-widest uppercase shadow-sm",
                            isLastSection
                                ? "opacity-0 pointer-events-none"
                                : "bg-stitch-accent text-white hover:bg-stitch-green hover:shadow-lg hover:shadow-stitch-accent/20 active:scale-95"
                        )}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );

        switch (activeSection) {
            case 'coreTheme':
                return (
                    <motion.div
                        key="coreTheme"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h2 className="text-3xl font-bold text-stitch-green font-playfair">Core Theme</h2>
                            <div className="hidden sm:block">
                                <SectionFeedback section="coreTheme" readingId={readingId} />
                            </div>
                        </div>

                        <div className="flex-1">
                            <p className="text-lg leading-relaxed text-stitch-dark-green font-inter whitespace-pre-line">
                                {reading.coreTheme}
                            </p>
                        </div>

                        <NavigationButtons />

                        {/* Mobile feedback pills - 2x2 grid below content */}
                        <div className="sm:hidden mt-6 pt-4 border-t border-stitch-light-green flex-shrink-0">
                            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">How does this resonate?</p>
                            <SectionFeedback section="coreTheme" readingId={readingId} />
                        </div>
                    </motion.div>

                );

            case 'strengths':
                return (
                    <motion.div
                        key="strengths"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h2 className="text-3xl font-bold text-stitch-green font-playfair">What's Working</h2>
                            <div className="hidden sm:block">
                                <SectionFeedback section="strengths" readingId={readingId} />
                            </div>
                        </div>

                        <div className="flex-1">
                            <ul className="space-y-4">
                                {reading.strengths.map((strength: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-stitch-light-green flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-stitch-accent text-sm font-bold">✓</span>
                                        </div>
                                        <span className="text-lg text-stitch-dark-green font-inter leading-relaxed">{strength}</span>

                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <NavigationButtons />

                        {/* Mobile feedback pills */}
                        <div className="sm:hidden mt-6 pt-4 border-t border-stitch-light-green flex-shrink-0">
                            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">How does this resonate?</p>
                            <SectionFeedback section="strengths" readingId={readingId} />
                        </div>
                    </motion.div>

                );

            case 'frictions':
                return (
                    <motion.div
                        key="frictions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h2 className="text-3xl font-bold text-stitch-green font-playfair">Energy Drains</h2>
                            <div className="hidden sm:block">
                                <SectionFeedback section="frictions" readingId={readingId} />
                            </div>
                        </div>

                        <div className="flex-1">
                            <ul className="space-y-4">
                                {reading.frictions.map((friction: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-100">
                                            <span className="text-amber-600 text-xs font-bold">⚠</span>
                                        </div>
                                        <span className="text-lg text-stitch-dark-green font-inter leading-relaxed">{friction}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <NavigationButtons />

                        {/* Mobile feedback pills */}
                        <div className="sm:hidden mt-6 pt-4 border-t border-stitch-light-green flex-shrink-0">
                            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">How does this resonate?</p>
                            <SectionFeedback section="frictions" readingId={readingId} />
                        </div>
                    </motion.div>

                );

            case 'next7Days':
                return (
                    <motion.div
                        key="next7Days"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h2 className="text-3xl font-bold text-stitch-green font-playfair">Next 7 Days</h2>
                            <div className="hidden sm:block">
                                <SectionFeedback section="next7Days" readingId={readingId} />
                            </div>
                        </div>

                        <div className="flex-1">
                            <ul className="space-y-4">
                                {reading.next7Days.map((focus: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-stitch-light-green flex items-center justify-center flex-shrink-0 mt-0.5 text-stitch-accent font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <span className="text-lg text-stitch-dark-green font-inter leading-relaxed">{focus}</span>

                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <NavigationButtons />

                        {/* Mobile feedback pills */}
                        <div className="sm:hidden mt-6 pt-4 border-t border-stitch-light-green flex-shrink-0">
                            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">How does this resonate?</p>
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
                        className="pr-2 flex flex-col h-full"
                    >
                        <div className="flex-1">
                            <JournalPrompt
                                journalPrompt={reading.journalPrompt}
                                userInputs={inputs}
                                readingId={readingId}
                                savedAnswer={journalAnswer}
                                savedQuestion={journalQuestion}
                                onAnswerGenerated={handleAnswerGenerated}
                                onOpenFeedback={() => setIsRightPanelOpen(true)}
                            />
                        </div>
                        <NavigationButtons />
                    </motion.div>
                );
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#fafaf8] font-inter">
            {/* Left Sidebar - Navigation */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-[#fcfcfb] border-r border-[#e4e4e0] flex-shrink-0">
                <div className="p-8 flex-shrink-0">
                    <a href="/" className="flex items-center gap-2">
                        <Image
                            src="/Abstract_intuitive.png"
                            alt="InsightBridge Logo"
                            width={32}
                            height={32}
                            className="rounded-lg object-contain"
                        />
                        <span className="text-sm font-bold tracking-widest text-stitch-dark-green font-inter uppercase text-nowrap">InsightBridge</span>
                    </a>


                </div>



                <nav className="flex-1 px-4 space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group",
                                activeSection === section.id
                                    ? "bg-stitch-accent text-white shadow-lg shadow-stitch-accent/20"
                                    : "text-[#666] hover:text-stitch-accent hover:bg-stitch-light-green"
                            )}
                        >
                            <span className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                activeSection === section.id ? "bg-white/20 text-white" : "bg-white border border-[#eee] text-[#888] group-hover:text-stitch-accent group-hover:border-stitch-accent/20"
                            )}>
                                {section.icon}
                            </span>
                            <span className="font-bold text-[10px] tracking-[0.15em] uppercase font-inter">{section.label}</span>
                        </button>


                    ))}
                </nav>

                <div className="p-6 mt-auto">
                    <a
                        href="/"
                        className="flex items-center gap-2 text-xs font-bold text-[#888] hover:text-stitch-accent transition-colors uppercase tracking-widest font-inter"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        New Reading
                    </a>

                </div>

            </aside>

            {/* Mobile Navigation - Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="p-3">
                    <div className="flex items-center justify-between">
                        <a href="/" className="flex items-center gap-2">
                            <Image
                                src="/Abstract_intuitive.png"
                                alt="InsightBridge Logo"
                                width={24}
                                height={24}
                                className="rounded-md object-contain"
                            />
                            <span className="text-[10px] font-bold tracking-widest text-stitch-dark-green uppercase">InsightBridge</span>
                        </a>


                        <button
                            onClick={() => setIsRightPanelOpen(true)}
                            className="px-3 py-1.5 bg-stitch-light-green rounded-lg text-stitch-green hover:bg-stitch-green hover:text-white transition-all border border-stitch-green/20 text-[10px] font-bold uppercase tracking-wider"
                        >
                            Help us improve
                        </button>
                    </div>

                    <div className="hidden gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "px-3 py-2 rounded-lg whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 border",
                                    activeSection === section.id
                                        ? "bg-stitch-green text-white border-stitch-green shadow-sm"
                                        : "text-stitch-green/60 bg-stitch-light-green border-stitch-green/10"
                                )}
                            >
                                <span className="p-0.5 rounded bg-white/20">{section.icon}</span>
                                <span>{section.label}</span>
                            </button>

                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area - Fixed height, no scroll */}
            {/* Main Content Area - Scrollable */}
            <main className="flex-1 flex flex-col pt-16 lg:pt-0 pb-16 lg:pb-0 overflow-y-auto relative">
                <div className="flex flex-col p-6 lg:py-10 lg:px-12 max-w-5xl mx-auto w-full">

                    {/* Header */}
                    <header className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stitch-light-green border border-[#d0ddd3] mb-4">

                            <span className="w-1 h-1 rounded-full bg-stitch-accent" />
                            <span className="text-[10px] font-bold tracking-[0.15em] text-stitch-accent uppercase">WEEKLY INSIGHTS</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold text-stitch-dark-green font-playfair leading-[1.1] tracking-tight">
                            {reading.headline.split(' ').map((word: string, i: number) => {
                                // Matching app/page.tsx two-tone style
                                const isGreen = i >= reading.headline.split(' ').length - 2;
                                return (
                                    <span key={i} className={cn(isGreen ? "text-stitch-green italic font-medium" : "text-stitch-dark-green")}>
                                        {word}{' '}
                                    </span>
                                );
                            })}
                        </h1>
                    </header>



                    {/* Dynamic Content Card */}
                    <div className={cn(
                        "bg-white rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-[#e4e4e0] p-4 sm:p-6 lg:p-10 mb-8 relative overflow-hidden",
                        activeSection === 'journal' ? "min-h-[400px]" : "min-h-[200px]"
                    )}>



                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-stitch-light-green/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                        <AnimatePresence mode="wait">
                            {!showWelcomeCard && renderContent()}
                        </AnimatePresence>
                    </div>

                    {/* Disclaimer at bottom of content */}
                    {!showWelcomeCard && (
                        <div className="flex items-center justify-between px-2 text-gray-500">
                            <p className="text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                                INSIGHTBRIDGE © 2024
                            </p>

                            {/* <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-stitch-green/40" />
                                <span className="w-1.5 h-1.5 rounded-full bg-stitch-green/20" />
                                <span className="w-1.5 h-1.5 rounded-full bg-stitch-green/10" />
                            </div> */}
                        </div>
                    )}
                </div>
            </main>



            {/* Right Sidebar - Compact, no scroll */}
            <aside className="hidden xl:flex xl:flex-col w-80 bg-white border-l border-gray-100 flex-shrink-0 h-screen">
                <div className="p-6 flex flex-col h-full overflow-y-auto scrollbar-hide">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-stitch-accent/90 uppercase mb-6 font-inter">Help Us Improve</h3>



                    <div className="space-y-6">
                        <FeedbackWidget readingId={readingId} />
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
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"

                        />
                        {/* Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-[85vw] sm:w-96 bg-white border-l border-gray-100 z-[51] shadow-2xl lg:hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="font-bold text-[#1a1a1a] flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-stitch-accent" />
                                    Feedback
                                </h3>
                                <button
                                    onClick={() => setIsRightPanelOpen(false)}
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#1a1a1a]"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
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
                            className="fixed inset-0 bg-[#00000]/90 backdrop-blur-xl z-[60]"
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
