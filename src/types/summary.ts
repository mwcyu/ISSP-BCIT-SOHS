// src/types/summary.ts
import type { Timestamp } from "firebase/firestore";

/**
 * Represents one user's (one browser tab's) summary document in Firestore.
 * Each session gets its own document with up to four standards.
 */
export interface SessionSummary {
  sessionId: string;
  timestamp?: Timestamp;
  "Standard 1"?: string;
  "Standard 2"?: string;
  "Standard 3"?: string;
  "Standard 4"?: string;
}
