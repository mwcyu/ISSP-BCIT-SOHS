import React from "react";
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

import { useAuth, useConversations, useUI } from "./contexts";
import { useAppInitialization } from "./hooks/useAppInitialization";
import { Standard } from "./types";

export default function App() {
  // Initialize app-wide settings
  useAppInitialization();

  // Access context hooks
  const { role, isAuthenticated, login, logout } = useAuth();
  const {
    currentMessages,
    inputValue,
    setInputValue,
    sendMessage,
    sendStandardPrompt,
    activeConversation,
    clearConversations,
    setActiveConversationId,
  } = useConversations();
  const {
    modals,
    leftSidebarCollapsed,
    currentPage,
    openModal,
    closeModal,
    toggleSidebar,
    setCurrentPage,
  } = useUI();

  // ====== Event Handlers ======
  const handleLogout = () => {
    logout();
    clearConversations();
    setCurrentPage("main");
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    sendMessage(text);
  };

  const handleStandardClick = (standard: Standard) => {
    sendStandardPrompt(standard);
  };

  const handleSidebarAction = (action: () => void) => {
    action();
    if (window.innerWidth < 1024) toggleSidebar();
  };

  const handleHomeClick = () => {
    // Reset to home state - clear active conversation to show welcome screen
    setActiveConversationId(null);
    setInputValue("");
    setCurrentPage("main");
  };

  // ====== Login & Admin Handling ======
  if (!isAuthenticated) {
    return (
      <AccessPage 
        onLoginSuccess={(type) => {
          // Map "user" to "preceptor" for backwards compatibility
          const mappedRole = type === "user" ? "preceptor" : type;
          login(mappedRole);
        }} 
      />
    );
  }

  if (currentPage === "admin" && role === "admin") {
    return <AdminPage onBackClick={() => setCurrentPage("main")} />;
  }

  // ====== Main App UI ======
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - collapsible & overlay on mobile */}
      <PermanentSidebar
        role={role}
        onProgressClick={() => handleSidebarAction(() => openModal("progress"))}
        onGuidelinesClick={() => handleSidebarAction(() => openModal("guidelines"))}
        onPrivacyPolicyClick={() => handleSidebarAction(() => openModal("privacyPolicy"))}
        onSettingsClick={() => handleSidebarAction(() => openModal("settings"))}
        onDocumentPreviewClick={() => handleSidebarAction(() => openModal("documentPreview"))}
        onFAQClick={() => handleSidebarAction(() => openModal("faq"))}
        onHomeClick={() => handleSidebarAction(handleHomeClick)}
        onAdminClick={() => handleSidebarAction(() => setCurrentPage("admin"))}
        onLogoutClick={() => handleSidebarAction(handleLogout)}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Right panel - main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        <RightPanel
          messages={currentMessages}
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
          onToggleSidebar={toggleSidebar}
        />
      </div>

      {/* ====== Modals ====== */}
      <ProgressModal
        isOpen={modals.progress}
        onClose={() => closeModal("progress")}
      />
      <GuidelinesModal 
        isOpen={modals.guidelines} 
        onClose={() => closeModal("guidelines")} 
      />
      <PrivacyPolicyModal 
        isOpen={modals.privacyPolicy} 
        onClose={() => closeModal("privacyPolicy")} 
      />
      <SettingsModal 
        isOpen={modals.settings} 
        onClose={() => closeModal("settings")} 
      />
      <DocumentPreviewModal 
        isOpen={modals.documentPreview} 
        onClose={() => closeModal("documentPreview")} 
      />
      <FAQModal 
        isOpen={modals.faq} 
        onClose={() => closeModal("faq")} 
      />

      <PromptHelperButton currentStandard={activeConversation?.currentStandard ?? 1} />
    </div>
  );
}
