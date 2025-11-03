// src/components/LiveSessionDocumentPreview.tsx
import React, { useMemo, useState } from "react";
import { useSessionSummary } from "../hooks/useSessionSummary";
import { exportSessionSummaryToPdf } from "../utils/exportToPdf";

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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(900px, 95vw)",
              maxHeight: "90vh",
              overflow: "auto",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              padding: 24,
            }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => summary && exportSessionSummaryToPdf(summary)}
                style={{
                  backgroundColor: "#003E6B",
                  color: "white",
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}>
                Download PDF
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  backgroundColor: "#e5e7eb",
                  color: "#111827",
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}>
                Close
              </button>
            </div>

            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              Feedback Summary Report
            </h1>
            <div style={{ color: "#6b7280", marginBottom: 16 }}>
              {formatted?.timestampText}
            </div>
            <hr style={{ marginBottom: 16 }} />

            {loading && <div>Loading summary…</div>}
            {!loading && !summary && (
              <div>
                No summary yet. Once the AI writes to Firestore for this
                session, this view will populate automatically.
              </div>
            )}

            {summary && (
              <div>
                {["Standard 1", "Standard 2", "Standard 3", "Standard 4"].map(
                  (std, i) =>
                    summary[std as keyof typeof summary] && (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                          {std}
                        </div>
                        <div
                          style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                          {
                            summary[std as keyof typeof summary] as
                              | string
                              | undefined
                          }
                        </div>
                      </div>
                    )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
