// src/hooks/useSessionSummary.ts
import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../api/firebase.js";
import { getSessionId } from "../utils/session";
import type { SessionSummary } from "../types/summary";

/**
 * Real-time Firestore hook that listens directly to this session's document.
 * Instant update on creation or change — no refresh required.
 */
export function useSessionSummary() {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = useMemo(() => getSessionId(), []);

  useEffect(() => {
    const docRef = doc(db, "summaries", sessionId);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setSummary(snap.data() as SessionSummary);
        } else {
          setSummary(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("❌ onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  return { summary, loading, sessionId };
}
