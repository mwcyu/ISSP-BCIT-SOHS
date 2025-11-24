// src/utils/exportToPdf.ts
import { jsPDF } from "jspdf";
import type { SessionSummary } from "../types/summary";

/**
 * Converts the current session's summary record into a downloadable PDF.
 * Minimal modification:
 * - REMOVE hard-coded labels
 * - SUPPORT markdown headings (#, ##, ###)
 * - REMOVE ** from headings only
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
  doc.setFont("helvetica", "bold");
  doc.text("Feedback Summary Report", marginX, y);
  y += 8;

  // Timestamp
  const createdAt = summary.created_at
    ? new Date(summary.created_at)
    : new Date();
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${createdAt.toLocaleString()}`, marginX, y);
  y += 8;

  // Divider
  doc.setLineWidth(0.3);
  doc.line(marginX, y, 200 - marginX, y);
  y += 8;

  // Only AI content — NO LABELS
  const blocks = [
    summary.s1_summary,
    summary.s2_summary,
    summary.s3_summary,
    summary.s4_summary,
  ].filter(Boolean);

  doc.setFontSize(12);

  blocks.forEach((textBlock) => {
    if (!textBlock) return;

    const rawLines = textBlock.split("\n");

    rawLines.forEach((rawLine) => {
      let line = rawLine.trim();

      // Page break
      if (y > 280) {
        doc.addPage();
        y = 16;
      }

      // Clean heading (remove **)
      const clean = line.replace(/\*\*/g, "");

      // --- MARKDOWN HEADINGS ---
      if (clean.startsWith("### ")) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(clean.replace("### ", ""), marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        y += 10;
        return;
      }

      if (clean.startsWith("## ")) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(clean.replace("## ", ""), marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        y += 12;
        return;
      }

      if (clean.startsWith("# ")) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(clean.replace("# ", ""), marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        y += 14;
        return;
      }

      // Regular wrapped text
      const wrapped = doc.splitTextToSize(clean, 200 - marginX * 2);
      wrapped.forEach((l) => {
        if (y > 280) {
          doc.addPage();
          y = 16;
        }
        doc.text(l, marginX, y);
        y += 6;
      });
      y += 2;
    });

    y += 4;
  });

  doc.save("feedback-summary.pdf");
}
