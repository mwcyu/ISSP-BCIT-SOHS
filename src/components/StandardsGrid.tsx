import React from 'react';

const standards = [
  {
    title: "Standard 1",
    subtitle: "Professional Responsibility and Accountability",
    prompt: "How can I provide effective feedback on professional responsibility and accountability for nursing learners? Include specific examples and assessment criteria."
  },
  {
    title: "Standard 2", 
    subtitle: "Knowledge-Based Practice",
    prompt: "What should I look for when evaluating a nursing learner's knowledge-based practice? How do I provide constructive feedback on clinical skills and evidence-based decision making?"
  },
  {
    title: "Standard 3",
    subtitle: "Client-Focused Provision of Service",
    prompt: "How do I assess and provide feedback on client-focused care? What are key indicators of therapeutic communication and patient advocacy in nursing learners?"
  },
  {
    title: "Standard 4",
    subtitle: "Ethical Practice",
    prompt: "What are the essential elements of ethical practice for nursing learners? How can I provide meaningful feedback on ethical decision-making and professional boundaries?"
  }
];

interface StandardsGridProps {
  onStandardClick?: (prompt: string) => void;
}

export function StandardsGrid({ onStandardClick }: StandardsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {standards.map((standard, index) => (
        <div
          key={index}
          onClick={() => onStandardClick?.(standard.prompt)}
          className="bg-gray-100 border border-gray-300 rounded-lg p-6 hover:shadow-md hover:border-[#003E6B] transition-all cursor-pointer transform hover:scale-105"
        >
          <h3 className="text-gray-600 mb-1">{standard.title}</h3>
          <p className="text-gray-500 text-sm">{standard.subtitle}</p>
          
        </div>
      ))}
    </div>
  );
}