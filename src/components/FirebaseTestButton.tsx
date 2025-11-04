import React, { useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../api/firebase.js";
import { getSessionId } from "../utils/session";

export default function FirebaseTestButton() {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      // 1️⃣ Get session ID from sessionStorage (or create one)
      const sessionId = getSessionId();
      console.log("🆔 Session ID:", sessionId);

      // 2️⃣ Write test document with the session ID
      await addDoc(collection(db, "testCollection"), {
        key: "test",
        value: "hello",
        sessionId,
        createdAt: serverTimestamp(),
      });
      console.log("✅ Test document written with session ID.");

      // 3️⃣ Read back all docs
      const snapshot = await getDocs(collection(db, "testCollection"));
      const allData = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt
            ? data.createdAt.toDate().toLocaleString()
            : "N/A",
        };
      });

      console.log("📥 Retrieved data from Firestore:", allData);
    } catch (err) {
      console.error("❌ Firestore test error:", err);
    } finally {
      setBusy(false);
    }
  };

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
          backgroundColor: "#003E6B",
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}>
        {busy ? "Working..." : "Send Test to Firebase"}
      </button>
    </div>
  );
}
