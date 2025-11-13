// Core type definitions for the application

export type UserRole = "preceptor" | "admin" | "user";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  messages: Message[];
  unread?: boolean;
  currentStandard: number | null;
}

export type StandardType =
  | "standard1"
  | "standard2"
  | "standard3"
  | "standard4"
  | "";

export interface Standard {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
}

export interface ModalState {
  progress: boolean;
  guidelines: boolean;
  privacyPolicy: boolean;
  settings: boolean;
  documentPreview: boolean;
  faq: boolean;
}
