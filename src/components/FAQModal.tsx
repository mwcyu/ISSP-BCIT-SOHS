import React from 'react';
import { X } from 'lucide-react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FAQModal({ isOpen, onClose }: FAQModalProps) {
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
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#003E6B]">Frequently Asked Questions</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content Area*/}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="h-full flex items-center justify-center rounded-lg border-1 border border-gray-300 p-4 shadow-xl">
            <div className="p-3 space-y-6 text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
              <div>
              <h3 className="font-semibold">My progress bar isn’t updating, what should I do?</h3>
              <p className="text-sm">
              Make sure each section of is finaliazed and saved with the bot. The progress bar updates only after you are 100% done with a standard.
              </p>
              </div>

              <div>
              <h3 className="font-semibold">The AI responses aren’t loading.</h3>
              <p className="text-sm">
              Make sure you have a stable internet connection. If the "Thinking" text doesn’t go away, refresh the page — the AI may have timed out and needs a new request.
              </p>
              </div>

              <div>
              <h3 className="font-semibold">What is the question mark button in the corner?</h3>
              <p className="text-sm">
              The question mark button provides helpful prompts to guide you if you’re unsure what feedback to write. 
              It offers suggestions for all 4 standards.
              </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}