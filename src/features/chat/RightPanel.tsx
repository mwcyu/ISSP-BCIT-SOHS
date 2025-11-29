import { useEffect, useRef } from "react";
import { Send, Bot, Menu, User, Sparkles } from "lucide-react";
import { Message, Standard } from "../../types";

// Markdown imports
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RightPanelProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onStandardClick?: (standard: Standard) => void;
  onMobileMenuClick?: () => void;
  onMobileBackClick?: () => void;
  showMobileControls?: boolean;
  onToggleSidebar?: () => void;
}

const standards: Standard[] = [
  {
    id: "1",
    title: "Standard 1",
    subtitle: "Professional Responsibility",
    prompt:
      "How can I provide effective feedback on professional responsibility and accountability for nursing learners? Include specific examples and assessment criteria.",
  },
  {
    id: "2",
    title: "Standard 2",
    subtitle: "Knowledge-Based Practice",
    prompt:
      "What should I look for when evaluating a nursing learner's knowledge-based practice? How do I provide constructive feedback on clinical skills and evidence-based decision making?",
  },
  {
    id: "3",
    title: "Standard 3",
    subtitle: "Client-Focused Service",
    prompt:
      "How do I assess and provide feedback on client-focused care? What are key indicators of therapeutic communication and patient advocacy in nursing learners?",
  },
  {
    id: "4",
    title: "Standard 4",
    subtitle: "Ethical Practice",
    prompt:
      "What are the essential elements of ethical practice for nursing learners? How can I provide meaningful feedback on ethical decision-making and professional boundaries?",
  },
];

const StandardCard = ({
  standard,
  onClick,
}: {
  standard: Standard;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-start text-left p-5 bg-white border border-gray-200 rounded-xl 
               transition-all duration-200 hover:shadow-md hover:border-bcit-blue/30 hover:-translate-y-0.5"
  >
    <div className="mb-3 p-2 rounded-lg bg-blue-50 text-bcit-blue group-hover:bg-bcit-blue group-hover:text-white transition-colors">
      <Sparkles size={18} />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-bcit-blue transition-colors">
      {standard.title}
    </h3>
    <p className="text-sm text-gray-500 leading-snug">
      {standard.subtitle}
    </p>
  </button>
);

// ... (StandardCard component remains same)

export function RightPanel({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onStandardClick,
  onMobileMenuClick,
  showMobileControls = false,
}: RightPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  return (
    <div className="flex-1 flex flex-col h-screen relative bg-gray-50/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {showMobileControls && (
            <button
              onClick={onMobileMenuClick}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 lg:hidden text-gray-600"
              title="Menu">
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bcit-blue to-bcit-dark flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm leading-tight">Feedback Assistant</h2>
              <p className="text-xs text-gray-500 font-medium">AI-Powered Clinical Support</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="max-w-4xl mx-auto mt-8 sm:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-bcit-blue" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                How can I help you today?
              </h1>
              <p className="text-gray-500 max-w-lg mx-auto text-lg">
                Select a standard below to start generating feedback, or type your own question.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
              {standards.map((standard) => (
                <StandardCard
                  key={standard.id}
                  standard={standard}
                  onClick={() => onStandardClick?.(standard)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.sender === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {/* Bot Avatar */}
                {message.sender === "bot" && (
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-5 h-5 text-bcit-blue" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 sm:p-5 rounded-2xl shadow-sm ${message.sender === "user"
                    ? "bg-bcit-blue text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    }`}
                >
                  {message.sender === "bot" ? (
                    <div className="prose prose-sm max-w-none text-gray-800 prose-headings:font-bold prose-a:text-bcit-blue prose-strong:text-bcit-blue">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {typeof message.content === "string"
                          ? message.content
                          : String(message.content || "")}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}

                  <p
                    className={`text-[10px] mt-2 font-medium ${message.sender === "user"
                      ? "text-blue-200/80"
                      : "text-gray-400"
                      }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* User Avatar */}
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-bcit-gold flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <User className="w-5 h-5 text-bcit-dark" />
                  </div>
                )}
              </div>
            ))}
            {/* Spacer to prevent content from being hidden behind floating input */}
            <div className="h-20 sm:h-20" />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {/* 
        absolute bottom-0 left-0 right-0: Positions the input area at the bottom of the screen, spanning full width.
        p-4 sm:p-4: Adds padding around the input container.
        z-20: Ensures the input area sits above the chat log (which has lower z-index).
        pointer-events-none: Allows clicks to pass through the transparent areas of this container to the chat log behind it.
      */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-4 z-20 pointer-events-none">
        {/* 
          max-w-3xl mx-auto: Centers the input box and constrains its width to match the chat content width.
          relative: Establishes a positioning context for children.
          pointer-events-auto: Re-enables clicks for the input box itself (since parent has pointer-events-none).
        */}
        <div className="max-w-3xl mx-auto relative pointer-events-auto">
          {/* 
            relative flex items-end gap-2: Flex container aligning items to the bottom (input and button).
            bg-white: White background for the input box.
            border border-gray-200: Subtle gray border.
            rounded-2xl: Large rounded corners for a modern pill/bubble shape.
            p-3: Padding inside the input box container.
            shadow-xl: Prominent shadow to give a "floating" effect.
            focus-within:ring-2 ...: Adds a blue ring/border when the input is focused.
            transition-all duration-200: Smooth transition for focus states.
          */}
          <div className="relative flex items-end gap-2 bg-white border border-gray-200 rounded-2xl p-3 shadow-xl focus-within:ring-2 focus-within:ring-bcit-blue/10 focus-within:border-bcit-blue transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Type your message here..."
              /* 
                w-full: Takes up available width.
                max-h-[120px]: Limits height to prevent taking up too much screen space.
                bg-transparent: Transparent background to show parent's white bg.
                border-none focus:ring-0 outline-none shadow-none: Removes default browser styles.
                resize-none: Disables manual resizing handle.
                scrollbar-hide: Hides scrollbar for a cleaner look (custom utility).
              */
              className="w-full max-h-[120px] py-3 px-3 bg-transparent border-none focus:ring-0 outline-none shadow-none resize-none text-gray-800 placeholder-gray-400 text-sm sm:text-base leading-relaxed scrollbar-hide"
              rows={1}
            />
            <button
              onClick={onSendMessage}
              disabled={!inputValue.trim()}
              /* 
                p-2.5: Padding inside the button.
                mb-1.5 mr-2: Margins to position the button relative to the input field bottom-right.
                rounded-xl: Rounded corners matching the input theme.
                bg-bcit-blue text-white: Primary brand color button.
                hover:bg-bcit-dark: Darker shade on hover.
                disabled:opacity-50 ...: Visual feedback for disabled state.
                shadow-sm hover:shadow-md: Subtle shadow effects.
                active:scale-95: Click press effect.
                shrink-0: Prevents button from shrinking when input text is long.
              */
              className="p-2.5 mb-1.5 mr-2 rounded-xl bg-bcit-blue text-white hover:bg-bcit-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3 font-medium drop-shadow-sm pointer-events-auto">
            AI can make mistakes. Please review generated feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
