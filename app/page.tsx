"use client";

/**
 * Home Page - Life-Pattern Insights Input Form
 * Client component for user interaction
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserMenu } from "@/components/user-menu";
import type { User } from "@supabase/supabase-js";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [focusArea, setFocusArea] = useState("");

  // Check auth status
  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Build request payload
      const payload: any = {
        name: name.trim(),
        birthDate: birthDate.trim(),
        birthCity: birthCity.trim(),
      };

      if (birthTime.trim()) {
        payload.birthTime = birthTime.trim();
      }

      if (focusArea.trim()) {
        payload.focusArea = focusArea.trim();
      }

      // Call API
      const response = await fetch("/api/generate-reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to generate reading");
      }

      // Redirect to result page
      router.push(`/result?rid=${data.readingId}`);
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8ae1fc]/10 via-[#50ffb1]/10 to-[#3c896d]/10 dark:from-[#4d685a] dark:via-[#546d64] dark:to-[#3c896d] flex items-center">
      <div className="container mx-auto px-4 py-8">
        {/* Auth UI - Top Right */}
        <div className="absolute top-4 right-4">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-[#50ffb1] to-[#8ae1fc] hover:from-[#3c896d] hover:to-[#50ffb1] text-gray-900">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#3c896d] to-[#50ffb1] dark:from-[#50ffb1] dark:to-[#8ae1fc] bg-clip-text text-transparent">
            Pellucid Insights
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            A reflection tool for clearer thinking
          </p>
        </div>

        {/* Form Card */}
        <Card className="max-w-lg mx-auto shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Begin Your Reflection</CardTitle>
            <CardDescription>
              Share a few details to generate your insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              {/* Birth Date */}
              <div className="space-y-1.5">
                <Label htmlFor="birthDate">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>

              {/* Birth Time (Optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="birthTime">
                  Birth Time <span className="text-gray-400 text-sm">(optional)</span>
                </Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
              </div>

              {/* Birth City */}
              <div className="space-y-1.5">
                <Label htmlFor="birthCity">
                  Place of Birth (City, Country) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthCity"
                  type="text"
                  placeholder="e.g., New York, USA"
                  value={birthCity}
                  onChange={(e) => setBirthCity(e.target.value)}
                  required
                  maxLength={100}
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
                className="w-full py-5 bg-gradient-to-r from-[#50ffb1] to-[#8ae1fc] hover:from-[#3c896d] hover:to-[#50ffb1] text-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Begin"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Disclaimer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto">
          This is a reflection tool for entertainment purposes. You decide what resonates.
        </p>
      </div>
    </div>
  );
}
