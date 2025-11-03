import React from "react";
import {
  Settings,
  FileText,
  Shield,
  BarChart3,
  Eye,
  Home,
  UserCog,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  LogOut, // ✅ NEW icon
} from "lucide-react";
import bcitLogo from "../assets/bcit-logo.png";

interface PermanentSidebarProps {
  role?: "preceptor" | "admin" | null;
  onProgressClick: () => void;
  onGuidelinesClick: () => void;
  onPrivacyPolicyClick: () => void;
  onSettingsClick: () => void;
  onDocumentPreviewClick: () => void;
  onHomeClick: () => void;
  onFAQClick: () => void;
  onAdminClick?: () => void;
  onLogoutClick?: () => void; // ✅ NEW
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function PermanentSidebar({
  role,
  onProgressClick,
  onPrivacyPolicyClick,
  onDocumentPreviewClick,
  onHomeClick,
  onFAQClick,
  onAdminClick,
  onLogoutClick,
  isCollapsed,
  onToggleCollapse,
}: PermanentSidebarProps) {
  return (
    <div
  className={`sidebar-container bg-[#003E6B] text-white h-screen flex flex-col relative ${
    isCollapsed ? "collapsed" : "expanded"
  }`}
>
  {/* Toggle button */}
  <button
    onClick={onToggleCollapse}
    className="toggle-button absolute top-4 right-4 p-1.5 rounded-full bg-black/50 flex items-center justify-center"
    title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
  >
    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
  </button>

  {/* Profile Section */}
  <div className="profile-section pt-12 px-4 pb-6 border-b border-gray-700">
    <div
      className={`flex items-center sm:items-start ${
        !isCollapsed ? "flex-col sm:flex-row sm:gap-3" : "justify-center"
      }`}
    >
      {!isCollapsed && (
        <div className="bg-[#ffd700] p-2 rounded">
          <img src={bcitLogo} alt="BCIT Logo" className="h-10 w-auto mx-auto sm:mx-0" />
        </div>
      )}
      {!isCollapsed && (
        <div className="mt-3 sm:mt-0 text-center sm:text-left">
          <p className="text-lg text-gray-300 font-bold">Feedback Helper</p>
          {role && <p className="text-xs text-gray-400 capitalize">{role} mode</p>}
        </div>
      )}
    </div>
  </div>

  {/* Menu Section */}
  <div className="menu-section flex-1 overflow-y-auto">
    <div className="p-4">
      {!isCollapsed && <p className="text-xs text-gray-400 mb-3 px-2">MENU</p>}

      <div className="space-y-1">
        <button className="sidebar-button home-button" onClick={onHomeClick} title="Home">
          <Home className="icon" />
          <span className="label">Home</span>
        </button>

        <button className="sidebar-button progress-button" onClick={onProgressClick} title="Progress">
          <BarChart3 className="icon" />
          <span className="label">Progress</span>
        </button>

        <button className="sidebar-button document-button" onClick={onDocumentPreviewClick} title="Document Preview">
          <Eye className="icon" />
          <span className="label">Document Preview</span>
        </button>

        {role === "admin" && (
          <button className="sidebar-button admin-button" onClick={onAdminClick} title="Admin Panel">
            <UserCog className="icon" />
            <span className="label">Admin Panel</span>
          </button>
        )}
      </div>
    </div>

    {/* Support Section */}
    <div className="p-4 border-t border-gray-700">
      {!isCollapsed && <p className="text-xs text-gray-400 mb-3 px-2">SUPPORT</p>}
      <div className="space-y-1">
        <button className="sidebar-button privacy-button" onClick={onPrivacyPolicyClick} title="Privacy Policy">
          <Shield className="icon" />
          <span className="label">Privacy Policy</span>
        </button>
        <button className="sidebar-button faq-button" onClick={onFAQClick} title="FAQ">
          <FileQuestion className="icon" />
          <span className="label">FAQ</span>
        </button>
      </div>
    </div>
  </div>

  {/* Logout */}
  <div className="p-4 border-t border-gray-700">
    <button className="sidebar-button logout-button" onClick={onLogoutClick} title="Logout">
      <LogOut className="icon" />
      <span className="label">Logout</span>
    </button>
  </div>
</div>

  );
}
