import React, { createContext, useContext, useState, ReactNode } from "react";
import { ModalState } from "../types";

interface UIContextType {
  modals: ModalState;
  leftSidebarCollapsed: boolean;
  currentPage: "main" | "admin";
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  toggleSidebar: () => void;
  setCurrentPage: (page: "main" | "admin") => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  const [modals, setModals] = useState<ModalState>({
    progress: false,
    guidelines: false,
    privacyPolicy: false,
    settings: false,
    documentPreview: false,
    faq: false,
  });

  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(true);
  const [currentPage, setCurrentPage] = useState<"main" | "admin">("main");

  const openModal = (modal: keyof ModalState) => {
    setModals((prev) => ({ ...prev, [modal]: true }));
    // Auto-collapse sidebar on mobile when opening modal
    if (window.innerWidth < 1024) {
      setLeftSidebarCollapsed(true);
    }
  };

  const closeModal = (modal: keyof ModalState) => {
    setModals((prev) => ({ ...prev, [modal]: false }));
  };

  const toggleSidebar = () => {
    setLeftSidebarCollapsed((prev) => !prev);
  };

  const value: UIContextType = {
    modals,
    leftSidebarCollapsed,
    currentPage,
    openModal,
    closeModal,
    toggleSidebar,
    setCurrentPage,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
