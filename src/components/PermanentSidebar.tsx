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
  <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {!isCollapsed && <p className="text-xs text-gray-400 mb-3 px-2">MENU</p>}
          <div className="space-y-1">
            {/* Home */}
            <a href="/" onClick={onHomeClick}>
              <button
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
                } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
                title={isCollapsed ? "Home" : ""}
              >
                <Home
                  className="transition-none flex-shrink-0"
                  style={{
                    width: isCollapsed ? "18px" : "16px",
                    height: isCollapsed ? "18px" : "16px",
                  }}
                />
                {!isCollapsed && <span>Home</span>}
              </button>
            </a>

      {/* Progress */}
      <button
        onClick={onProgressClick}
        className={`w-full flex items-center ${
          isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
        } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
        title={isCollapsed ? "Progress" : ""}
      >
        <BarChart3
          className="transition-none flex-shrink-0"
          style={{
            width: isCollapsed ? "18px" : "16px",
            height: isCollapsed ? "18px" : "16px",
          }}
        />
        {!isCollapsed && <span>Progress</span>}
      </button>


            {/* Document Preview */}
            <button
              onClick={onDocumentPreviewClick}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
              } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
              title={isCollapsed ? "Document Preview" : ""}
            >
              <Eye
                className="transition-none flex-shrink-0"
                style={{
                  width: isCollapsed ? "18px" : "16px",
                  height: isCollapsed ? "18px" : "16px",
                }}
              />
              {!isCollapsed && <span>Document Preview</span>}
            </button>

            {/* Admin Button (only visible if role === "admin") */}
            {role === "admin" && (
              <button
                onClick={onAdminClick}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
                } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
                title={isCollapsed ? "Admin Panel" : ""}
              >
                <UserCog
                  className="transition-none flex-shrink-0"
                  style={{
                    width: isCollapsed ? "18px" : "16px",
                    height: isCollapsed ? "18px" : "16px",
                  }}
                />
                {!isCollapsed && <span>Admin Panel</span>}
              </button>
            )}
          </div>
        </div>

        {/* Support Section */}
        <div className="p-4 border-t border-gray-700">
          {!isCollapsed && (
            <p className="text-xs text-gray-400 mb-3 px-2">SUPPORT</p>
          )}
          <div className="space-y-1">

            {/* Privacy Policy */}
            <button
              onClick={onPrivacyPolicyClick}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
              } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
              title={isCollapsed ? "Privacy Policy" : ""}
            >
              <Shield
                className="transition-none flex-shrink-0"
                style={{
                  width: isCollapsed ? "18px" : "16px",
                  height: isCollapsed ? "18px" : "16px",
                }}
              />
              {!isCollapsed && <span>Privacy Policy</span>}
            </button>

            {/* FAQ */}
            <button
              onClick={onFAQClick}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
              } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
              title={isCollapsed ? "FAQ" : ""}
            >
              <FileQuestion
                className="transition-none flex-shrink-0"
                style={{
                  width: isCollapsed ? "18px" : "16px",
                  height: isCollapsed ? "18px" : "16px",
                }}
              />
              {!isCollapsed && <span>FAQ</span>}
            </button>

            
          </div>
        </div>
      </div>

      {/* ✅ Logout Section (always visible at bottom) */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogoutClick}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
          } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
          title={isCollapsed ? "Logout" : ""}>
          <LogOut
            className="transition-none flex-shrink-0"
            style={{
              width: isCollapsed ? "18px" : "16px",
              height: isCollapsed ? "18px" : "16px",
            }}
          />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
