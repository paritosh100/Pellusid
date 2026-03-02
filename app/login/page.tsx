"use client";

/**
 * Login Page
 * Email/password authentication with Supabase
 * Styled to match the light organic InsightBridge aesthetic
 */

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
                <div className="flex items-center gap-2 text-[#888] text-sm">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                </div>
            </div>
        }>
            <LoginPageInner />
        </Suspense>
    );
}

function LoginPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            router.push(redirectTo);
            router.refresh();
        } catch (err) {
            console.error("Login error:", err);
            setError(err instanceof Error ? err.message : "Failed to login");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const supabase = createClient();
            const siteUrl = window.location.origin;
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
                },
            });
        } catch (error) {
            console.error("Google login error:", error);
        }
    };

    return (
        <div
            className="relative min-h-screen w-full overflow-hidden bg-[#fafaf8] text-[#1a1a1a] selection:bg-[#4a7c59]/20"
            style={{ fontFamily: "var(--font-inter), var(--font-geist-sans), system-ui, sans-serif" }}
        >
            {/* Subtle background gradient wash */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-[#e8f0ea]/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-[#f0ede6]/40 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-8">

                {/* Logo */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-6 text-center"
                >
                    <Link href="/" className="inline-flex items-center group">
                        <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">
                            INSIGHTBRIDGE
                        </span>
                    </Link>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="w-full max-w-md bg-white rounded-2xl border border-[#e4e4e0] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)] p-7 md:p-8"
                >
                    <h1
                        className="text-2xl md:text-3xl font-semibold text-center mb-2 tracking-tight"
                        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                        Welcome Back
                    </h1>
                    <p className="text-center text-[#888] text-sm mb-6">Sign in to access your insights</p>

                    {/* Google Login */}
                    <div className="mb-6">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-[#ddd] bg-[#fafaf8] text-sm font-medium text-[#333] hover:bg-[#f0f0ec] hover:border-[#ccc] transition-all duration-200"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="relative mt-5 flex items-center gap-4">
                            <div className="h-px bg-[#e8e8e4] flex-1" />
                            <span className="text-xs text-[#aaa] uppercase tracking-wider font-medium">Or with email</span>
                            <div className="h-px bg-[#e8e8e4] flex-1" />
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#333] mb-1.5">
                                Email <span className="text-red-400 text-xs">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-[#ddd] bg-[#fafaf8] text-[#1a1a1a] text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#333] mb-1.5">
                                Password <span className="text-red-400 text-xs">*</span>
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-[#ddd] bg-[#fafaf8] text-[#1a1a1a] text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 transition-all duration-200"
                            />
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full py-3.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm mt-2",
                                "bg-[#3d6b4a] text-white hover:bg-[#2f5a3c] hover:shadow-md",
                                "disabled:opacity-60 disabled:cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2.5">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        {/* Links */}
                        <div className="text-center space-y-2.5 pt-2">
                            <p className="text-sm text-[#888]">
                                Don&apos;t have an account?{" "}
                                <Link href={`/signup${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="text-[#4a7c59] hover:text-[#3d6b4a] transition-colors font-medium">
                                    Sign up
                                </Link>
                            </p>
                            <p className="text-sm">
                                <Link href="/" className="text-[#aaa] hover:text-[#666] transition-colors">
                                    ← Back to home
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>

                {/* Footer */}
                <p className="mt-6 text-xs text-[#bbb]">© 2024 InsightBridge. All rights reserved.</p>
            </div>
        </div>
    );
}
