import React, { useState, useEffect } from "react";
import { PermanentSidebar } from "./components/PermanentSidebar";
import { RightPanel } from "./components/RightPanel";
import { ProgressModal } from "./components/ProgressModal";
import { GuidelinesModal } from "./components/GuidelinesModal";
import { PrivacyPolicyModal } from "./components/PrivacyPolicyModal";
import { SettingsModal } from "./components/SettingsModal";
import { DocumentPreviewModal } from "./components/DocumentPreviewModal";
import AccessPage from "./components/access/AccessPage";
import AdminPage from "./components/admin/AdminPage";

import { initializeDefaultCodes } from "./utils/accessStorage";
import { sendMessageToAI } from "./api/apiClient";

const SESSION_KEY = "care8_active_role";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  messages: Message[];
  unread?: boolean;
  currentStandard: number | null; // now optional for standards
}

export default function App() {
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [currentPage, setCurrentPage] = useState<"main" | "admin">("main");

  const [progressOpen, setProgressOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [inputValue, setInputValue] = useState("");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);

  // init secure storage & restore role
  useEffect(() => {
    (async () => {
      await initializeDefaultCodes();
      const savedRole = sessionStorage.getItem(SESSION_KEY);
      if (savedRole === "user" || savedRole === "admin") setRole(savedRole);
    })();
  }, []);

  // utilities
  const getActiveConversation = () =>
    conversations.find((c) => c.id === activeConversationId);
  const getCurrentMessages = () => getActiveConversation()?.messages || [];

  const createNewConversation = (title?: string) => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: title ? title.substring(0, 30) + "..." : "New Conversation",
      preview: title || "Start a conversation...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      messages: [],
      currentStandard: null,
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
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
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
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : c
      )
    );
  };

  const replaceLastBotMessage = (convId: string, text: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].sender === "bot") {
            msgs[i] = { ...msgs[i], content: text, timestamp: new Date() };
            break;
          }
        }
        return {
          ...c,
          messages: msgs,
          preview: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      })
    );
  };

  // 🔥 unified pipeline
  const sendToAI = async (
    promptType:
      | "standard1"
      | "standard2"
      | "standard3"
      | "standard4"
      | "freechat",
    userMessage?: string
  ) => {
    let convId = activeConversationId;
    if (!convId) convId = createNewConversation(userMessage || promptType);

    if (userMessage && userMessage.trim()) addUserMessage(convId, userMessage);

    // temporary “thinking…” message
    addBotMessage(convId, "🤔 Thinking...");

    try {
      const reply = await sendMessageToAI(promptType, userMessage);
      replaceLastBotMessage(convId, reply);
    } catch (err: any) {
      replaceLastBotMessage(
        convId,
        `❌ Error: ${err?.message || "Failed to reach AI."}`
      );
    }
  };

  // called when user presses Enter/send
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    // all manual typing goes through freechat
    sendToAI("freechat", text);
  };

  // fired by your standards UI (4 buttons in RightPanel)
  const handleStandardClick = (promptLabel: string) => {
    // map the label to a standard type deterministically
    const label = (promptLabel || "").toLowerCase();
    let type: "standard1" | "standard2" | "standard3" | "standard4" =
      "standard1";
    if (label.includes("2")) type = "standard2";
    else if (label.includes("3")) type = "standard3";
    else if (label.includes("4")) type = "standard4";
    sendToAI(type);
  };

  // gate by access
  if (!role) {
    return (
      <AccessPage
        onLoginSuccess={(type) => {
          sessionStorage.setItem(SESSION_KEY, type);
          setRole(type);
        }}
      />
    );
  }

  if (currentPage === "admin" && role === "admin") {
    return <AdminPage onBackClick={() => setCurrentPage("main")} />;
  }

  // main app UI
  return (
    <div className="flex h-screen overflow-hidden">
      <PermanentSidebar
        role={role}
        onProgressClick={() => setProgressOpen(true)}
        onGuidelinesClick={() => setGuidelinesOpen(true)}
        onPrivacyPolicyClick={() => setPrivacyPolicyOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onDocumentPreviewClick={() => setDocumentPreviewOpen(true)}
        onHomeClick={() => setCurrentPage("main")}
        onAdminClick={() => setCurrentPage("admin")}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col">
        <RightPanel
          messages={getCurrentMessages()}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onKeyPress={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          onStandardClick={handleStandardClick}
          showMobileControls={true}
          onToggleSidebar={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />
      </div>

      <ProgressModal
        isOpen={progressOpen}
        onClose={() => setProgressOpen(false)}
        completedStandards={[]}
        onToggleStandard={() => {}}
        currentStandard={undefined}
      />
      <GuidelinesModal
        isOpen={guidelinesOpen}
        onClose={() => setGuidelinesOpen(false)}
      />
      <PrivacyPolicyModal
        isOpen={privacyPolicyOpen}
        onClose={() => setPrivacyPolicyOpen(false)}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <DocumentPreviewModal
        isOpen={documentPreviewOpen}
        onClose={() => setDocumentPreviewOpen(false)}
      />
    </div>
  );
}
