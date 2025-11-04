// src/utils/exportToPdf.ts
import { jsPDF } from "jspdf";
import type { SessionSummary } from "../types/summary";

/**
 * Converts the current session's summary record into a downloadable PDF.
 * Works with the Supabase-backed SessionSummary shape:
 * - sessionId
 * - created_at (ISO string)
 * - s1_summary, s2_summary, s3_summary, s4_summary
 */
export function exportSessionSummaryToPdf(summary: SessionSummary | null) {
  if (!summary) {
    console.warn("exportSessionSummaryToPdf called with no summary");
    return;
  }

  const doc = new jsPDF();
  const marginX = 12;
  let y = 16;

  // Title
  doc.setFontSize(16);
  doc.text("Feedback Summary Report", marginX, y);
  y += 8;

  // Timestamp
  const createdAt = summary.created_at
    ? new Date(summary.created_at)
    : new Date();
  doc.setFontSize(10);
  doc.text(`Generated: ${createdAt.toLocaleString()}`, marginX, y);
  y += 8;

  // Divider
  doc.setLineWidth(0.3);
  doc.line(marginX, y, 200 - marginX, y);
  y += 8;

  // Standards list mapped from Supabase field names
  const sections: { label: string; value?: string }[] = [
    { label: "Standard 1", value: summary.s1_summary },
    { label: "Standard 2", value: summary.s2_summary },
    { label: "Standard 3", value: summary.s3_summary },
    { label: "Standard 4", value: summary.s4_summary },
  ];

  doc.setFontSize(12);

  sections.forEach((section) => {
    if (!section.value) return;

    // Section heading
    doc.text(section.label + ":", marginX, y);
    y += 6;

    // Wrap text within page width
    const lines = doc.splitTextToSize(section.value, 200 - marginX * 2);
    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 16;
      }
      doc.text(line, marginX, y);
      y += 6;
    });

    y += 4;
  });

  doc.save("feedback-summary.pdf");
}
