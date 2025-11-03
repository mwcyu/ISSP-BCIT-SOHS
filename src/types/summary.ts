// src/types/summary.ts
// import type { Timestamp } from "firebase/firestore";

/**
 * Represents one user's (one browser tab's) summary document in Firestore.
 * Each session gets its own document with up to four standards.
 */
export interface SessionSummary {
  sessionId: string;
  created_at?: string;
  s1_summary?: string;
  s2_summary?: string;
  s3_summary?: string;
  s4_summary?: string;
}
