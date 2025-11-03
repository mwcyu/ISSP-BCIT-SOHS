// src/hooks/useSessionSummary.ts
import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../api/firebase.js";

import { getSessionId } from "../utils/session";
import type { SessionSummary } from "../types/summary";

import { supabase } from "../api/supabase";

/**
 * Real-time Firestore hook that listens directly to this session's document.
 * Instant update on creation or change — no refresh required.
 */
export function useSessionSummary() {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  // const sessionId = useMemo(() => getSessionId(), []);
  const sessionId = "testing31"

useEffect(() => {
    let subscription: any;

    async function loadAndSubscribe() {
      // 🟡 First: fetch existing data once
      const { data, error } = await supabase
        .from("session_store")
        .select("*")
        .eq("sessionId", sessionId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 just means "no rows found"
        console.error("❌ Error fetching summary:", error);
      }

      if (data) {
        setSummary(data as SessionSummary);
      } else {
        setSummary(null);
      }
      setLoading(false);

      // 🟢 Second: subscribe to realtime updates
      subscription = supabase
        .channel("summaries-changes") // channel name can be anything
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
        .subscribe();
    }

    loadAndSubscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [sessionId]);

  return { summary, loading, sessionId };
}