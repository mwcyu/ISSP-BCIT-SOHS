// server/chatHandler.js
// =============================================================
// This file handles how your backend responds to chat requests.
// Later, this is where you’ll plug in your actual AI model call.
// For now, it provides clear, unique responses for each Standard.
// =============================================================

export async function getAIResponse({ promptType, userMessage }) {
  // Define prefixes for clarity when displaying in chat
  const prefixByType = {
    standard1: "🟩 Standard 1",
    standard2: "🟦 Standard 2",
    standard3: "🟨 Standard 3",
    standard4: "🟥 Standard 4",
    freechat: "💬 Free Chat",
  };

  const prefix = prefixByType[promptType] || "❓ Unknown Mode";

  // If the user typed something, echo it back (for testing)
  if (userMessage && userMessage.trim()) {
    return `${prefix} → You said: “${userMessage.trim()}”`;
  }

  // Otherwise (no user input), return a unique starter message for each Standard
  switch (promptType) {
    case "standard1":
      return `${prefix} → Let’s discuss *Professionalism and Responsibility*.`;
    case "standard2":
      return `${prefix} → Let’s focus on *Communication and Collaboration*.`;
    case "standard3":
      return `${prefix} → Exploring *Critical Thinking and Judgment*.`;
    case "standard4":
      return `${prefix} → Evaluating *Leadership and Accountability*.`;
    case "freechat":
      return `${prefix} → Ask me anything or share your feedback freely.`;
    default:
      return `${prefix} → I’m not sure which standard you mean. Try again.`;
  }
}
