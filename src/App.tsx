import React, { useState, useEffect } from "react";
import { PermanentSidebar } from "./components/PermanentSidebar";
import { RightPanel } from "./components/RightPanel";
import { ProgressModal } from "./components/ProgressModal";
import { GuidelinesModal } from "./components/GuidelinesModal";
import { PrivacyPolicyModal } from "./components/PrivacyPolicyModal";
import { SettingsModal } from "./components/SettingsModal";
import { DocumentPreviewModal } from "./components/DocumentPreviewModal";
import { PromptHelperButton } from "./components/PromptHelperButton";
import { FAQModal } from "./components/FAQModal";
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
  currentStandard: number | null;
}

export default function App() {
  const [role, setRole] = useState<"preceptor" | "admin" | null>(null);
  const [currentPage, setCurrentPage] = useState<"main" | "admin">("main");

  const [progressOpen, setProgressOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);

  const [faqOpen, setFaqOpen] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [inputValue, setInputValue] = useState("");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);

  // ✅ Initialize secure storage & restore saved role
  useEffect(() => {
    (async () => {
      await initializeDefaultCodes();
      const savedRole = sessionStorage.getItem(SESSION_KEY);
      if (savedRole === "preceptor" || savedRole === "admin") setRole(savedRole);
    })();
  }, []);

  // ✅ Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem("care8_active_role"); // remove login session
    setRole(null);
    setCurrentPage("main");
    setConversations([]); // 🔥 clear all chat history
    setActiveConversationId(null);
    setInputValue("");
  };

  // ====== Utility Functions ======
  const getActiveConversation = () =>
    conversations.find((c) => c.id === activeConversationId);
  const getCurrentMessages = () => getActiveConversation()?.messages || [];

  const createNewConversation = (title?: string, standard: number | null = null) => {
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

  // ====== Unified AI message pipeline ======
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

  // ====== Handle message send ======
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    sendToAI("freechat", text);
  };

  // ====== Handle standard buttons ======
  const handleStandardClick = (promptLabel: string) => {
    const label = (promptLabel || "").toLowerCase();
    let type: "standard1" | "standard2" | "standard3" | "standard4" = "standard1";
    let standardNum = 1;
    if (label.includes("2")) { type = "standard2"; standardNum = 2; }
    else if (label.includes("3")) { type = "standard3"; standardNum = 3; }
    else if (label.includes("4")) { type = "standard4"; standardNum = 4; }
  
    // Create conversation with standard number
    let convId = activeConversationId;
    if (!convId) {
      convId = createNewConversation(`Standard ${standardNum}`, standardNum);
    } else {
      // Or update existing conversation's standard
      setConversations(prev =>
        prev.map(c =>
          c.id === convId ? { ...c, currentStandard: standardNum } : c
        )
      );
    }
  
    sendToAI(type);
  };

  // ====== Login Gate ======
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

  // ====== Admin Panel ======
  if (currentPage === "admin" && role === "admin") {
    return <AdminPage onBackClick={() => setCurrentPage("main")} />;
  }

  // ====== Main App UI ======
  return (
    <div className="flex h-screen overflow-hidden">
      <PermanentSidebar
        role={role}
        onProgressClick={() => setProgressOpen(true)}
        onGuidelinesClick={() => setGuidelinesOpen(true)}
        onPrivacyPolicyClick={() => setPrivacyPolicyOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onDocumentPreviewClick={() => setDocumentPreviewOpen(true)}
        onFAQClick={() => setFaqOpen(true)}      // 👈 Add this line
        onHomeClick={() => setCurrentPage("main")}
        onAdminClick={() => setCurrentPage("admin")}
        onLogoutClick={handleLogout} // ✅ ADDED
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
      />
  
    <div className="flex-1 flex flex-col min-w-0">
      {/* 👇 Add this wrapper with responsive text scaling */}
      <div className="h-full overflow-hidden sm:text-base text-sm">
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
    </div>


      {/* ====== Modals ====== */}
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
      <FAQModal isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
      {/* <PromptHelperButton currentStandard={getActiveConversation()?.currentStandard} /> */}
      <PromptHelperButton currentStandard={1} />
    </div>
  );
}
