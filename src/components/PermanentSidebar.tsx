import React from "react";
import {
  Settings,
  FileText,
  Shield,
  BarChart3,
  Eye,
  X,
  Home,
  UserCog, // added icon for admin
} from "lucide-react";
import bcitLogo from "../assets/bcit-logo.png";

interface PermanentSidebarProps {
  role?: "user" | "admin" | null; // NEW
  onProgressClick: () => void;
  onGuidelinesClick: () => void;
  onPrivacyPolicyClick: () => void;
  onSettingsClick: () => void;
  onDocumentPreviewClick: () => void;
  onHomeClick: () => void;
  onAdminClick?: () => void; // NEW
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function PermanentSidebar({
  role,
  onProgressClick,
  onGuidelinesClick,
  onPrivacyPolicyClick,
  onSettingsClick,
  onDocumentPreviewClick,
  onHomeClick,
  onAdminClick,
  isCollapsed,
  onToggleCollapse,
}: PermanentSidebarProps) {
  return (
    <div
      className={`bg-[#003E6B] text-white h-screen flex flex-col transition-all duration-300 relative ${
        isCollapsed ? "w-16" : "w-64 sm:w-64"
      }`}>
      {/* Close button */}
      {!isCollapsed && (
        <button
          onClick={onToggleCollapse}
          className="absolute top-4 right-4 z-10 p-1.5 hover:bg-[#002a4d] rounded-lg transition-colors hidden lg:flex"
          title="Minimize Sidebar">
          <X className="w-5 h-5 text-gray-300" />
        </button>
      )}

      {/* Profile Section */}
      <div className="pt-12 px-6 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`${!isCollapsed ? "bg-[#ffd700]" : ""} p-2 rounded`}>
            <img src={bcitLogo} alt="BCIT Logo" className="h-8 w-auto" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-lg text-gray-300 font-bold">Feedback Helper</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {!isCollapsed && (
            <p className="text-xs text-gray-400 mb-3 px-2">MENU</p>
          )}
          <div className="space-y-1">
            {/* Home */}
            <a href="/">
              <button
                onClick={onHomeClick}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
                } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
                title={isCollapsed ? "Home" : ""}>
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
              title={isCollapsed ? "Progress" : ""}>
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
              title={isCollapsed ? "Document Preview" : ""}>
              <Eye
                className="transition-none flex-shrink-0"
                style={{
                  width: isCollapsed ? "18px" : "16px",
                  height: isCollapsed ? "18px" : "16px",
                }}
              />
              {!isCollapsed && <span>Document Preview</span>}
            </button>

            {/* ✅ Admin Button (only visible if role === "admin") */}
            {role === "admin" && (
              <button
                onClick={onAdminClick}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
                } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
                title={isCollapsed ? "Admin Panel" : ""}>
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
            <button
              onClick={onGuidelinesClick}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
              } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
              title={isCollapsed ? "Guidelines" : ""}>
              <FileText
                className="transition-none flex-shrink-0"
                style={{
                  width: isCollapsed ? "18px" : "16px",
                  height: isCollapsed ? "18px" : "16px",
                }}
              />
              {!isCollapsed && <span>Guidelines</span>}
            </button>

            <button
              onClick={onPrivacyPolicyClick}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center py-2.5" : "gap-3 py-2.5"
              } px-3 rounded-lg text-gray-300 hover:bg-[#002a4d] transition-colors`}
              title={isCollapsed ? "Privacy Policy" : ""}>
              <Shield
                className="transition-none flex-shrink-0"
                style={{
                  width: isCollapsed ? "18px" : "16px",
                  height: isCollapsed ? "18px" : "16px",
                }}
              />
              {!isCollapsed && <span>Privacy Policy</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          <p>Feedback Helper</p>
          <p className="mt-1">Created by Team Care8</p>
        </div>
      )}
    </div>
  );
}
