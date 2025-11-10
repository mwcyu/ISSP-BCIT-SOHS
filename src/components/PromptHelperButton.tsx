import React, { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

interface PromptHelperButtonProps {
  currentStandard?: number;
}

const standardPrompts = {
  1: [
    "Can you provide an example of when the learner appropriately sought assistance?",
    "How does the learner demonstrate awareness of their scope of practice?",
    "How well does the learner recognize situations that require consultation or escalation?",
    "How does the learner manage stress during clinical practice?",
    "What examples show the learner's understanding of others' roles and responsibilities?",
    "How effectively does the learner communicate with different members of the team?",
    "Can you describe a situation where the learner identified a potential or actual safety concern? How did the learner respond when they recognized a safety issue?",
    "How does the learner respond to feedback and incorporate it into their practice?",
    "Does the learner come to you with a plan, or do you find that you need to suggest the plan for them to implement?",
    "What evidence shows the learner's commitment to ongoing professional development?",
    "Are there any concerns around professionalism?",
  ],
  2: [
    "Can you describe a situation where the learner prioritized individual's receiving care?",
    "How quickly does the learner recognize and act on urgent safety concerns?",
    "How well did the learner tailor their practice to specific individuals receiving care with a focus on their needs and preferences?",
    "How thorough and comprehensive are the learner's nursing assessments?",
    "Can you describe the learner's approach to gathering individual's receiving care information?",
    "Can you provide an example of the learner identifying patterns or connections in the data they collect?",
    "How well does the learner use assessment findings to inform their clinical decisions?",
    "How does the learner evaluate whether nursing interventions are effective?",
    "Can you describe a situation where the learner modified a care plan based on individual's receiving care response?",
    "Can you describe how the learner anticipates potential complications or risks?",
    "Describe the learner's clinical judgment in responding to changing individual's receiving care conditions.",
    "What examples show the learner's understanding of drug actions, interactions, and side effects?",
    "How does the learner adapt their teaching to individual's receiving cares' understanding levels?",
    "Can you describe the learner's approach to individual's receiving care experiencing mental health challenges?",
    "How does the learner adapt their communication style to different individual's receiving care and situations?",
    "Describe the learner's ability to apply theoretical concepts to clinical situations.",
    "Describe the learner's ability to communicate individual's receiving care information in written and verbal reports.",
  ],
  3: [
    "Can you describe the learner's collaborative approach with other healthcare professionals?",
    "Describe the learner's approach to resolving conflicts or disagreements within the team.",
    "Can you provide examples of the learner consulting with team members to adjust care plans?",
    "Can you describe how the learner involves individual's receiving care in decisions about their holistic adjustments?",
    "Can you describe the learner's approach to coordinating multiple services (i.e. preparation for transport or tests, working with OT, PT, SW, RT etc.) or interventions?",
    "How well does the learner balance multiple individual's receiving care needs and competing demands?",
    "Can you provide examples of the learner delegating tasks appropriately?",
    "Describe the learner's approach to following up on delegated tasks.",
    "Can you describe situations where the learner connected individual's receiving care with appropriate resources?",
  ],
  4: [
    "How does the learner demonstrate respect for individual's receiving care privacy and confidentiality?",
    "Describe the learner's ability to separate personal values from professional practice.",
    "How does the learner establish and maintain appropriate professional boundaries?",
    "Describe situations where the learner identified moral or ethical concerns. How did they respond?",
    "How does the learner use therapeutic communication to build relationships with individual's receiving cares?",
    "How does the learner advocate for individual's receiving cares experiencing vulnerable circumstances?",
    "Describe the learner's approach to caring for marginalized or underserved individual's receiving care.",
    "How does the learner empower individual's receiving care to participate in their health decisions?",
    "How well does the learner adapt their approach for individual's receiving care with cognitive or physical limitations?",
    "How does the learner create an environment where individual's receiving care feel culturally safe?",
  ],
};

const standardTitles = {
  1: "Standard 1: Professional Responsibility",
  2: "Standard 2: Knowledge-Based Practice",
  3: "Standard 3: Client-Focused Service",
  4: "Standard 4: Ethical Practice",
};

export function PromptHelperButton({ currentStandard }: PromptHelperButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isSmall, setIsSmall] = useState(window.innerWidth < 400);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsSmall(window.innerWidth < 400);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!currentStandard || currentStandard < 1 || currentStandard > 4) {
    return null;
  }

  const showPopover = isOpen || isHovered;

  // Compute responsive dimensions
  const popoverWidth = isSmall ? '85vw' : isMobile ? '90vw' : '95vw';
  const popoverMaxHeight = isSmall ? '35vh' : isMobile ? '40vh' : '70vh';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isMobile ? "4.3rem" : "5.7rem",
        right: isMobile ? "0.5rem" : "0.7rem",
        zIndex: 50,
        pointerEvents: 'auto',
      }}
    >
      {/* Popover */}
      {showPopover && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            transform: 'translateX(0%)',
            marginBottom: '12px',
            width: popoverWidth,
            maxWidth: '420px',
            maxHeight: popoverMaxHeight,
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#003E6B',
              color: 'white',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={20} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 500 }}>Prompt Questions</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '0.25rem',
                borderRadius: '0.25rem',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Accordion Content */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              padding: '1rem',
            }}
          >
            <Accordion type="multiple" className="w-full">
              {[1, 2, 3, 4].map((standardNum) => {
                const prompts = standardPrompts[standardNum as keyof typeof standardPrompts] || [];
                const title = standardTitles[standardNum as keyof typeof standardTitles] || "";

                return (
                  <AccordionItem key={standardNum} value={`standard-${standardNum}`}>
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <span
                        className={
                          standardNum === currentStandard
                            ? "text-[#003E6B] font-medium"
                            : "text-gray-700"
                        }
                      >
                        {title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 mt-2">
                        {prompts.map((prompt, index) => (
                          <li
                          key={index}
                          style={{
                            fontSize: '0.875rem',
                            color: '#374151',
                            paddingLeft: '0.75rem',
                            borderLeft: '2px solid #d1d5db',
                            paddingTop: '0.25rem',
                            paddingBottom: '0.25rem',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderLeftColor = '#ffd700';
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderLeftColor = '#d1d5db';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {prompt}
                        </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: '#003E6B',
          color: 'white',
          padding: '0.75rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#002a4d';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#003E6B';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="View prompt questions"
      >
        <HelpCircle size={24} />
      </button>
    </div>
  );
}