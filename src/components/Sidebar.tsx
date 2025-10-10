import React from "react";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onGuidelinesClick: () => void;
  onPrivacyPolicyClick: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onGuidelinesClick,
  onPrivacyPolicyClick,
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-[#003E6B] text-white z-50 transform transition-transform duration-300">
        <div className="p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>

          <div className="mt-12 space-y-2">
            <div
              onClick={() => {
                onGuidelinesClick();
                onClose();
              }}
              className="py-3 px-4 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-[#ffd700] font-bold text-lg">
              Guidelines
            </div>
            <div
              onClick={() => {
                onPrivacyPolicyClick();
                onClose();
              }}
              className="py-3 px-4 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-[#ffd700] font-bold text-lg">
              Privacy Policy
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
