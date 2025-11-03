import { getSessionId } from "../utils/session";

import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

import { supabase } from "./supabase";

export async function sendMessageToAI(
  promptType:
    | "standard1"
    | "standard2"
    | "standard3"
    | "standard4"
    | "freechat",
  userMessage?: string
): Promise<string> {
  // 🔗 replace this with your friend’s webhook URL
  const webhookUrl =
    "https://jecen38796.app.n8n.cloud/webhook/779e9345-5b4b-4003-acc9-1fb32371c74f";
  const sessionId = getSessionId();
  const chatInput = userMessage;
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, promptType, chatInput }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook error: ${res.status} ${text}`);
  }

  // ✅ n8n should return JSON like: { "reply": "Hello!" }
  const data = await res.json().catch(() => ({}));

  console.log("n8n response:", data);

  // if (!data.update === true) {
  //   try {
  //     const sessionRef = doc(db, "session_feedback", "test_session_id");
  //     const sessionSnap = await getDoc(sessionRef);

  //     if (sessionSnap.exists()) {
  //       const latestSessionData = sessionSnap.data();
  //       console.log("💾 Session data fetched and stored:", latestSessionData);
  //     } else {
  //       console.log("⚠️ No session found in Firestore for this sessionId");
  //       const latestSessionData = null;
  //     }
  //   } catch (err) {
  //     console.error("❌ Error fetching session from Firestore:", err);
  //     const latestSessionData = null;
  //   }
  // }

  const reply = data.output ?? "✅ Message sent to n8n workflow!";

  return reply;
}

async function testSupabase() {
  const { data, error } = await supabase
      .from("session_store")
      .select("*")
      .eq("sessionId", 'testing31')
      .single();


  if (error) {
    console.error("❌ Supabase error:", error);
  } else {
    console.log("✅ Connected to Supabase! Sample data:", data);
  }
}

testSupabase();