import React from "react";
import {
  Shield,
  BarChart3,
  Eye,
  Home,
  UserCog,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  LogOut,
  X,
} from "lucide-react";
import bcitLogo from "../../assets/bcit-logo.png";
import { UserRole } from "../../types";
import { cn } from "../../lib/utils";

interface SidebarProps {
  role?: UserRole | null;
  onProgressClick: () => void;
  onPrivacyPolicyClick: () => void;
  onDocumentPreviewClick: () => void;
  onHomeClick: () => void;
  onFAQClick: () => void;
  onAdminClick?: () => void;
  onLogoutClick?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  // Mobile props
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isCollapsed: boolean;
  isActive?: boolean;
  variant?: "default" | "danger";
}

const SidebarItem = ({
  icon: Icon,
  label,
  onClick,
  isCollapsed,
  isActive = false,
  variant = "default",
}: SidebarItemProps) => {
  // On mobile, we always want full width items if the sidebar is open
  const layoutClasses = isCollapsed
    ? "lg:justify-center lg:h-10 lg:w-10 lg:p-0 lg:mx-auto w-[calc(100%-16px)] px-3 py-2.5 gap-3" // Collapsed on desktop, full on mobile
    : "w-[calc(100%-16px)] px-3 py-2.5 gap-3";

  const variantClasses = variant === "danger"
    ? "text-red-300 hover:bg-red-500/20 hover:text-red-100 border border-transparent hover:border-red-500/30"
    : isActive
      ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20 font-medium"
      : "text-blue-100/70 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-center my-1 mx-2 rounded-xl transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bcit-gold/50",
        layoutClasses,
        variantClasses
      )}
      title={isCollapsed ? label : ""}
    >
      <Icon
        size={20}
        className={cn(
          "transition-transform duration-200 shrink-0",
          isCollapsed ? "lg:group-hover:scale-110" : "",
          isActive ? "text-bcit-gold" : "text-current group-hover:text-blue-50"
        )}
      />

      <span className={cn(
        "text-sm tracking-wide truncate transition-all duration-200",
        isCollapsed ? "lg:hidden" : ""
      )}>
        {label}
      </span>

      {/* Active Indicator for Collapsed State (Desktop only) */}
      {isCollapsed && isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-bcit-gold rounded-r-full hidden lg:block" />
      )}
    </button>
  );
};

const SectionHeader = ({ label, isCollapsed }: { label: string; isCollapsed: boolean }) => {
  return (
    <>
      <div className={cn("h-4 hidden", isCollapsed ? "lg:block" : "")} />
      <p className={cn(
        "px-5 mt-6 mb-2 text-[10px] font-bold text-blue-300/60 uppercase tracking-widest",
        isCollapsed ? "lg:hidden" : ""
      )}>
        {label}
      </p>
    </>
  );
};

export function Sidebar({
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
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  // Close mobile sidebar on resize if screen becomes large
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen, onMobileClose]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed lg:relative flex flex-col h-screen bg-bcit-blue shadow-2xl transition-all duration-300 ease-in-out z-50 border-r border-white/5",
          // Desktop width
          isCollapsed ? "lg:w-[72px]" : "lg:w-72",
          // Mobile width & positioning
          "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Desktop Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-9 z-50 hidden lg:flex items-center justify-center w-6 h-6 bg-bcit-gold text-bcit-dark rounded-full shadow-md hover:scale-110 transition-transform duration-200 border border-white/20"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="absolute right-4 top-4 z-50 lg:hidden text-white/70 hover:text-white"
        >
          <X size={24} />
        </button>

        {/* Header / Logo Area */}
        <div className={cn(
          "flex items-center h-[72px] border-b border-white/5 transition-all duration-300",
          isCollapsed ? "lg:justify-center lg:px-0 px-5 gap-3" : "px-5 gap-3"
        )}>
          <div className="relative shrink-0 w-9 h-9 bg-bcit-gold rounded-lg p-1 shadow-sm overflow-hidden">
            <img src={bcitLogo} alt="BCIT" className="w-full h-full object-contain" />
          </div>

          <div className={cn(
            "flex flex-col overflow-hidden transition-all duration-200",
            isCollapsed ? "lg:hidden" : ""
          )}>
            <h1 className="text-base font-bold text-white whitespace-nowrap leading-none mb-1">Feedback Helper</h1>
            {role && (
              <span className="text-[10px] text-bcit-gold font-medium uppercase tracking-wider leading-none opacity-90">
                {role} Workspace
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
          <SectionHeader label="Menu" isCollapsed={isCollapsed} />

          <SidebarItem
            icon={Home}
            label="Home"
            onClick={onHomeClick}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            icon={BarChart3}
            label="Progress Tracker"
            onClick={onProgressClick}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            icon={Eye}
            label="Document Preview"
            onClick={onDocumentPreviewClick}
            isCollapsed={isCollapsed}
          />

          {role === "admin" && (
            <SidebarItem
              icon={UserCog}
              label="Admin Panel"
              onClick={onAdminClick!}
              isCollapsed={isCollapsed}
              isActive={true}
            />
          )}

          <SectionHeader label="Resources" isCollapsed={isCollapsed} />

          <SidebarItem
            icon={FileQuestion}
            label="FAQ & Help"
            onClick={onFAQClick}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            icon={Shield}
            label="Privacy Policy"
            onClick={onPrivacyPolicyClick}
            isCollapsed={isCollapsed}
          />
        </div>

        {/* Footer / Settings */}
        <div className="p-3 mt-auto bg-bcit-dark/20 border-t border-white/5 backdrop-blur-sm">
          {onLogoutClick && (
            <SidebarItem
              icon={LogOut}
              label="Sign Out"
              onClick={onLogoutClick}
              isCollapsed={isCollapsed}
              variant="danger"
            />
          )}
        </div>
      </aside>
    </>
  );
}
