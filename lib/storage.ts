/**
 * In-memory storage for reading data
 * TODO: Replace with persistent database (Supabase/Redis) for production
 */

import { v4 as uuidv4 } from "uuid";
import type { StoredReading, UserInput, ReadingResponse } from "./types";

// In-memory storage that survives HMR (Hot Module Replacement)
// In development, Next.js reloads modules which would reset a regular Map
// Using globalThis ensures the storage persists across reloads
const globalForReadings = globalThis as unknown as {
    readingsStore: Map<string, StoredReading> | undefined;
};

const readingsStore = globalForReadings.readingsStore ?? new Map<string, StoredReading>();

if (process.env.NODE_ENV !== 'production') {
    globalForReadings.readingsStore = readingsStore;
}

/**
 * Save a reading to storage
 * @param inputs - User input data
 * @param reading - Generated reading response
 * @returns readingId - Unique identifier for the reading
 */
export function saveReading(
    inputs: UserInput,
    reading: ReadingResponse
): string {
    const readingId = uuidv4();
    const storedReading: StoredReading = {
        readingId,
        inputs,
        reading,
        timestamp: Date.now(),
    };

    readingsStore.set(readingId, storedReading);
    console.log(`[Storage] Saved reading with ID: ${readingId}`);
    console.log(`[Storage] Total readings in store: ${readingsStore.size}`);
    return readingId;
}

/**
 * Retrieve a reading from storage
 * @param readingId - Unique identifier for the reading
 * @returns StoredReading or null if not found
 */
export function getReading(readingId: string): StoredReading | null {
    console.log(`[Storage] Attempting to retrieve reading: ${readingId}`);
    console.log(`[Storage] Total readings available: ${readingsStore.size}`);
    const result = readingsStore.get(readingId) || null;
    console.log(`[Storage] Reading found: ${!!result}`);
    return result;
}

/**
 * Get all readings (for debugging/admin purposes)
 * @returns Array of all stored readings
 */
export function getAllReadings(): StoredReading[] {
    return Array.from(readingsStore.values());
}

/**
 * Clear all readings (for testing purposes)
 */
export function clearAllReadings(): void {
    readingsStore.clear();
}
