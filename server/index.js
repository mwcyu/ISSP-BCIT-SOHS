import express from "express";
import cors from "cors";
import { getAIResponse } from "./chatHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Unified chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { promptType, userMessage } = req.body || {};
    if (!promptType) {
      return res.status(400).json({ error: "Missing promptType" });
    }
    const reply = await getAIResponse({ promptType, userMessage });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Chat API running on http://localhost:${PORT}`);
});
