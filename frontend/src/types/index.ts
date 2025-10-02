// API Types for the Nursing Feedback Chatbot
export interface ChatMessage {
  session_id: string;
  message: string;
  section_id: number;
}

export interface ChatResponse {
  response: string;
  current_section: number;
  is_section_complete: boolean;
  next_action: string;
  feedback_summary?: any;
}

export interface FeedbackSection {
  id: number;
  title: string;
  description: string;
  key_areas: string[];
  sample_questions: string[];
  required_elements: string[];
}

export interface SessionProgress {
  session_id: string;
  current_section: number;
  completed_sections: number[];
  progress_percentage: number;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  section_id?: number;
}
