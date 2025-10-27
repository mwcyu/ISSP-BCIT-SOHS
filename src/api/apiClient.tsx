import { getSessionId } from "../utils/session";

export async function sendMessageToAI(
  promptType: "standard1" | "standard2" | "standard3" | "standard4" | "freechat",
  userMessage?: string
): Promise<string> {
  // 🔗 replace this with your friend’s webhook URL
  const webhookUrl = "https://ricejoj198.app.n8n.cloud/webhook/e27c918a-091a-4f8e-8052-298205d7d997";
  const sessionId = getSessionId();
  const chatInput = userMessage
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, chatInput }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook error: ${res.status} ${text}`);
  }

  // ✅ n8n should return JSON like: { "reply": "Hello!" }
  const data = await res.json().catch(() => ({}));


  console.log("n8n response:", data);

  return data.output ?? "✅ Message sent to n8n workflow!";
}
