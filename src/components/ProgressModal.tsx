import React, { useState } from 'react';
import { X, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedStandards: number[];
  onToggleStandard: (index: number) => void;
  currentStandard?: number;
}

const standardsData = [
  {
    title: "Professional Responsibility",
    fullTitle: "Standard 1 – Professional Responsibility and Accountability",
    subheadings: ["Professionalism & Responsibility (Standard 1)"]
  },
  {
    title: "Knowledge-Based Practice",
    fullTitle: "Standard 2 – Knowledge-Based Practice", 
    subheadings: [
      "Clinical Skills & Knowledge (Standards 2 & 3)",
      "Critical Thinking & Clinical Judgment (Standard 2)",
      "Organization & Time Management (Standard 2)",
      "Initiative & Engagement (Standard 2)",
      "Safety & Quality of Care (Standards 2 & 4)"
    ]
  },
  {
    title: "Client-Focused Service",
    fullTitle: "Standard 3 – Client-Focused Provision of Service",
    subheadings: [
      "Clinical Skills & Knowledge (Standards 2 & 3)",
      "Communication & Interpersonal Skills (Standards 3 & 4)"
    ]
  },
  {
    title: "Ethical Practice",
    fullTitle: "Standard 4 – Ethical Practice",
    subheadings: [
      "Communication & Interpersonal Skills (Standards 3 & 4)",
      "Safety & Quality of Care (Standards 2 & 4)",
      "Additional Comments (All Standards)"
    ]
  }
];

export function ProgressModal({ isOpen, onClose, completedStandards, onToggleStandard, currentStandard }: ProgressModalProps) {
  const [progressBarExpanded, setProgressBarExpanded] = useState(false);
  const [hoveredStandard, setHoveredStandard] = useState<number | null>(null);
  
  if (!isOpen) return null;

  const progress = (completedStandards.length / 4) * 100;
  const currentStandardIndex = currentStandard ? currentStandard - 1 : -1;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-lg p-4 sm:p-8 w-[95%] sm:w-full max-w-3xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto z-50 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl text-gray-800 mb-2">Your Progress</h2>
            <p className="text-gray-500">{completedStandards.length} of 4 standards completed</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Progress Bar Toggle */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <button
            onClick={() => setProgressBarExpanded(!progressBarExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-gray-700">Progress Bar</span>
            {progressBarExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {/* Line Progress Bar */}
          {progressBarExpanded && (
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="relative h-10 bg-gray-300 border-3 border-[#003E6B] rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#ffd700] transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#003E6B]">
                {Math.round(progress)}%
              </div>
            </div>
          )}
        </div>
        
        {/* Vertical Stepper */}
        <div className="relative">
          {standardsData.map((standard, index) => {
            const isCompleted = completedStandards.includes(index);
            const isCurrent = currentStandardIndex === index;
            const isLast = index === standardsData.length - 1;
            
            return (
              <div 
                key={index} 
                className="relative flex gap-6 pb-8 last:pb-0"
                onMouseEnter={() => setHoveredStandard(index)}
                onMouseLeave={() => setHoveredStandard(null)}
              >
                {/* Left side - Circle and connecting line */}
                <div className="flex flex-col items-center">
                  {/* Circle with number */}
                  <button
                    onClick={() => onToggleStandard(index)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isCompleted
                        ? 'bg-[#ffd700] text-white shadow-lg'
                        : isCurrent
                        ? 'bg-[#003E6B] text-white shadow-lg ring-4 ring-[#003E6B]/30'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" strokeWidth={3} />
                    ) : (
                      <span className="text-lg">{index + 1}</span>
                    )}
                  </button>
                  
                  {/* Connecting line */}
                  {!isLast && (
                    <div 
                      className={`w-0.5 flex-1 mt-2 transition-all duration-300 ${
                        isCompleted ? 'bg-[#ffd700]' : 'bg-gray-300'
                      }`}
                      style={{ minHeight: '40px' }}
                    />
                  )}
                </div>
                
                {/* Right side - Content */}
                <div className="flex-1 pt-2">
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl text-gray-800 mb-1">{standard.title}</h3>
                      {isCurrent && !isCompleted && (
                        <span className="px-2 py-0.5 bg-[#003E6B] text-white text-xs rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{standard.fullTitle}</p>
                  </div>
                  
                  {/* Subheadings - shown when current (in progress) or hovered */}
                  {((isCurrent && !isCompleted) || hoveredStandard === index) && (
                    <div className={`mt-3 space-y-1.5 p-4 rounded-lg border transition-colors ${
                      isCurrent && !isCompleted
                        ? 'bg-blue-50 border-[#003E6B]/30'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      {standard.subheadings.map((subheading, subIndex) => (
                        <p key={subIndex} className="text-sm text-gray-600">
                          • {subheading}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}