import React, { useMemo } from "react";
import { X } from "lucide-react";
import { useSessionSummary } from "../hooks/useSessionSummary";
import { exportSessionSummaryToPdf } from "../utils/exportToPdf";
import type { SessionSummary } from "../types/summary";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * DocumentPreviewModal
 * Uses the Supabase-backed useSessionSummary hook to show the
 * current session's summary and provide a PDF download.
 */
export function DocumentPreviewModal({
  isOpen,
  onClose,
}: DocumentPreviewModalProps) {
  const { summary, loading, error, sessionId } = useSessionSummary();

  const formatted = useMemo(() => {
    if (!summary) return null;
    const createdAt = summary.created_at
      ? new Date(summary.created_at).toLocaleString()
      : "No timestamp";
    return { ...summary, createdAtText: createdAt };
  }, [summary]);

  // Debug logging
  React.useEffect(() => {
    if (isOpen) {
      console.log('📄 Document Preview opened');
      console.log('Session ID:', sessionId);
      console.log('Loading:', loading);
      console.log('Summary:', summary);
    }
  }, [isOpen, sessionId, loading, summary]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#003E6B]">
              Document Preview
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  exportSessionSummaryToPdf(summary as SessionSummary)
                }
                disabled={!summary}
                className="px-4 py-2 bg-[#003E6B] text-white text-sm rounded-lg hover:bg-[#004c8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003E6B] mb-4"></div>
                <p>Loading summary…</p>
              </div>
            )}

            {!loading && error && (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                  <h3 className="text-red-800 font-semibold mb-2">Connection Error</h3>
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  <p className="text-gray-600 text-xs">
                    Please check your Supabase configuration and ensure the database is accessible.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && !summary && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className="text-center max-w-md">
                  <p className="text-lg mb-2">No summary available yet</p>
                  <p className="text-sm">
                    Once the AI generates a feedback summary for this session,
                    it will appear here automatically.
                  </p>
                  <p className="text-xs text-gray-400 mt-4">
                    Session ID: {sessionId}
                  </p>
                </div>
              </div>
            )}

            {!loading && summary && (
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">
                    {formatted?.createdAtText}
                  </p>
                  <h3 className="text-2xl font-bold text-[#003E6B] mb-2">
                    Feedback Summary Report
                  </h3>
                  <p className="text-xs text-gray-400">
                    Session ID: {sessionId}
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { 
                      label: "Standard 1: Professional Responsibility and Accountability", 
                      key: "s1_summary" 
                    },
                    { 
                      label: "Standard 2: Knowledge-Based Practice", 
                      key: "s2_summary" 
                    },
                    { 
                      label: "Standard 3: Client-Focused Provision of Service", 
                      key: "s3_summary" 
                    },
                    { 
                      label: "Standard 4: Ethical Practice", 
                      key: "s4_summary" 
                    },
                  ].map(({ label, key }) => {
                    const value = (summary as any)[key] as string | undefined;
                    if (!value || value.trim() === '') return null;
                    return (
                      <div key={key} className="border-[#003E6B] pl-4 py-2">
                        <h4 className="font-bold text-[#003E6B] mb-2 text-lg">
                          {label}
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {value}
                        </p>
                      </div>
                    );
                  })}
                  
                  {/* Show message if no standards have summaries */}
                  {!summary.s1_summary && 
                   !summary.s2_summary && 
                   !summary.s3_summary && 
                   !summary.s4_summary && (
                    <div className="text-center text-gray-400 py-8">
                      <p>No standard summaries generated yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
