// src/components/SessionSummaryWriterTestButton.tsx
import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../api/firebase.js";
import { getSessionId } from "../utils/session";

/**
 * Manual test button: writes a summary document for the current session.
 * Uses the sessionId as the Firestore document ID for instant real-time updates.
 */
export default function SessionSummaryWriterTestButton() {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const sessionId = getSessionId();

      const fakeData = {
        sessionId,
        timestamp: serverTimestamp(),
        "Standard 1":
          "Demonstrated effective communication during clinical practice.",
        "Standard 2": "Showed excellent teamwork and collaboration with peers.",
        "Standard 3":
          "Applied evidence-based practice in patient care scenarios.",
        "Standard 4":
          "Displayed professional ethics and reflective learning behavior.",
      };

      // ✅ use setDoc so the document ID = sessionId (no auto ID)
      await setDoc(doc(db, "summaries", sessionId), fakeData, { merge: true });

      console.log("✅ Wrote/updated summary document:", fakeData);
    } catch (e) {
      console.error("❌ Firestore write failed:", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 999999,
      }}>
      <button
        onClick={handleClick}
        disabled={busy}
        style={{
          backgroundColor: "#0f766e",
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}>
        {busy ? "Writing…" : "Add Demo Summary"}
      </button>
    </div>
  );
}
