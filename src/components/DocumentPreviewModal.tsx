import React, { useMemo } from "react";
import { X } from "lucide-react";
import { useSessionSummary } from "../hooks/useSessionSummary";
import { exportSessionSummaryToPdf } from "../utils/exportToPdf";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * DocumentPreviewModal
 * Integrates the live Firestore document preview + PDF export
 * inside your styled modal component.
 */
export function DocumentPreviewModal({
  isOpen,
  onClose,
}: DocumentPreviewModalProps) {
  const { summary, loading } = useSessionSummary();

  const formatted = useMemo(() => {
    if (!summary) return null;
    const ts =
      summary.timestamp?.toDate?.().toLocaleString?.() ?? "No timestamp";
    return { ...summary, timestampText: ts };
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
              {/* Download PDF button */}
              <button
                onClick={() => summary && exportSessionSummaryToPdf(summary)}
                className="px-4 py-2 bg-[#003E6B] text-white text-sm rounded-lg hover:bg-[#004c8a] transition-colors">
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
                  No summary yet. Once the AI (or test button) writes to
                  Firestore, the document preview will appear here.
                </p>
              </div>
            )}

            {summary && (
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {formatted?.timestampText}
                  </p>
                  <h3 className="text-xl font-semibold text-[#003E6B]">
                    Feedback Summary Report
                  </h3>
                </div>

                <div className="space-y-4">
                  {["Standard 1", "Standard 2", "Standard 3", "Standard 4"].map(
                    (std, i) =>
                      summary[std as keyof typeof summary] && (
                        <div key={i} className="border-t pt-3">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {std}
                          </h4>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {summary[std as keyof typeof summary] as string}
                          </p>
                        </div>
                      )
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
