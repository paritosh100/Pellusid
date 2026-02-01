"use client";

/**
 * Signup Page
 * Create new account with email/password
 * Styled to match the main app's etheric science aesthetic
 */

import { useState, useRef, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Magnetic Button Component
const MagneticButton = ({ children, onClick, className, disabled, type = "button" }: any) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));

        if (dist < 100) {
            x.set((e.clientX - centerX) * 0.2);
            y.set((e.clientY - centerY) * 0.2);
        } else {
            x.set(0);
            y.set(0);
        }
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            style={{ x: xSpring, y: ySpring }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            disabled={disabled}
            type={type}
            className={cn(
                "relative px-8 py-4 rounded-full font-medium text-sm tracking-wider uppercase transition-all duration-300",
                "bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 overflow-hidden group",
                "hover:bg-teal-500/10 hover:border-teal-500/30 hover:shadow-[0_0_30px_-5px_rgba(13,148,136,0.3)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        >
            <span className="relative z-10 flex items-center gap-2 group-hover:text-teal-200 transition-colors duration-300">
                {children}
            </span>
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-scanner" />
        </motion.button>
    );
};

// Expanding Input Component
const ExpandingInput = ({ label, id, type, value, onChange, required, placeholder, minLength }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;

    return (
        <div className="relative group perspective-500">
            <motion.div
                initial={false}
                animate={{
                    scale: isFocused || hasValue ? 1.02 : 1,
                    rotateX: isFocused ? 2 : 0,
                    y: isFocused ? -2 : 0
                }}
                className="relative"
            >
                <label
                    htmlFor={id}
                    className={cn(
                        "absolute left-0 transition-all duration-500 ease-out pointer-events-none",
                        isFocused || hasValue
                            ? "-top-6 text-xs text-teal-400 font-bold tracking-widest uppercase glow-text"
                            : "top-3 text-2xl font-light text-gray-500 group-hover:text-gray-400"
                    )}
                >
                    {label} {required && <span className="text-red-400/50 text-[10px] align-top">*</span>}
                </label>

                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    minLength={minLength}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={cn(
                        "w-full bg-transparent border-b border-white/10 py-3 text-lg text-white/90 placeholder-transparent focus:outline-none focus:border-teal-500/50 transition-all duration-500",
                        "font-mono tracking-tight",
                        isFocused || hasValue ? "opacity-100" : "opacity-0 cursor-text"
                    )}
                    placeholder={placeholder}
                />

                {(!isFocused && !hasValue) && (
                    <div className="absolute inset-0 cursor-text" onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input');
                        input?.focus();
                    }} />
                )}
            </motion.div>
        </div>
    );
};

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                throw error;
            }

            setSuccess(true);
            // No auto-redirect, let user see verification message
        } catch (err) {
            console.error("Signup error:", err);
            setError(err instanceof Error ? err.message : "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
        } catch (error) {
            console.error("Google login error:", error);
        }
    };

    if (success) {
        return (
            <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0c] text-white selection:bg-teal-500/30">
                <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.05]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-[#1e1b4b] rounded-full mix-blend-screen blur-[120px] opacity-60 animate-pulse-slow" />
                    <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] bg-[#0d9488] rounded-full mix-blend-screen blur-[100px] opacity-40 animate-float" />
                </div>

                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-6 bg-black/40 backdrop-blur-2xl border border-white/5 p-12 rounded-[2rem]"
                    >
                        <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto border border-teal-500/30">
                            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-br from-white via-white/80 to-teal-900/20 bg-clip-text text-transparent">
                            Account Created!
                        </h2>
                        <p className="text-white/60 max-w-md">
                            Check your email to verify your account, then you can sign in.
                        </p>
                        <div className="pt-4">
                            <Link href="/login">
                                <MagneticButton className="!px-8 !py-3">
                                    Proceed to Login
                                </MagneticButton>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0c] text-white selection:bg-teal-500/30">
            {/* Noise Layer */}
            <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.05]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Static Background Blobs */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-[#1e1b4b] rounded-full mix-blend-screen blur-[120px] opacity-60 animate-pulse-slow" />
                <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] bg-[#0d9488] rounded-full mix-blend-screen blur-[100px] opacity-40 animate-float" />
                <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-[#3c896d]/20 rounded-full mix-blend-screen blur-[80px] animate-drift" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 min-h-screen flex flex-col justify-center items-center">
                {/* Header */}
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-12 text-center"
                >
                    <Link href="/" className="group inline-block">
                        <span className="text-3xl md:text-4xl font-bold tracking-tighter bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent group-hover:to-teal-100 transition-all">
                            PELLUCID
                        </span>
                        <span className="ml-2 text-xs text-white/40 tracking-[0.2em]">INSIGHTS</span>
                    </Link>
                </motion.div>

                {/* Signup Form */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-md relative bg-black/40 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                >
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-teal-500/30 rounded-tl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-teal-500/30 rounded-br-2xl" />

                    <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 bg-gradient-to-br from-white via-white/80 to-teal-900/20 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-center text-white/50 mb-8">Sign up to save your insights</p>

                    <div className="mb-8">
                        <MagneticButton
                            onClick={handleGoogleLogin}
                            className="w-full !bg-white/10 !border-white/20 hover:!bg-white/20"
                        >
                            <span className="flex items-center justify-center gap-3">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </span>
                        </MagneticButton>

                        <div className="relative mt-8 flex items-center gap-4">
                            <div className="h-px bg-white/10 flex-1" />
                            <span className="text-xs text-white/40 uppercase tracking-widest">Or with email</span>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-8">
                        <ExpandingInput
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e: any) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />

                        <ExpandingInput
                            id="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e: any) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="••••••••"
                        />

                        <div className="relative">
                            <ExpandingInput
                                id="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e: any) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-white/30 mt-2 ml-1">At least 6 characters</p>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 bg-red-900/20 border-l-2 border-red-500 text-red-200 text-sm font-mono">
                                        ERROR_TRACE: {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4">
                            <MagneticButton
                                type="submit"
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-3">
                                        <svg className="animate-spin h-4 w-4 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </span>
                                ) : (
                                    "Sign Up"
                                )}
                            </MagneticButton>
                        </div>

                        <div className="text-center space-y-3 pt-4">
                            <p className="text-sm text-white/50">
                                Already have an account?{" "}
                                <Link href="/login" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
                                    Sign in
                                </Link>
                            </p>
                            <p className="text-sm">
                                <Link href="/" className="text-white/40 hover:text-white/60 transition-colors">
                                    ← Back to home
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>

            <style jsx global>{`
                .glow-text {
                    text-shadow: 0 0 10px rgba(45, 212, 191, 0.5), 0 0 20px rgba(45, 212, 191, 0.3);
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                @keyframes drift {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, -30px); }
                }
                @keyframes scanner {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-float { animation: float 10s ease-in-out infinite; }
                .animate-drift { animation: drift 15s ease-in-out infinite; }
                .animate-scanner { animation: scanner 2s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

                /* Autofill Override */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-text-fill-color: white !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>
        </div>
    );
}
