import React from 'react';
import { X } from 'lucide-react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuidelinesModal({ isOpen, onClose }: GuidelinesModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-bcit-blue">Guidelines</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="text-center">
                <p className="text-gray-700 mb-6">
                  For information about the BCCNM Professional Standards for Registered Nurses, please visit:
                </p>
                <a
                  href="https://www.bccnm.ca/RN/ProfessionalStandards/Pages/default.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-bcit-blue text-white rounded-lg hover:bg-bcit-dark transition-colors"
                >
                  <span>Visit BCCNM Professional Standards</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                {/* <p className="text-sm text-gray-500 mt-6">
                  This link will open in a new tab
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}