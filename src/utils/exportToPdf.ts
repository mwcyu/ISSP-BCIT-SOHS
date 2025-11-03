// src/utils/exportToPdf.ts
import { jsPDF } from "jspdf";
import type { SessionSummary } from "../types/summary";

/**
 * Converts the current session's summary document into a downloadable PDF.
 */
export function exportSessionSummaryToPdf(data: SessionSummary) {
  const doc = new jsPDF();
  const marginX = 12;
  let y = 14;

  doc.setFontSize(16);
  doc.text("Feedback Summary Report", marginX, y);
  y += 8;

  doc.setFontSize(10);
  doc.text(new Date().toLocaleString(), marginX, y);
  y += 8;

  doc.setLineWidth(0.3);
  doc.line(marginX, y, 200 - marginX, y);
  y += 6;

  doc.setFontSize(12);
  const standards = ["Standard 1", "Standard 2", "Standard 3", "Standard 4"];

  standards.forEach((std) => {
    const summary = data[std as keyof SessionSummary];
    if (summary) {
      doc.text(std + ":", marginX, y);
      y += 6;
      const lines = doc.splitTextToSize(summary as string, 200 - marginX * 2);
      lines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 14;
        }
        doc.text(line, marginX, y);
        y += 6;
      });
      y += 4;
    }
  });

  doc.save("feedback-summary.pdf");
}
