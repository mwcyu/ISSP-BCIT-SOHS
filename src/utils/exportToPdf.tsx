import { pdf } from "@react-pdf/renderer";
import { SessionPdfDocument } from "../components/pdf/SessionPdfDocument";
import type { SessionSummary } from "../types/summary";

/**
 * Converts the current session's summary record into a downloadable PDF
 * using @react-pdf/renderer for high-quality, selectable text output.
 */
export async function exportSessionSummaryToPdf(summary: SessionSummary | null) {
  console.log("Starting PDF export with @react-pdf/renderer...");

  if (!summary) {
    console.warn("exportSessionSummaryToPdf called with no summary");
    return;
  }

  try {
    // Generate the PDF blob
    const blob = await pdf(<SessionPdfDocument summary={summary} />).toBlob();

    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-summary-${summary.sessionId || 'report'}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("PDF saved successfully.");
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("Failed to generate PDF. Please check the console for details.");
  }
}
