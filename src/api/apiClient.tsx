export async function sendMessageToAI(
  promptType: "standard1" | "standard2" | "standard3" | "standard4" | "freechat",
  userMessage?: string
): Promise<string> {
  const res = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ promptType, userMessage }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.reply ?? "";
}
