/**
 * Type definitions for the Life-Pattern Insights application
 */

// Reading mode
export type ReadingMode = 'normal' | 'stealth';

// User input form data
export interface UserInput {
  name: string;
  birthDate: string; // ISO date string
  birthTime?: string; // Optional, HH:mm format
  birthCity: string;
  focusArea?: string; // Optional, max 200 chars
  mode?: ReadingMode; // Optional, defaults to 'normal'
}

// Strict JSON schema for OpenAI response (normal mode)
export interface ReadingResponse {
  headline: string;
  coreTheme: string;
  strengths: string[];
  frictions: string[];
  next7Days: string[];
  journalPrompt: string;
  disclaimer: string;
}

// Stealth mode response — pattern-based reflection with no astrological language
export interface StealthReadingResponse {
  whereYouveBeen: string;    // Recurring life patterns & themes
  whereYouAre: string;       // Current life phase description
  direction: string;         // Growth direction & evolving patterns
  summary: {
    dominantPattern: string;       // 1-2 sentences: main life theme active now
    careerWorkStyle: string;       // Deeper reflection on work dynamics
    decisionAlignment: string;     // Alignment vs friction lens
  };
  closingNudge: string;      // Soft reflective ending
}

// Stored reading data — normal mode (includes inputs + generated reading)
export interface StoredReading {
  readingId: string;
  inputs: UserInput;
  reading: ReadingResponse;
  timestamp: number;
  mode?: ReadingMode;
}

// Stored reading data — stealth mode
export interface StealthStoredReading {
  readingId: string;
  inputs: UserInput;
  reading: StealthReadingResponse;
  timestamp: number;
  mode: 'stealth';
}

// API response types
export interface GenerateReadingResponse {
  readingId: string;
  mode?: ReadingMode;
}

export interface GenerateReadingError {
  error: string;
  details?: string;
}
