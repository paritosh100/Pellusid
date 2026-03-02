"use client";

/**
 * Behavioral Patterns Questionnaire Page
 * Multi-step form that collects consistency, decision style, goal clarity,
 * current state, and a free-text "stuck" narrative.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { BridgeQuestionnaireData } from "@/lib/bridge-types";

// Option type for radio groups
interface Option {
    value: string;
    label: string;
    description: string;
}

const consistencyOptions: Option[] = [
    { value: "very_consistent", label: "Very Consistent", description: "I follow routines with discipline" },
    { value: "somewhat_consistent", label: "Somewhat Consistent", description: "I try, but lapses happen" },
    { value: "inconsistent", label: "Inconsistent", description: "I struggle to maintain routines" },
    { value: "chaotic", label: "Chaotic", description: "I operate reactively, no routines" },
];

const decisionOptions: Option[] = [
    { value: "analytical", label: "Analytical", description: "I weigh data and logic carefully" },
    { value: "intuitive", label: "Intuitive", description: "I trust my gut feeling" },
    { value: "collaborative", label: "Collaborative", description: "I seek input from others first" },
    { value: "avoidant", label: "Avoidant", description: "I tend to delay making decisions" },
];

const goalOptions: Option[] = [
    { value: "crystal_clear", label: "Crystal Clear", description: "I know exactly where I'm headed" },
    { value: "mostly_clear", label: "Mostly Clear", description: "General direction, some uncertainty" },
    { value: "foggy", label: "Foggy", description: "My goals feel undefined right now" },
    { value: "no_goals", label: "No Goals", description: "I don't have articulated goals" },
];

const stateOptions: Option[] = [
    { value: "stuck", label: "Stuck", description: "Unable to move forward" },
    { value: "overwhelmed", label: "Overwhelmed", description: "Too many demands and expectations" },
    { value: "restless", label: "Restless", description: "Craving change but unsure what" },
    { value: "numb", label: "Numb", description: "Emotionally disconnected" },
    { value: "conflicted", label: "Conflicted", description: "Pulled in competing directions" },
];

const STEPS = [
    { key: "consistency", title: "Consistency", subtitle: "How do you show up day to day?" },
    { key: "decisionStyle", title: "Decision Style", subtitle: "How do you navigate crossroads?" },
    { key: "goalClarity", title: "Goal Clarity", subtitle: "How clear is the destination?" },
    { key: "currentState", title: "Current State", subtitle: "What does right now feel like?" },
    { key: "stuckDescription", title: "Where You're Stuck", subtitle: "Tell us in your own words" },
] as const;

export default function BehavioralPatternsPage() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auth guard — redirect unauthenticated users to login
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                router.replace("/login?redirect=/behavioral-patterns");
            } else {
                setAuthChecked(true);
            }
        });
    }, [router]);

    // Form data
    const [consistency, setConsistency] = useState("");
    const [decisionStyle, setDecisionStyle] = useState("");
    const [goalClarity, setGoalClarity] = useState("");
    const [currentState, setCurrentState] = useState("");
    const [stuckDescription, setStuckDescription] = useState("");

    const currentStep = STEPS[step];
    const totalSteps = STEPS.length;
    const progress = ((step + 1) / totalSteps) * 100;

    function canProceed(): boolean {
        switch (step) {
            case 0: return !!consistency;
            case 1: return !!decisionStyle;
            case 2: return !!goalClarity;
            case 3: return !!currentState;
            case 4: return stuckDescription.trim().length >= 10;
            default: return false;
        }
    }

    function goNext() {
        if (step < totalSteps - 1) setStep(step + 1);
    }

    function goBack() {
        if (step > 0) setStep(step - 1);
    }

    async function handleSubmit() {
        if (!canProceed()) return;
        setIsLoading(true);
        setError(null);

        const questionnaireData: BridgeQuestionnaireData = {
            consistency: consistency as BridgeQuestionnaireData["consistency"],
            decisionStyle: decisionStyle as BridgeQuestionnaireData["decisionStyle"],
            goalClarity: goalClarity as BridgeQuestionnaireData["goalClarity"],
            currentState: currentState as BridgeQuestionnaireData["currentState"],
            stuckDescription: stuckDescription.trim(),
        };

        try {
            const res = await fetch("/api/bridge/generate-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(questionnaireData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || "Failed to generate report");
            }

            // Encode data for the result page
            const payload = btoa(
                JSON.stringify({ questionnaire: questionnaireData, report: data.report })
            );

            router.push(`/behavioral-patterns/result?d=${encodeURIComponent(payload)}`);
        } catch (err) {
            console.error("Bridge submission error:", err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            setIsLoading(false);
        }
    }

    function renderOptionGroup(options: Option[], selected: string, onSelect: (v: string) => void) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onSelect(opt.value)}
                        className={cn(
                            "relative text-left p-4 rounded-xl border-2 transition-all duration-200 group",
                            selected === opt.value
                                ? "border-[#4a7c59] bg-[#e8f0ea]/60 shadow-sm"
                                : "border-[#e4e4e0] bg-white hover:border-[#c0cdc3] hover:shadow-sm"
                        )}
                    >
                        {/* Selection indicator */}
                        <div className={cn(
                            "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                            selected === opt.value
                                ? "border-[#4a7c59] bg-[#4a7c59]"
                                : "border-[#d0d0cc] bg-white"
                        )}>
                            {selected === opt.value && (
                                <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </motion.svg>
                            )}
                        </div>

                        <p className={cn(
                            "font-semibold text-sm mb-0.5 transition-colors duration-200",
                            selected === opt.value ? "text-[#2f5a3c]" : "text-[#333]"
                        )}>
                            {opt.label}
                        </p>
                        <p className="text-xs text-[#888] leading-relaxed pr-6">{opt.description}</p>
                    </button>
                ))}
            </div>
        );
    }

    function renderStepContent() {
        switch (step) {
            case 0:
                return renderOptionGroup(consistencyOptions, consistency, setConsistency);
            case 1:
                return renderOptionGroup(decisionOptions, decisionStyle, setDecisionStyle);
            case 2:
                return renderOptionGroup(goalOptions, goalClarity, setGoalClarity);
            case 3:
                return renderOptionGroup(stateOptions, currentState, setCurrentState);
            case 4:
                return (
                    <div>
                        <textarea
                            value={stuckDescription}
                            onChange={(e) => setStuckDescription(e.target.value)}
                            placeholder="Describe where you feel most stuck right now. What keeps circling back? What decision feels the heaviest?"
                            maxLength={500}
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl border border-[#ddd] bg-[#fafaf8] text-[#1a1a1a] text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 transition-all duration-200 resize-none"
                        />
                        <p className="text-xs text-[#aaa] mt-2 text-right">
                            {stuckDescription.length}/500
                        </p>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        // Show loading while checking auth
        !authChecked ? (
            <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
                <div className="flex items-center gap-2 text-[#888] text-sm">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                </div>
            </div>
        ) : (
            <div
                className="relative min-h-screen w-full overflow-hidden bg-[#fafaf8] text-[#1a1a1a] selection:bg-[#4a7c59]/20"
                style={{ fontFamily: "var(--font-inter), var(--font-geist-sans), system-ui, sans-serif" }}
            >
                {/* Background wash */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-[#e8f0ea]/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-[#f0ede6]/40 via-transparent to-transparent" />
                </div>

                {/* Navbar */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-50 w-full border-b border-[#e8e8e4]"
                >
                    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image
                                src="/Abstract_intuitive.png"
                                alt="InsightBridge Logo"
                                width={28}
                                height={28}
                                className="rounded-md object-contain"
                            />
                            <span
                                className="text-lg tracking-tight text-[#1a1a1a]"
                                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                            >
                                INSIGHTBRIDGE
                            </span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline text-xs font-semibold tracking-[0.12em] uppercase text-[#4a7c59] px-3 py-1.5 rounded-full bg-[#e8f0ea] border border-[#d0ddd3]">
                                Behavioral Patterns
                            </span>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <section className="relative z-10 max-w-[600px] mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-20">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-center mb-10"
                    >
                        <h1
                            className="text-3xl md:text-4xl tracking-tight mb-3"
                            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                        >
                            Behavioral <span className="italic text-[#4a7c59]">Patterns</span>
                        </h1>
                        <p className="text-[#888] text-sm max-w-md mx-auto">
                            Answer honestly. There are no wrong answers — only patterns waiting to be seen.
                        </p>
                    </motion.div>

                    {/* Progress Bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[#999]">
                                Step {step + 1} of {totalSteps}
                            </span>
                            <span className="text-xs font-medium text-[#4a7c59]">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="h-1.5 bg-[#e8e8e4] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#4a7c59] to-[#3d6b4a] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>

                    {/* Step Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl border border-[#e4e4e0] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)] p-8 md:p-10"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-xl font-semibold text-[#1a1a1a] tracking-tight mb-1">
                                    {currentStep.title}
                                </h2>
                                <p className="text-sm text-[#888] mb-6">{currentStep.subtitle}</p>

                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-4"
                                >
                                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8 gap-3">
                            <button
                                type="button"
                                onClick={goBack}
                                disabled={step === 0}
                                className={cn(
                                    "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                                    step === 0
                                        ? "opacity-0 pointer-events-none"
                                        : "bg-[#f5f5f2] border border-[#ddd] hover:bg-[#eee] hover:border-[#ccc] text-[#555]"
                                )}
                            >
                                Back
                            </button>

                            {step < totalSteps - 1 ? (
                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={!canProceed()}
                                    className={cn(
                                        "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm",
                                        canProceed()
                                            ? "bg-[#3d6b4a] text-white hover:bg-[#2f5a3c] hover:shadow-md"
                                            : "bg-[#e0e0dc] text-[#aaa] cursor-not-allowed"
                                    )}
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!canProceed() || isLoading}
                                    className={cn(
                                        "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm",
                                        canProceed() && !isLoading
                                            ? "bg-[#3d6b4a] text-white hover:bg-[#2f5a3c] hover:shadow-md"
                                            : "bg-[#e0e0dc] text-[#aaa] cursor-not-allowed"
                                    )}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Analyzing patterns...
                                        </span>
                                    ) : (
                                        "Generate My Report"
                                    )}
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Disclaimer */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center text-xs text-[#bbb] mt-6 max-w-sm mx-auto leading-relaxed"
                    >
                        This is a reflective tool, not clinical assessment. For mental health support, please consult a licensed professional.
                    </motion.p>
                </section>
            </div>
        )
    );
}
