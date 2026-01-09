/**
 * Type definitions for the Life-Pattern Insights application
 */

// User input form data
export interface UserInput {
  name: string;
  birthDate: string; // ISO date string
  birthTime?: string; // Optional, HH:mm format
  birthCity: string;
  focusArea?: string; // Optional, max 200 chars
}

// Strict JSON schema for OpenAI response
export interface ReadingResponse {
  headline: string;
  coreTheme: string;
  strengths: string[];
  watchOuts: string[];
  next7Days: string[];
  journalPrompt: string;
  disclaimer: string;
}

// Stored reading data (includes inputs + generated reading)
export interface StoredReading {
  readingId: string;
  inputs: UserInput;
  reading: ReadingResponse;
  timestamp: number;
}

// API response types
export interface GenerateReadingResponse {
  readingId: string;
}

export interface GenerateReadingError {
  error: string;
  details?: string;
}
