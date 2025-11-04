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
  const { summary, loading } = useSessionSummary();

  const formatted = useMemo(() => {
    if (!summary) return null;
    const createdAt = summary.created_at
      ? new Date(summary.created_at).toLocaleString()
      : "No timestamp";
    return { ...summary, createdAtText: createdAt };
  }, [summary]);

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
              <div className="h-full flex items-center justify-center text-gray-400">
                Loading summary…
              </div>
            )}

            {!loading && !summary && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>
                  No summary yet. Once the AI (or test process) writes a summary
                  for this session into Supabase, it will appear here.
                </p>
              </div>
            )}

            {!loading && summary && (
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {formatted?.createdAtText}
                  </p>
                  <h3 className="text-xl font-semibold text-[#003E6B]">
                    Feedback Summary Report
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Standard 1", key: "s1_summary" },
                    { label: "Standard 2", key: "s2_summary" },
                    { label: "Standard 3", key: "s3_summary" },
                    { label: "Standard 4", key: "s4_summary" },
                  ].map(({ label, key }) => {
                    const value = (summary as any)[key] as string | undefined;
                    if (!value) return null;
                    return (
                      <div key={key} className="border-t pt-3">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {label}
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
