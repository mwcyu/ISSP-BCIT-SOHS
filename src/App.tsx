import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { RightPanel } from "./features/chat/RightPanel";
import { ProgressModal } from "./components/modals/ProgressModal";
import { GuidelinesModal } from "./components/modals/GuidelinesModal";
import { PrivacyPolicyModal } from "./components/modals/PrivacyPolicyModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { DocumentPreviewModal } from "./components/modals/DocumentPreviewModal";
import { PromptHelperButton } from "./features/chat/components/PromptHelperButton";
import { FAQModal } from "./components/modals/FAQModal";
import AccessPage from "./features/access/AccessPage";
import AdminPage from "./features/admin/AdminPage";

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

  // Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ====== Event Handlers ======
  const handleLogout = () => {
    logout();
    clearConversations();
    setCurrentPage("main");
    setIsMobileSidebarOpen(false);
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
    // Close mobile sidebar on action
    setIsMobileSidebarOpen(false);
  };

  const handleHomeClick = () => {
    // Reset to home state - clear active conversation to show welcome screen
    setActiveConversationId(null);
    setInputValue("");
    setCurrentPage("main");
    setIsMobileSidebarOpen(false);
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - collapsible & overlay on mobile */}
      <Sidebar
        role={role}
        onProgressClick={() => handleSidebarAction(() => openModal("progress"))}
        onPrivacyPolicyClick={() => handleSidebarAction(() => openModal("privacyPolicy"))}
        onDocumentPreviewClick={() => handleSidebarAction(() => openModal("documentPreview"))}
        onFAQClick={() => handleSidebarAction(() => openModal("faq"))}
        onHomeClick={() => handleSidebarAction(handleHomeClick)}
        onAdminClick={() => handleSidebarAction(() => setCurrentPage("admin"))}
        onLogoutClick={() => handleSidebarAction(handleLogout)}
        isCollapsed={leftSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        // Mobile Props
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Right panel - main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        <RightPanel
          messages={currentMessages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onStandardClick={handleStandardClick}
          showMobileControls={true}
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
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
