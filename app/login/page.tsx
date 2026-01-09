"use client";

/**
 * Login Page
 * Email/password authentication with Supabase
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const router = useRouter();
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

            // Redirect to home page
            router.push("/");
            router.refresh();
        } catch (err) {
            console.error("Login error:", err);
            setError(err instanceof Error ? err.message : "Failed to login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#8ae1fc]/10 via-[#50ffb1]/10 to-[#3c896d]/10 dark:from-[#4d685a] dark:via-[#546d64] dark:to-[#3c896d] flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to access your insights
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
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
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-[#3c896d] dark:text-[#50ffb1] hover:underline font-medium">
                                Sign up
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
