import { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../../../components/ui/accordion';

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
        "Describe the learner's approach to caring for marginalized or underserved individual's receiving care?",
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
    const popoverWidth = isSmall ? 'w-[85vw]' : isMobile ? 'w-[90vw]' : 'w-[95vw]';
    const popoverMaxHeight = isSmall ? 'max-h-[35vh]' : isMobile ? 'max-h-[40vh]' : 'max-h-[70vh]';

    return (
        <div className={`fixed z-50 pointer-events-auto ${isMobile ? 'bottom-28 right-2' : 'bottom-32 right-4'}`}>
            {/* Popover */}
            {showPopover && (
                <div
                    className={`absolute bottom-full right-0 translate-x-0 mb-3 max-w-[420px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden ${popoverWidth} ${popoverMaxHeight}`}
                >
                    {/* Header */}
                    <div className="bg-bcit-blue text-white px-4 py-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <HelpCircle size={20} />
                            <h3 className="text-sm font-medium">Prompt Questions</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded hover:bg-white/20 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Scrollable Accordion Content */}
                    <div className="overflow-y-auto flex-1 p-4">
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
                                                        ? "text-bcit-blue font-medium"
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
                                                        className="text-sm text-gray-700 pl-3 border-l-2 border-gray-300 py-1 transition-all cursor-pointer hover:border-bcit-gold hover:bg-gray-50"
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
                className="bg-bcit-blue text-white p-3 rounded-full shadow-lg hover:bg-bcit-dark hover:scale-110 transition-all duration-200 border-none cursor-pointer"
                title="View prompt questions"
            >
                <HelpCircle size={24} />
            </button>
        </div>
    );
}
