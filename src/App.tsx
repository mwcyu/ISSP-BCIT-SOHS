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

import {
  standardPrompts,
  generateTransitionFeedback,
  generateFinalFeedback,
} from "./utils/chatResponses";

import { initializeDefaultCodes } from "./utils/accessStorage";

const SESSION_KEY = "care8_active_role"; // <— stores current role until tab closed

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
  currentStandard: number;
}

export default function App() {
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [currentPage, setCurrentPage] = useState<"main" | "admin">("main");

  const [progressOpen, setProgressOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [completedStandards, setCompletedStandards] = useState<number[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [inputValue, setInputValue] = useState("");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);

  // ✅ Initialize secure storage & restore role from sessionStorage
  useEffect(() => {
    (async () => {
      await initializeDefaultCodes();
      console.log("✅ Secure storage initialized or already exists");

      const savedRole = sessionStorage.getItem(SESSION_KEY);
      if (savedRole === "user" || savedRole === "admin") {
        setRole(savedRole);
      }
    })();
  }, []);

  // ✅ Helper: Toggle standard completion
  const toggleStandard = (standardIndex: number) => {
    setCompletedStandards((prev) =>
      prev.includes(standardIndex)
        ? prev.filter((i) => i !== standardIndex)
        : [...prev, standardIndex]
    );
  };

  // ✅ Conversation utilities
  const getActiveConversation = () =>
    conversations.find((c) => c.id === activeConversationId);
  const getCurrentMessages = () => getActiveConversation()?.messages || [];

  const createNewConversation = (firstMessage?: string) => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: firstMessage
        ? firstMessage.substring(0, 30) + "..."
        : "New Conversation",
      preview: firstMessage || "Start a conversation...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      messages: [],
      currentStandard: 1,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  // ✅ Chat handling
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    let convId = activeConversationId;

    if (!convId) convId = createNewConversation(inputValue);

    const currentConv = conversations.find((c) => c.id === convId);
    if (!currentConv) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              preview: inputValue,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : conv
      )
    );
    setInputValue("");

    const currentConvState = {
      standard: currentConv.currentStandard,
      messageCount: currentConv.messages.length,
    };

    setTimeout(() => {
      if (currentConvState.messageCount > 0) {
        if (currentConvState.standard < 4) {
          const feedbackMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: generateTransitionFeedback(currentConvState.standard),
            sender: "bot",
            timestamp: new Date(),
          };

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === convId
                ? {
                    ...conv,
                    messages: [...conv.messages, feedbackMessage],
                    preview: feedbackMessage.content.substring(0, 50) + "...",
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  }
                : conv
            )
          );

          setTimeout(() => {
            const newStandard = currentConvState.standard + 1;
            const nextStandardMessage: Message = {
              id: (Date.now() + 2).toString(),
              content:
                standardPrompts[newStandard as keyof typeof standardPrompts],
              sender: "bot",
              timestamp: new Date(),
            };

            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === convId
                  ? {
                      ...conv,
                      messages: [...conv.messages, nextStandardMessage],
                      preview:
                        nextStandardMessage.content.substring(0, 50) + "...",
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      currentStandard: newStandard,
                    }
                  : conv
              )
            );

            const standardIndex = currentConvState.standard - 1;
            if (!completedStandards.includes(standardIndex)) {
              setCompletedStandards((prev) => [...prev, standardIndex]);
            }
          }, 1500);
        } else {
          const finalMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: generateFinalFeedback(),
            sender: "bot",
            timestamp: new Date(),
          };

          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === convId
                ? {
                    ...conv,
                    messages: [...conv.messages, finalMessage],
                    preview: finalMessage.content.substring(0, 50) + "...",
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  }
                : conv
            )
          );

          const standardIndex = 3;
          if (!completedStandards.includes(standardIndex)) {
            setCompletedStandards((prev) => [...prev, standardIndex]);
          }
        }
      } else {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: standardPrompts[1],
          sender: "bot",
          timestamp: new Date(),
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === convId
              ? {
                  ...conv,
                  messages: [...conv.messages, botResponse],
                  preview: botResponse.content.substring(0, 50) + "...",
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  currentStandard: 1,
                }
              : conv
          )
        );
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStandardClick = (prompt: string) => {
    let convId = activeConversationId;
    if (!convId) convId = createNewConversation("Start feedback session");
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now().toString(),
        content: standardPrompts[1],
        sender: "bot",
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === convId
            ? {
                ...conv,
                messages: [...conv.messages, botResponse],
                preview: "Standard 1: Professionalism & Responsibility",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                currentStandard: 1,
              }
            : conv
        )
      );
    }, 100);
  };

  // ✅ show login screen if not logged in yet
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

  // ✅ show admin page if selected
  if (currentPage === "admin" && role === "admin") {
    return <AdminPage onBackClick={() => setCurrentPage("main")} />;
  }

  // ✅ main app
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
          onKeyPress={handleKeyPress}
          onStandardClick={handleStandardClick}
          showMobileControls={true}
          onToggleSidebar={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />
      </div>

      <ProgressModal
        isOpen={progressOpen}
        onClose={() => setProgressOpen(false)}
        completedStandards={completedStandards}
        onToggleStandard={toggleStandard}
        currentStandard={getActiveConversation()?.currentStandard}
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
