// src/components/LiveSessionDocumentPreview.tsx
import { useMemo, useState } from "react";
import { useSessionSummary } from "../../../hooks/useSessionSummary";
import { exportSessionSummaryToPdf } from "../../../utils/exportToPdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

/**
 * Shows a floating "Document Preview" button and modal with the live summary document.
 * Automatically re-renders when Firestore data updates.
 */

// Custom markdown components for consistent styling
const markdownComponents: any = {
  h1: ({ node, ...props }: any) => (
    <h1 className="text-xl sm:text-2xl font-bold mb-2 mt-4" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-lg sm:text-xl font-bold mb-2 mt-3" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-base sm:text-lg font-semibold mb-2 mt-2" {...props} />
  ),
  p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />
  ),
  li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
  a: ({ node, ...props }: any) => (
    <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 italic my-2"
      {...props}
    />
  ),
};

export default function LiveSessionDocumentPreview() {
  const { summary, loading } = useSessionSummary();
  const [open, setOpen] = useState(false);

  const formatted = useMemo(() => {
    if (!summary) return null;
    const createdAt = summary.created_at
      ? new Date(summary.created_at).toLocaleString()
      : "No timestamp";
    return { ...summary, createdAtText: createdAt };
  }, [summary]);

  return (
    <>
      {/* Floating button - currently hidden/missing in original code, but keeping structure */}

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
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
                  <strong>Date:</strong> {formatted.createdAtText}
                </div>

                <div className="space-y-6">
                  {[
                    { key: "s1_summary" },
                    { key: "s2_summary" },
                    { key: "s3_summary" },
                    { key: "s4_summary" },
                  ].map(({ key }) => {
                    const rawValue = (summary as any)[key];
                    if (!rawValue) return null;

                    // Process content similar to ChatArea:
                    // 1. Unescape newlines
                    // 2. Add hard breaks for non-list lines
                    const value = typeof rawValue === 'string'
                      ? rawValue
                        .replace(/\\n/g, '\n')
                        .replace(/\n(?!\s*([*-]|\d+\.)\s)/g, '  \n')
                      : String(rawValue || '');

                    return (
                      <div key={key} className="border-bcit-blue pl-4 py-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={markdownComponents}
                        >
                          {value}
                        </ReactMarkdown>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
