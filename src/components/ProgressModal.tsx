// src/components/ProgressModal.tsx
import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useSessionSummary } from "../hooks/useSessionSummary";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStandard?: number;
}

/**
 * Standards list + correct Supabase field keys
 */
const standardsData = [
  {
    key: "s1_summary",
    title: "Professional Responsibility",
    fullTitle: "Standard 1 – Professional Responsibility and Accountability",
    subheadings: [
      "Professional accountability, honesty and transparency",
      "Recognition of scope of practice and personal limitations",
      "Clinical safety and risk management",
      "Evidence-informed practice and self-directed learning",
      "Professional conduct and respectful interactions",
      "Self-care practices",
    ],
  },
  {
    key: "s2_summary",
    title: "Knowledge-Based Practice",
    fullTitle: "Standard 2 – Knowledge-Based Practice",
    subheadings: [
      "Clinical competence and skill application",
      "Evidence-informed practice",
      "Clinical safety and risk management",
      "Critical thinking, clinical reasoning and clinical judgment",
      "Knowledge synthesis and application",
      "Adaptability and proactive thinking",
      "Individualized patient care and relational inquiry",
      "Pharmacology knowledge and safe medication practice",
      "Comprehensive reporting and accurate documentation",
    ],
  },
  {
    key: "s3_summary",
    title: "Client-Focused Service",
    fullTitle: "Standard 3 – Client-Focused Provision of Service",
    subheadings: [
      "Interprofessional collaboration",
      "Conflict resolution",
      "Team communication",
      "Anticipatory planning",
      "Continuity of care",
      "Time management and organization",
      "Delegation",
      "Individual’s receiving care advocacy",
    ],
  },
  {
    key: "s4_summary",
    title: "Ethical Practice",
    fullTitle: "Standard 4 – Ethical Practice",
    subheadings: [
      "Confidentiality maintenance and privacy protection",
      "Equitable care delivery and respect for diversity",
      "Therapeutic boundaries and professional relationship limits",
      "Social media boundaries",
      "Identification of ethical issues",
      "Health disparities reduction",
      "Anti-oppressive practices",
      "Safety advocacy",
      "Autonomy and informed consent",
    ],
  },
];

export function ProgressModal({
  isOpen,
  onClose,
  currentStandard,
}: ProgressModalProps) {
  const [hoveredStandard, setHoveredStandard] = useState<number | null>(null);
  const { summary, loading } = useSessionSummary();

  if (!isOpen) return null;

  // Determine which standards have Supabase summaries
  const completedStandards = standardsData
    .map((s, i) => (summary && (summary as any)[s.key] ? i : -1))
    .filter((i) => i !== -1);

  const currentStandardIndex = currentStandard ? currentStandard - 1 : -1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-lg p-4 sm:p-8 w-[95%] sm:w-full max-w-3xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto z-50 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl text-gray-800 mb-2">Your Progress</h2>
            <p className="text-gray-500">
              {completedStandards.length} of 4 standards completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Vertical Stepper only */}
        <div className="relative">
          {loading ? (
            <p className="text-gray-500 text-center">Loading progress...</p>
          ) : (
            standardsData.map((standard, index) => {
              const isCompleted = completedStandards.includes(index);
              const isCurrent = currentStandardIndex === index;
              const isLast = index === standardsData.length - 1;

              return (
                <div
                  key={index}
                  className="relative flex gap-6 pb-8 last:pb-0"
                  onMouseEnter={() => setHoveredStandard(index)}
                  onMouseLeave={() => setHoveredStandard(null)}>
                  {/* Left icons */}
                  <div className="flex flex-col items-center">
                    <button
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        isCompleted
                          ? "bg-[#ffd700] text-white shadow-lg"
                          : isCurrent
                          ? "bg-[#003E6B] text-white shadow-lg ring-4 ring-[#003E6B]/30"
                          : "bg-gray-300 text-gray-600"
                      }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6" strokeWidth={3} />
                      ) : (
                        <span className="text-lg">{index + 1}</span>
                      )}
                    </button>

                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 mt-2 transition-all duration-300 ${
                          isCompleted ? "bg-[#ffd700]" : "bg-gray-300"
                        }`}
                        style={{ minHeight: "40px" }}
                      />
                    )}
                  </div>

                  {/* Right content */}
                  <div className="flex-1 pt-2">
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl text-gray-800 mb-1">
                          {standard.title}
                        </h3>
                        {isCurrent && !isCompleted && (
                          <span className="px-2 py-0.5 bg-[#003E6B] text-white text-xs rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {standard.fullTitle}
                      </p>
                    </div>

                    {/* Subheadings */}
                    {((isCurrent && !isCompleted) ||
                      hoveredStandard === index) && (
                      <div
                        className={`mt-3 space-y-1.5 p-4 rounded-lg border transition-colors ${
                          isCurrent && !isCompleted
                            ? "bg-blue-50 border-[#003E6B]/30"
                            : "bg-gray-50 border-gray-200"
                        }`}>
                        {standard.subheadings.map((sub, i) => (
                          <p key={i} className="text-sm text-gray-600">
                            • {sub}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
