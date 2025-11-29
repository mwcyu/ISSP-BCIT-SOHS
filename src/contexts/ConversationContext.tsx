import React, { createContext, useContext, useState, ReactNode } from "react";
import { Conversation, Message, StandardType, Standard } from "../types";
import { sendMessageToAI } from "../services/apiClient";

interface ConversationContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | undefined;
  currentMessages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  createNewConversation: (title?: string, standard?: number | null) => string;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (message: string) => Promise<void>;
  sendStandardPrompt: (standard: Standard) => Promise<void>;
  clearConversations: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

interface ConversationProviderProps {
  children: ReactNode;
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversation?.messages || [];

  const createNewConversation = (title?: string, standard: number | null = null): string => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: title ? title.substring(0, 30) + "..." : "New Conversation",
      preview: title || "Start a conversation...",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      messages: [],
      currentStandard: standard,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  const addUserMessage = (convId: string, text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, msg],
              preview: text,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : c
      )
    );
  };

  const addBotMessage = (convId: string, text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "bot",
      timestamp: new Date(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, msg],
              preview: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : c
      )
    );
  };

  const replaceLastBotMessage = (convId: string, text: string) => {
    // Check if the text is double-encoded (escaped) and clean it up
    let cleanText = text;
    
    // If it's a JSON string, parse it
    if (typeof text === 'string' && text.startsWith('"') && text.endsWith('"')) {
      try {
        cleanText = JSON.parse(text);
      } catch (e) {
        console.log('Not JSON encoded, using as-is');
      }
    }
    
    console.log('Bot message before processing:', text);
    console.log('Bot message after processing:', cleanText);
    
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].sender === "bot") {
            msgs[i] = { ...msgs[i], content: cleanText, timestamp: new Date() };
            break;
          }
        }
        return {
          ...c,
          messages: msgs,
          preview: cleanText.substring(0, 50) + (cleanText.length > 50 ? "..." : ""),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      })
    );
  };

  const sendToAI = async (promptType: StandardType, userMessage?: string, standardData?: Standard) => {
    let convId = activeConversationId;
    if (!convId) convId = createNewConversation(userMessage || promptType);
    if (userMessage && userMessage.trim()) addUserMessage(convId, userMessage);
    addBotMessage(convId, "🤔 Thinking...");

    try {
      const reply = await sendMessageToAI(promptType, userMessage, standardData);
      replaceLastBotMessage(convId, reply);
    } catch (err: any) {
      replaceLastBotMessage(convId, `❌ Error: ${err?.message || "Failed to reach AI."}`);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    await sendToAI("", message);
  };

  const sendStandardPrompt = async (standard: Standard) => {
    // Extract standard number from id
    const standardNum = parseInt(standard.id);
    const type: StandardType = `standard${standardNum}` as StandardType;

    let convId = activeConversationId;
    if (!convId) {
      convId = createNewConversation(`${standard.title}`, standardNum);
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, currentStandard: standardNum } : c))
      );
    }

    // Pass the full standard object to the API
    await sendToAI(type, undefined, standard);
  };

  const clearConversations = () => {
    setConversations([]);
    setActiveConversationId(null);
    setInputValue("");
  };

  const value: ConversationContextType = {
    conversations,
    activeConversationId,
    activeConversation,
    currentMessages,
    inputValue,
    setInputValue,
    createNewConversation,
    setActiveConversationId,
    sendMessage,
    sendStandardPrompt,
    clearConversations,
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
}

export function useConversations() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error("useConversations must be used within a ConversationProvider");
  }
  return context;
}
