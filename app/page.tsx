"use client";

/**
 * Home Page - Life-Pattern Insights Landing
 * Redesigned with light, organic, wellness-inspired aesthetic
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserMenu } from "@/components/user-menu";
import { CityAutocomplete } from "@/components/city-autocomplete";
import type { User } from "@supabase/supabase-js";
import type { ReadingMode } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";


// --- Page Component ---

// Smooth scroll with easing
function smoothScrollTo(elementId: string, duration = 900) {
  const target = document.getElementById(elementId);
  if (!target) return;
  const targetRect = target.getBoundingClientRect();
  const startY = window.scrollY;
  const targetY = startY + targetRect.top - window.innerHeight / 2 + targetRect.height / 2;
  const diff = targetY - startY;
  let startTime: number | null = null;

  function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

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
  const [mode, setMode] = useState<ReadingMode>('normal');

  // Birth time confirmation dialog state
  const [showBirthTimeDialog, setShowBirthTimeDialog] = useState(false);
  const [proceedWithoutBirthTime, setProceedWithoutBirthTime] = useState(false);

  // Check auth status
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        // Subtle delay to ensure DOM is ready and hero animation has started
        setTimeout(() => smoothScrollTo('journal-form'), 500);
      }
    });
    return () => subscription.unsubscribe();
  }, []);


  // Pre-fill form with user data from latest reading
  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setName("");
        setBirthDate("");
        setBirthTime("");
        setBirthCity("");
        setFocusArea("");
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('readings')
        .select('name, birth_date, birth_time, birth_city')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setName(data.name || "");
        setBirthDate(data.birth_date || "");
        const rawTime = data.birth_time || "";
        setBirthTime(rawTime.length > 5 ? rawTime.slice(0, 5) : rawTime);
        setBirthCity(data.birth_city || "");
      }
    }
    fetchUserData();
  }, [user]);

  const submitReading = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        birthDate: birthDate.trim(),
        birthCity: birthCity.trim(),
        mode,
      };

      if (birthTime.trim()) {
        payload.birthTime = birthTime.trim();
      }

      if (focusArea.trim()) {
        payload.focusArea = focusArea.trim();
      }

      const response = await fetch("/api/generate-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to generate reading");
      }

      router.push(`/result?rid=${data.readingId}`);
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthTime.trim() && !proceedWithoutBirthTime) {
      setShowBirthTimeDialog(true);
      return;
    }
    await submitReading();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#fafaf8] text-[#1a1a1a] selection:bg-[#4a7c59]/20"
      style={{ fontFamily: "var(--font-inter), var(--font-geist-sans), system-ui, sans-serif" }}
    >

      {/* Subtle background gradient wash */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-[#e8f0ea]/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-[#f0ede6]/40 via-transparent to-transparent" />
      </div>

      {/* ===== NAVBAR ===== */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-50 w-full border-b border-[#e8e8e4]"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 py-4 flex items-center justify-between">


          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/Abstract_intuitive.png"
              alt="InsightBridge Logo"
              width={28}
              height={28}
              className="rounded-md object-contain"
            />
            <span className="text-lg  tracking-tight text-[#1a1a1a]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              INSIGHTBRIDGE
            </span>
          </Link>


          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "About"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors duration-200 font-medium"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">

            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-[#444] hover:text-[#1a1a1a] transition-colors duration-200 font-medium whitespace-nowrap"
                >
                  Log In
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#3d6b4a] text-white text-xs sm:text-sm font-medium hover:bg-[#2f5a3c] transition-colors duration-200 shadow-sm whitespace-nowrap"
                >
                  Get Started

                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>


      {/* ===== HERO SECTION ===== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-16 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8f0ea] border border-[#d0ddd3] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59]" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#3d6b4a]">
              Wellness Journaling Reimagined
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Find clarity in<br />
            <span className="italic text-[#4a7c59] font-medium">everyday moments</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#666] max-w-xl mx-auto leading-relaxed mb-10 font-light">
            InsightBridge helps you untangle your thoughts, discover patterns in your energy, and cultivate a deeper connection with your inner self through guided reflection.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => smoothScrollTo('journal-form')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#3d6b4a] text-white text-base font-medium hover:bg-[#2f5a3c] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Start Your Journal
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <button
              onClick={() => smoothScrollTo('how-it-works')}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white border border-[#ddd] text-[#333] text-base font-medium hover:border-[#bbb] hover:bg-[#fafafa] transition-all duration-200"
            >
              <svg className="w-4 h-4 text-[#3d6b4a]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              See How it Works
            </button>
          </div>
        </motion.div>
      </section>


      {/* ===== BROWSER MOCKUP / PREVIEW ===== */}
      <section className="relative z-10 max-w-[960px] mx-auto px-6 md:px-10 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#e4e4e0] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#eee] bg-[#fafafa]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 text-center text-xs text-[#999] font-mono">
              insightbridge.com/insights
            </div>
          </div>

          {/* Mock content */}
          <div className="flex min-h-[320px]">
            {/* Sidebar */}
            <div className="w-[220px] border-r border-[#eee] p-5 hidden md:block bg-[#fcfcfb]">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#3d6b4a] text-white text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                  Core Theme
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#555] text-sm hover:bg-[#f5f5f2]">
                  <svg className="w-4 h-4 text-[#4a7c59]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  What&apos;s Working
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#555] text-sm hover:bg-[#f5f5f2]">
                  <svg className="w-4 h-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
                  Energy Drains
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold tracking-wider uppercase text-[#4a7c59] mb-3">Recent Entries</p>
                <div className="space-y-2">
                  <div className="h-2 bg-[#e8e8e4] rounded-full w-[85%]" />
                  <div className="h-2 bg-[#e8e8e4] rounded-full w-[65%]" />
                  <div className="h-2 bg-[#e8e8e4] rounded-full w-[75%]" />
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 p-6 md:p-8">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4a7c59] mb-3">Weekly Insights</p>
              <h3 className="text-2xl md:text-3xl tracking-tight mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Creative expression
              </h3>
              <h3 className="text-2xl md:text-3xl italic text-[#4a7c59] mb-5" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                and vision
              </h3>
              <p className="text-[#555] text-sm md:text-base leading-relaxed max-w-lg mb-6 select-none" style={{ filter: "blur(3.5px)" }}>
                There may be a tension between creativity and responsibility. Internally, this can feel like a push-pull between self-expression and practical demands. Yet, there is a quiet strength in your ability to inspire others.
              </p>

              {/* AI attribution pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f5f5f2] border border-[#e8e8e4]">
                <svg className="w-4 h-4 text-[#4a7c59]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                <span className="text-xs italic text-[#888]">AI-generated reflection based on your last 7 entries.</span>
                <span className="text-[#bbb] ml-auto">•••</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>


      {/* ===== JOURNAL FORM SECTION ===== */}
      <section id="journal-form" className="relative z-10 max-w-[640px] mx-auto px-6 md:px-10 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl tracking-tight mb-3"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Begin Your <span className="italic text-[#4a7c59]">Journey</span>
          </h2>
          <p className="text-[#888] text-sm">Enter your details to receive personalized insights</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="bg-white rounded-2xl border border-[#e4e4e0] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)] p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#333] mb-1.5">
                Full Name <span className="text-red-400 text-xs">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl border border-[#ddd] bg-[#fafaf8] text-[#1a1a1a] text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 transition-all duration-200"
              />
            </div>

            {/* Birth Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-[#333] mb-1.5">
                  Birth Date <span className="text-red-400 text-xs">*</span>
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd] bg-[#fafaf8] text-[#1a1a1a] text-sm focus:outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="birthTime" className="block text-sm font-medium text-[#333] mb-1.5">
                  Birth Time <span className="text-[#aaa] text-xs">(24h)</span>
                </label>
                <input
                  id="birthTime"
                  type="time"
                  value={birthTime}
                  onChange={(e) => {
                    setBirthTime(e.target.value);
                    if (e.target.value && proceedWithoutBirthTime) {
                      setProceedWithoutBirthTime(false);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd] bg-[#fafaf8] text-[#1a1a1a] text-sm focus:outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* Birth City */}
            <div>
              <label htmlFor="birthCity" className="block text-sm font-medium text-[#333] mb-1.5">
                Birth City <span className="text-red-400 text-xs">*</span>
              </label>
              <CityAutocomplete
                id="birthCity"
                label=""
                value={birthCity}
                onChange={setBirthCity}
                required
                placeholder="City, Country"
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
                "w-full py-4 rounded-full text-base font-medium transition-all duration-200 shadow-sm",
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
                  Generating insights...
                </span>
              ) : (
                "Generate Insights"
              )}
            </button>
          </form>
        </motion.div>
      </section>


      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4a7c59] mb-3">Process</p>
          <h2 className="text-3xl md:text-4xl tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            How it Works
          </h2>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#d0ddd3] to-transparent z-0" />

          {[
            {
              step: "01",
              title: "Enter Your Details",
              description: "Provide your birth date, time, and city to personalize your experience.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              ),
            },
            {
              step: "02",
              title: "Patterns Are Analyzed",
              description: "Our engine processes your unique data points to uncover meaningful life-path patterns.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
              ),
            },
            {
              step: "03",
              title: "Receive Insights",
              description: "Get a personalized report covering career, relationships, and timing — tailored just for you.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Step badge */}
              <div className="relative mb-6">
                <div className="w-14 h-14 rounded-full bg-white border border-[#d0ddd3] flex items-center justify-center text-[#4a7c59] shadow-sm group-hover:border-[#4a7c59]/50 group-hover:shadow-md transition-all duration-300">
                  {item.icon}
                </div>
                <span className="absolute -top-2 -right-2 text-[10px] font-mono font-bold text-[#4a7c59]/60 tracking-wider">{item.step}</span>
              </div>

              <div className="bg-white border border-[#e8e8e4] rounded-2xl p-6 w-full shadow-sm group-hover:shadow-md group-hover:border-[#d0ddd3] transition-all duration-300">
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2 tracking-tight">{item.title}</h3>
                <p className="text-sm text-[#888] leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4a7c59] mb-3">Capabilities</p>
          <h2 className="text-3xl md:text-4xl tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Features
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Mindful Focus",
              description: "Designated spaces for deep work and reflection, free from the usual distractions of modern tools.",
              link: "Learn more",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              ),
            },
            {
              title: "Strategic Insight",
              description: "Visual tools that help you map out long-term goals and align your daily actions with your bigger picture.",
              link: "Explore features",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              ),
            },
            {
              title: "Balanced Living",
              description: "Integrate wellness, relationships, and rest into your productivity planning for a holistic approach.",
              link: "See how it works",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                </svg>
              ),
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group bg-white border border-[#e8e8e4] rounded-2xl p-7 hover:shadow-lg hover:border-[#d0ddd3] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-[#e8f0ea] flex items-center justify-center text-[#4a7c59] mb-5 group-hover:bg-[#dde8df] transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2.5 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-[#888] leading-relaxed mb-4">{feature.description}</p>
              <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4a7c59] hover:text-[#3d6b4a] transition-colors duration-200">
                {feature.link}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-[#e8e8e4]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#999]">© 2024 InsightBridge. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a key={link} href="#" className="text-sm text-[#999] hover:text-[#555] transition-colors duration-200">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>


      {/* ===== BIRTH TIME CONFIRMATION DIALOG ===== */}
      <AnimatePresence>
        {showBirthTimeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBirthTimeDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl border border-[#e4e4e0] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] p-8 md:p-10 max-w-md w-full"
            >
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#e8f0ea] mb-2">
                    <svg className="w-8 h-8 text-[#4a7c59]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#1a1a1a] tracking-tight"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Birth Time Not Provided
                  </h3>
                </div>

                <div className="space-y-3 text-[#666] text-sm leading-relaxed">
                  <p className="border-l-2 border-[#4a7c59]/40 pl-4">
                    If you skip this, your reflection will focus on <span className="text-[#1a1a1a] font-medium">broader life patterns</span> rather than precise timing.
                  </p>
                  <p className="border-l-2 border-[#d4a843]/40 pl-4">
                    If you ever find or remember your birth time, you can add it later for more detail.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => {
                      setProceedWithoutBirthTime(true);
                      setShowBirthTimeDialog(false);
                      setTimeout(() => { submitReading(); }, 0);
                    }}
                    className="w-full px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 bg-[#f5f5f2] border border-[#ddd] hover:bg-[#eee] hover:border-[#ccc] text-[#333] group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 text-[#4a7c59]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      I don&apos;t know my birth time
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowBirthTimeDialog(false);
                      setTimeout(() => { document.getElementById('birthTime')?.focus(); }, 100);
                    }}
                    className="w-full px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 bg-[#3d6b4a] text-white hover:bg-[#2f5a3c] shadow-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      I know / want to add it
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
