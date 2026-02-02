"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CityResult {
    city: string;
    state?: string;
    country: string;
    countryCode: string;
    formatted: string;
}

interface CityAutocompleteProps {
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    placeholder?: string;
}

export const CityAutocomplete = ({
    label,
    id,
    value,
    onChange,
    required = false,
    placeholder = "City, Country",
}: CityAutocompleteProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<CityResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout>();

    const hasValue = value && value.length > 0;

    // Fetch suggestions from API
    useEffect(() => {
        if (value.length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        // Debounce API calls
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
                const data = await response.json();

                if (data.results) {
                    setSuggestions(data.results);
                    setShowDropdown(data.results.length > 0);
                }
            } catch (error) {
                console.error("Failed to fetch city suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300); // 300ms debounce

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [value]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    selectCity(suggestions[selectedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const selectCity = (city: CityResult) => {
        onChange(city.formatted);
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
    };

    return (
        <div className="relative group perspective-500">
            <motion.div
                initial={false}
                animate={{
                    scale: isFocused || hasValue ? 1.02 : 1,
                    rotateX: isFocused ? 2 : 0,
                    y: isFocused ? -2 : 0,
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
                    {label}{" "}
                    {required && (
                        <span className="text-red-400/50 text-[10px] align-top">*</span>
                    )}
                </label>

                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    required={required}
                    onFocus={() => {
                        setIsFocused(true);
                        if (suggestions.length > 0) {
                            setShowDropdown(true);
                        }
                    }}
                    onBlur={() => setIsFocused(false)}
                    autoComplete="off"
                    className={cn(
                        "w-full bg-transparent border-b border-white/10 py-3 text-lg text-white/90 placeholder-transparent focus:outline-none focus:border-teal-500/50 transition-all duration-500",
                        "font-mono tracking-tight",
                        isFocused || hasValue ? "opacity-100" : "opacity-0 cursor-text"
                    )}
                    placeholder={placeholder}
                />

                {/* Click target helper when empty */}
                {!isFocused && !hasValue && (
                    <div
                        className="absolute inset-0 cursor-text"
                        onClick={() => inputRef.current?.focus()}
                    />
                )}
            </motion.div>

            {/* Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {isLoading ? (
                            <div className="px-4 py-3 text-sm text-white/50 flex items-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4 text-teal-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Searching...
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto">
                                {suggestions.map((city, index) => (
                                    <motion.div
                                        key={`${city.formatted}-${index}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => selectCity(city)}
                                        className={cn(
                                            "px-4 py-3 cursor-pointer transition-all duration-200 font-mono text-sm",
                                            selectedIndex === index
                                                ? "bg-teal-500/20 text-teal-200 border-l-2 border-teal-500"
                                                : "text-white/70 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                                        )}
                                    >
                                        {city.formatted}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-3 text-sm text-white/50">
                                No cities found
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
