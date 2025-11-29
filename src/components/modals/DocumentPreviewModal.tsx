import { useMemo } from "react";
import { X } from "lucide-react";
import { useSessionSummary } from "../../hooks/useSessionSummary";
import { exportSessionSummaryToPdf } from "../../utils/exportToPdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { SessionSummary } from "../../types/summary";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Same markdown styling as ChatArea component
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
    <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
  ),
  li: ({ node, ...props }: any) => <li className="ml-2" {...props} />,
  a: ({ node, ...props }: any) => (
    <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
  ),
  code: ({ node, inline, ...props }: any) =>
    inline ? (
      <code
        className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm"
        {...props}
      />
    ) : (
      <code
        className="block bg-gray-100 text-gray-800 p-2 rounded my-2 overflow-x-auto text-sm"
        {...props}
      />
    ),
  pre: ({ node, ...props }: any) => (
    <pre className="bg-gray-100 p-3 rounded my-2 overflow-x-auto" {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 italic my-2"
      {...props}
    />
  ),
};

export function DocumentPreviewModal({
  isOpen,
  onClose,
}: DocumentPreviewModalProps) {
  const { summary, loading, error } = useSessionSummary();

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
            <h2 className="text-2xl font-bold text-bcit-blue">
              Document Preview
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  exportSessionSummaryToPdf(summary as SessionSummary)
                }
                disabled={!summary}
                className="px-4 py-2 bg-bcit-blue text-white text-sm rounded-lg hover:bg-bcit-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
            {/* Loading */}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bcit-blue mb-4" />
                <p>Loading summary…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="text-center text-red-600 p-4">{error}</div>
            )}

            {/* Summary Loaded */}
            {!loading && !error && summary && (
              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">
                    {formatted?.createdAtText}
                  </p>
                  <h3 className="text-2xl font-bold text-bcit-blue mb-2">
                    Feedback Summary Report
                  </h3>
                </div>

                <div className="space-y-6">
                  {[
                    { key: "s1_summary" },
                    { key: "s2_summary" },
                    { key: "s3_summary" },
                    { key: "s4_summary" },
                  ].map(({ key }) => {
                    const value = (summary as any)[key];
                    if (!value) return null;

                    return (
                      <div key={key} className="border-bcit-blue pl-4 py-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}>
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
      </div>
    </>
  );
}
