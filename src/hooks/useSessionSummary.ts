// src/hooks/useSessionSummary.ts
import { useEffect, useMemo, useState } from "react";

import { getSessionId } from "../utils/session";
import type { SessionSummary } from "../types/summary";

import { supabase } from "../lib/supabase";

/**
 * Real-time Firestore hook that listens directly to this session's document.
 * Instant update on creation or change — no refresh required.
 */
export function useSessionSummary() {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useMemo(() => getSessionId(), []);

  useEffect(() => {
    let subscription: any;

    async function loadAndSubscribe() {
      try {
        console.log("🔍 Fetching summary for session:", sessionId);

        // 🟡 First: fetch existing data once
        const { data, error } = await supabase
          .from("session_store")
          .select("*")
          .eq("sessionId", sessionId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 just means "no rows found"
          console.error("❌ Error fetching summary:", error);
          setError(error.message || "Failed to fetch summary");
        } else {
          setError(null);
        }

        if (data) {
          console.log("✅ Summary found:", data);
          setSummary(data as SessionSummary);
        } else {
          console.log("ℹ️ No summary found for this session yet");
          setSummary(null);
        }
        setLoading(false);

        // 🟢 Second: subscribe to realtime updates
        console.log("📡 Subscribing to realtime updates...");
        subscription = supabase
          .channel(`summaries-${sessionId}`) // unique channel per session
          .on(
            "postgres_changes",
            {
              event: "*", // can be 'INSERT', 'UPDATE', 'DELETE'
              schema: "public",
              table: "session_store",
              filter: `sessionId=eq.${sessionId}`,
            },
            (payload) => {
              console.log("📡 Supabase realtime update:", payload);
              if (payload.eventType === "DELETE") {
                setSummary(null);
              } else {
                setSummary(payload.new as SessionSummary);
              }
            }
          )
          .subscribe((status) => {
            console.log("📡 Subscription status:", status);
          });
      } catch (err: any) {
        console.error("❌ Error in loadAndSubscribe:", err);
        setError(err.message || "Unknown error");
        setLoading(false);
      }
    }

    loadAndSubscribe();

    return () => {
      if (subscription) {
        console.log("🔌 Unsubscribing from realtime updates");
        supabase.removeChannel(subscription);
      }
    };
  }, [sessionId]);

  return { summary, loading, error, sessionId };
}
