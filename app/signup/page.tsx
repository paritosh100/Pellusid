"use client";

/**
 * Signup Page
 * Create new account with email/password
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

        // Validate passwords match
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
            // Redirect after a short delay
            setTimeout(() => {
                router.push("/");
                router.refresh();
            }, 2000);
        } catch (err) {
            console.error("Signup error:", err);
            setError(err instanceof Error ? err.message : "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#8ae1fc]/10 via-[#50ffb1]/10 to-[#3c896d]/10 dark:from-[#4d685a] dark:via-[#546d64] dark:to-[#3c896d] flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold">Account Created!</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Check your email to verify your account, then you can sign in.
                            </p>
                            <p className="text-sm text-gray-500">Redirecting...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                    <CardDescription className="text-center">
                        Sign up to save your insights
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500">At least 6 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-[#50ffb1] to-[#8ae1fc] hover:from-[#3c896d] hover:to-[#50ffb1] text-gray-900"
                        >
                            {isLoading ? "Creating account..." : "Sign Up"}
                        </Button>

                        {/* Login Link */}
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[#3c896d] dark:text-[#50ffb1] hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>

                        {/* Back to Home */}
                        <p className="text-center text-sm">
                            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:underline">
                                ← Back to home
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
