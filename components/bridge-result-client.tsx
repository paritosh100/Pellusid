"use client";

/**
 * Bridge Result Client — Behavioral Patterns Report + Chat + Paywall
 *
 * Three states:
 * 1. Report view — structured report from Bridge
 * 2. Free chat — direct conversation with Bridge (3 free questions)
 * 3. Paywall — partial insight + unlock CTA
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type {
    BridgeQuestionnaireData,
    BridgeReport,
    BridgeChatMessage,
    BridgeState,
} from "@/lib/bridge-types";

interface BridgeResultClientProps {
    questionnaire: BridgeQuestionnaireData;
    report: BridgeReport;
}

const BRIDGE_INTRO =
    "Hi. I\u2019m Bridge. Do you want to go deeper on this? We can explore a specific situation, get practical clarity, or you can ask me a custom question.";

const MAX_FREE_QUESTIONS = 3;

export function BridgeResultClient({ questionnaire, report }: BridgeResultClientProps) {
    const [view, setView] = useState<"report" | "chat">("report");
    const [chatHistory, setChatHistory] = useState<BridgeChatMessage[]>([
        { role: "bridge", content: BRIDGE_INTRO },
    ]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [bridgeState, setBridgeState] = useState<BridgeState>("bridge_free_chat");
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isThinking]);

    async function sendMessage() {
        const msg = input.trim();
        if (!msg || isThinking) return;

        const newHistory: BridgeChatMessage[] = [
            ...chatHistory,
            { role: "user", content: msg },
        ];
        setChatHistory(newHistory);
        setInput("");
        setIsThinking(true);

        try {
            const res = await fetch("/api/bridge/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: msg,
                    questionnaireData: questionnaire,
                    reportData: report,
                    chatHistory: newHistory.slice(1), // skip intro
                    questionCount,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error);

            setChatHistory([
                ...newHistory,
                { role: "bridge", content: data.reply },
            ]);
            setQuestionCount((c) => c + 1);
            setBridgeState(data.state);
        } catch (err) {
            setChatHistory([
                ...newHistory,
                {
                    role: "bridge",
                    content: "Something went wrong. Please try again.",
                },
            ]);
        } finally {
            setIsThinking(false);
        }
    }

    const isPaywalled = bridgeState === "paywall_reached";
    const questionsRemaining = MAX_FREE_QUESTIONS - questionCount;

    // ---- Report View ----
    function renderReport() {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
            >
                {/* Core Theme */}
                <div className="bg-gradient-to-br from-[#e8f0ea] to-[#f5f5f2] rounded-2xl p-6 md:p-8 border border-[#d0ddd3]">
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4a7c59] mb-2">
                        Core Theme
                    </p>
                    <h2
                        className="text-2xl md:text-3xl tracking-tight text-[#1a1a1a]"
                        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                        {report.coreTheme}
                    </h2>
                </div>

                {/* Pattern Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Past Pattern */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border border-[#e4e4e0] rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f0ede6] flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#a08b5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#999]">Past Pattern</p>
                        </div>
                        <p className="text-sm text-[#444] leading-relaxed">{report.pastPattern}</p>
                    </motion.div>

                    {/* Current Phase */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-[#e4e4e0] rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-[#e8f0ea] flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#4a7c59]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#999]">Current Phase</p>
                        </div>
                        <p className="text-sm text-[#444] leading-relaxed">{report.currentPhase}</p>
                    </motion.div>

                    {/* Emerging Direction */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-[#e4e4e0] rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-[#eae8f0] flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#6b5ea0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                </svg>
                            </div>
                            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#999]">Emerging Direction</p>
                        </div>
                        <p className="text-sm text-[#444] leading-relaxed">{report.emergingDirection}</p>
                    </motion.div>
                </div>

                {/* Plus Insight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-[#e4e4e0] rounded-xl p-6 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#fef3e2] flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                            </svg>
                        </div>
                        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#999]">Plus</p>
                    </div>

                    <p
                        className="text-lg md:text-xl font-medium text-[#1a1a1a] mb-3 tracking-tight"
                        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                        &ldquo;{report.plusQuestion}&rdquo;
                    </p>
                    <p className="text-sm text-[#555] leading-relaxed">{report.plusAnswer}</p>
                </motion.div>

                {/* Go Deeper CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center pt-2"
                >
                    <button
                        onClick={() => setView("chat")}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#3d6b4a] text-white text-sm font-medium hover:bg-[#2f5a3c] transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Go Deeper with Bridge
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    // ---- Chat View ----
    function renderChat() {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col h-[calc(100vh-160px)] max-h-[700px]"
            >
                {/* Chat header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#e8e8e4] mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4a7c59] to-[#3d6b4a] flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-semibold">B</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#1a1a1a]">Bridge</p>
                            <p className="text-xs text-[#999]">Behavioral Patterns Navigator</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isPaywalled && (
                            <span className="text-xs text-[#999]">
                                {questionsRemaining} question{questionsRemaining !== 1 ? "s" : ""} remaining
                            </span>
                        )}
                        <button
                            onClick={() => setView("report")}
                            className="text-xs font-medium text-[#4a7c59] hover:text-[#2f5a3c] transition-colors"
                        >
                            ← Report
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                    {chatHistory.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "flex",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-[#3d6b4a] text-white rounded-br-md"
                                        : "bg-[#f5f5f2] text-[#333] border border-[#e8e8e4] rounded-bl-md"
                                )}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}

                    {/* Thinking indicator */}
                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-[#f5f5f2] border border-[#e8e8e4] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-bridge-pulse" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-bridge-pulse" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-bridge-pulse" style={{ animationDelay: "300ms" }} />
                            </div>
                        </motion.div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="pt-4 border-t border-[#e8e8e4] mt-2">
                    {isPaywalled ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-[#888] mb-3">Your free questions have been used.</p>
                            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#3d6b4a] to-[#4a7c59] text-white text-sm font-medium shadow-md opacity-75 cursor-default">
                                Coming Soon — Deep Pattern Report
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                placeholder="Ask Bridge a question..."
                                disabled={isThinking}
                                className="flex-1 px-4 py-3 rounded-xl border border-[#ddd] bg-[#fafaf8] text-[#1a1a1a] text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 transition-all duration-200 disabled:opacity-60"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isThinking}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-200",
                                    input.trim() && !isThinking
                                        ? "bg-[#3d6b4a] text-white hover:bg-[#2f5a3c] shadow-sm"
                                        : "bg-[#e8e8e4] text-[#bbb] cursor-not-allowed"
                                )}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    // ---- Layout ----
    return (
        <div
            className="relative min-h-screen w-full overflow-hidden bg-[#fafaf8] text-[#1a1a1a] selection:bg-[#4a7c59]/20"
            style={{ fontFamily: "var(--font-inter), var(--font-geist-sans), system-ui, sans-serif" }}
        >
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-[#e8f0ea]/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-[#f0ede6]/40 via-transparent to-transparent" />
            </div>

            {/* Navbar */}
            <header className="relative z-50 w-full border-b border-[#e8e8e4]">
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
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold tracking-[0.12em] uppercase text-[#4a7c59] px-3 py-1.5 rounded-full bg-[#e8f0ea] border border-[#d0ddd3]">
                            Behavioral Patterns
                        </span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <section className="relative z-10 max-w-[900px] mx-auto px-6 md:px-10 pt-8 md:pt-12 pb-20">
                <AnimatePresence mode="wait">
                    {view === "report" ? (
                        <motion.div key="report" exit={{ opacity: 0, x: -20 }}>
                            {renderReport()}
                        </motion.div>
                    ) : (
                        <motion.div key="chat" exit={{ opacity: 0, x: 20 }}>
                            {renderChat()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
}
