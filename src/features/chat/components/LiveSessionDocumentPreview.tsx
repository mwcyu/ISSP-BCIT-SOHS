// src/components/LiveSessionDocumentPreview.tsx
import React, { useMemo, useState } from "react";
import { useSessionSummary } from "../../../hooks/useSessionSummary";
import { exportSessionSummaryToPdf } from "../../../utils/exportToPdf";

/**
 * Shows a floating "Document Preview" button and modal with the live summary document.
 * Automatically re-renders when Firestore data updates.
 */
export default function LiveSessionDocumentPreview() {
  const { summary, loading } = useSessionSummary();
  const [open, setOpen] = useState(false);

  const formatted = useMemo(() => {
    if (!summary) return null;
    const ts =
      summary.timestamp?.toDate?.().toLocaleString?.() ?? "No timestamp";
    return { ...summary, timestampText: ts };
  }, [summary]);

  return (
    <>
      {/* Floating button */}

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-[1000000] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[min(900px,95vw)] max-h-[90vh] overflow-auto bg-white rounded-xl shadow-2xl p-6"
          >
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => summary && exportSessionSummaryToPdf(summary)}
                className="bg-bcit-blue text-white px-4 py-2.5 rounded-lg border-none cursor-pointer text-sm hover:bg-bcit-dark transition-colors"
              >
                Download PDF
              </button>
              <button
                onClick={() => setOpen(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg border-none cursor-pointer text-sm hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>

            <h2 className="text-2xl font-bold text-bcit-blue mb-4 border-b pb-2">
              Live Session Document
            </h2>

            {loading && <p className="text-gray-500 italic">Loading live data...</p>}

            {!loading && !summary && (
              <p className="text-gray-500">
                No session data found. Start chatting to generate a document.
              </p>
            )}

            {formatted && (
              <div className="font-mono text-sm bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-wrap">
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <strong>Session ID:</strong> {formatted.sessionId}
                  <br />
                  <strong>Date:</strong> {formatted.timestampText}
                </div>

                <h3 className="text-lg font-bold mt-4 mb-2 text-bcit-blue">
                  Summary
                </h3>
                <p className="mb-4 leading-relaxed">{formatted.summary}</p>

                <h3 className="text-lg font-bold mt-4 mb-2 text-bcit-blue">
                  Key Points
                </h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  {formatted.keyPoints?.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>

                <h3 className="text-lg font-bold mt-4 mb-2 text-bcit-blue">
                  Action Items
                </h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  {formatted.actionItems?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
