"use client";

/**
 * Home Page - Life-Pattern Insights Input Form
 * Client component for user interaction
 * Revamped with "Etheric Science" Aesthetic
 */

import { useState, useEffect, useRef, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserMenu } from "@/components/user-menu";
import { CityAutocomplete } from "@/components/city-autocomplete";
import type { User } from "@supabase/supabase-js";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Components ---

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

    if (dist < 100) { // Attraction range
      x.set((e.clientX - centerX) * 0.2); // Magnetic strength
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
      <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-teal-200 transition-colors duration-300">
        {children}
      </span>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-scannner" />
    </motion.button>
  );
};

const ExpandingInput = ({ label, id, type, value, onChange, required, maxLength, placeholder }: any) => {
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
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full bg-transparent border-b border-white/10 py-3 text-lg text-white/90 placeholder-transparent focus:outline-none focus:border-teal-500/50 transition-all duration-500",
            "font-mono tracking-tight",
            isFocused || hasValue ? "opacity-100" : "opacity-0 cursor-text"
          )}
          placeholder={placeholder} // Keep placeholder for accessibility, visually hidden mostly
        />

        {/* Click target helper when empty */}
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

// --- Page Component ---

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

  // Birth time confirmation dialog state
  const [showBirthTimeDialog, setShowBirthTimeDialog] = useState(false);
  const [proceedWithoutBirthTime, setProceedWithoutBirthTime] = useState(false);

  // Mouse / Interaction state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [rippleActive, setRippleActive] = useState(false);

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

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

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
        setBirthTime(data.birth_time || "");
        setBirthCity(data.birth_city || "");
      }
    }

    fetchUserData();
  }, [user]);

  const submitReading = async () => {
    setError(null);
    setIsLoading(true);
    setRippleActive(true);

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
      setRippleActive(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if birth time is missing and user hasn't confirmed to proceed without it
    if (!birthTime.trim() && !proceedWithoutBirthTime) {
      setShowBirthTimeDialog(true);
      return;
    }

    // Proceed with submission
    await submitReading();
  };

  // Background Gradients
  const bgX = useTransform(mouseX, [0, 2000], ["0%", "10%"]);
  const bgY = useTransform(mouseY, [0, 1000], ["0%", "10%"]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0c] text-white selection:bg-teal-500/30">

      {/* --- I. Global Aesthetic: Etheric Science Background --- */}

      {/* Noise Layer */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.05]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Static Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={rippleActive ? { scale: [1, 5], opacity: [0.6, 0] } : { scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-[#1e1b4b] rounded-full mix-blend-screen blur-[120px] animate-pulse-slow"
        />
        <motion.div
          animate={rippleActive ? { scale: [1, 4], opacity: [0.5, 0] } : { scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
          className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] bg-[#0d9488] rounded-full mix-blend-screen blur-[100px] opacity-40 animate-float"
        />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-[#3c896d]/20 rounded-full mix-blend-screen blur-[80px] animate-drift" />
      </div>


      {/* --- II. Layout: Presence & Motion Container --- */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-12 md:py-12 min-h-screen flex flex-col justify-start md:justify-center">

        {/* --- Navigation: Command Hub --- */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90vw] md:max-w-2xl"
        >
          <div className="mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-500 hover:bg-white/10">
            <Link href="/" className="group">
              <span className="text-lg md:text-xl font-bold tracking-tighter bg-gradient-to-r from-teal-200 to-emerald-400 bg-clip-text text-transparent group-hover:to-teal-100 transition-all">
                PELLUCID
              </span>
              <span className="ml-2 text-xs text-white/40 tracking-[0.2em] hidden md:inline">INSIGHTS</span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <UserMenu user={user} />
              ) : (
                <>
                  <Link href="/login" className="text-xs text-white/60 hover:text-white transition-colors uppercase tracking-widest block">
                    Login
                  </Link>
                  <Link href="/signup">
                    <MagneticButton className="!px-5 !py-2 !text-xs !bg-teal-500/20 !border-teal-500/30 hover:!bg-teal-500/40">
                      Sign Up
                    </MagneticButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.header>


        {/* --- Content Body --- */}
        <div className="grid md:grid-cols-12 gap-12 items-center w-full">

          {/* Left Col: Title & Concept */}
          <div className="md:col-span-5 md:col-start-2 relative perspective-1000">
            <motion.div
              initial={{ opacity: 0, x: -50, rotateY: 10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="relative">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-teal-900/20 leading-[0.85]">
                  REFLECT<br />
                  <span className="text-teal-500/80 font-serif italic font-thin tracking-normal">Unseen</span><br />
                  PATTERNS
                </h1>
                {/* Decorative floating element */}
                <div className="absolute -top-10 -left-10 w-20 h-20 border border-teal-500/20 rounded-full animate-spin-slow" />
              </div>

              <p className="text-lg md:text-xl text-white/50 font-light max-w-sm leading-relaxed border-l border-teal-500/30 pl-6">
                A quantum-styled interface for navigating the probability space of your life path.
              </p>
            </motion.div>
          </div>


          {/* Right Col: The Form (Anti-Grid Structure) */}
          {/* <div className="md:col-span-1"></div> Spacer to break grid */}

          <div className="md:col-span-5 relative mt-12 md:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 50, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative bg-black/40 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] z-20"
              style={{ transform: "translateZ(20px)" }} // Floating effect
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-teal-500/30 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-teal-500/30 rounded-br-2xl" />

              <form onSubmit={handleSubmit} className="space-y-12">

                <div className="space-y-8">
                  {/* Name Input */}
                  <ExpandingInput
                    id="name"
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={(e: any) => setName(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="Your full name"
                  />

                  <div className="grid grid-cols-2 gap-8">
                    <ExpandingInput
                      id="birthDate"
                      label="Birth Date"
                      type="date"
                      value={birthDate}
                      onChange={(e: any) => setBirthDate(e.target.value)}
                      required
                    />
                    <ExpandingInput
                      id="birthTime"
                      label="Birth Time (24 hour)"
                      type="time"
                      value={birthTime}
                      onChange={(e: any) => {
                        setBirthTime(e.target.value);
                        // Reset the flag if user manually adds birth time
                        if (e.target.value && proceedWithoutBirthTime) {
                          setProceedWithoutBirthTime(false);
                        }
                      }}
                    />
                  </div>

                  <CityAutocomplete
                    id="birthCity"
                    label="Birth City"
                    value={birthCity}
                    onChange={setBirthCity}
                    required
                    placeholder="City, Country"
                  />
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

                <div className="pt-4 flex justify-center">
                  <MagneticButton
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-3">
                        <svg className="animate-spin h-4 w-4 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating Trajectory...
                      </span>
                    ) : (
                      "Generate Insights"
                    )}
                  </MagneticButton>
                </div>
              </form>
            </motion.div>

            {/* Decorative floating elements behind form */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 rounded-full bg-gradient-to-tr from-teal-500/5 to-purple-500/5 blur-3xl" />

          </div>

        </div>

      </div>

      {/* Birth Time Confirmation Dialog */}
      <AnimatePresence>
        {showBirthTimeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowBirthTimeDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-[0_20px_60px_-12px_rgba(0,0,0,0.8)]"
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-teal-500/40 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-teal-500/40 rounded-br-3xl" />

              {/* Content */}
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 mb-2">
                    <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Birth Time Not Provided
                  </h3>
                </div>

                <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                  <p className="border-l-2 border-teal-500/30 pl-4">
                    If you skip this, your reflection will focus on <span className="text-white font-medium">broader life patterns</span> rather than precise timing.
                  </p>
                  <p className="border-l-2 border-purple-500/30 pl-4">
                    If you ever find or remember your birth time, you can add it later for more detail.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => {
                      setProceedWithoutBirthTime(true);
                      setShowBirthTimeDialog(false);
                      // Trigger submission after state update
                      setTimeout(() => {
                        submitReading();
                      }, 0);
                    }}
                    className="w-full px-6 py-4 rounded-2xl font-medium text-sm tracking-wide uppercase transition-all duration-300 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-teal-500/10 hover:border-teal-500/30 hover:shadow-[0_0_30px_-5px_rgba(13,148,136,0.3)] text-white group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 group-hover:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      I don't know my birth time
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowBirthTimeDialog(false);
                      // Focus on birth time input
                      setTimeout(() => {
                        document.getElementById('birthTime')?.focus();
                      }, 100);
                    }}
                    className="w-full px-6 py-4 rounded-2xl font-medium text-sm tracking-wide uppercase transition-all duration-300 bg-teal-500/20 backdrop-blur-md border border-teal-500/40 hover:bg-teal-500/30 hover:border-teal-500/50 hover:shadow-[0_0_30px_-5px_rgba(13,148,136,0.5)] text-teal-200 group"
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

              {/* Decorative glow */}
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10 blur-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

        /* Autofill Override: Keep transparent background */
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
