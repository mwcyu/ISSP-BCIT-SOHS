import axios from "axios";
import {
  ChatMessage,
  ChatResponse,
  FeedbackSection,
  SessionProgress,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export class ChatbotService {
  static async sendMessage(message: ChatMessage): Promise<ChatResponse> {
    const response = await api.post("/api/chat", message);
    return response.data;
  }

  static async getFeedbackSections(): Promise<FeedbackSection[]> {
    const response = await api.get("/api/sections");
    return response.data;
  }

  static async getSessionProgress(sessionId: string): Promise<SessionProgress> {
    const response = await api.get(`/api/session/${sessionId}/progress`);
    return response.data;
  }

  static async generateSummary(sessionId: string): Promise<any> {
    const response = await api.post("/api/summary", { session_id: sessionId });
    return response.data;
  }

  static async resetSession(sessionId: string): Promise<void> {
    await api.delete(`/api/session/${sessionId}`);
  }

  // Generate a unique session ID
  static generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
