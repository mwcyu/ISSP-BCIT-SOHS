import React, { useEffect, useRef } from "react";
import { Send, Bot, Menu, User } from "lucide-react";
import { Message, Standard } from "../types";

interface RightPanelProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onStandardClick?: (standard: Standard) => void;
  onMobileMenuClick?: () => void;
  onMobileBackClick?: () => void;
  showMobileControls?: boolean;
  onToggleSidebar?: () => void;
}

const standards: Standard[] = [
  {
    id: '1',
    title: 'Standard 1',
    subtitle: 'Professional Responsibility and Accountability',
    prompt:
      'How can I provide effective feedback on professional responsibility and accountability for nursing learners? Include specific examples and assessment criteria.',
  },
  {
    id: '2',
    title: 'Standard 2',
    subtitle: 'Knowledge-Based Practice',
    prompt:
      "What should I look for when evaluating a nursing learner's knowledge-based practice? How do I provide constructive feedback on clinical skills and evidence-based decision making?",
  },
  {
    id: '3',
    title: 'Standard 3',
    subtitle: 'Client-Focused Provision of Service',
    prompt:
      "How do I assess and provide feedback on client-focused care? What are key indicators of therapeutic communication and patient advocacy in nursing learners?",
  },
  {
    id: '4',
    title: 'Standard 4',
    subtitle: 'Ethical Practice',
    prompt:
      'What are the essential elements of ethical practice for nursing learners? How can I provide meaningful feedback on ethical decision-making and professional boundaries?',
  },
];

// Standard Card Component
const StandardCard = ({ standard, onClick }: { standard: Standard; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="group bg-white border border-gray-200 rounded-xl p-4 sm:p-6 cursor-pointer 
               transition-all duration-200 hover:shadow-lg hover:border-[#003E6B] 
               hover:scale-[1.02] active:scale-[0.98]"
  >
    <h3 className="text-lg sm:text-xl font-semibold text-[#003E6B] mb-2 group-hover:text-[#ffd700] transition-colors">
      {standard.title}
    </h3>
    <p className="text-sm sm:text-base text-gray-600">
      {standard.subtitle}
    </p>
  </div>
);

export function RightPanel({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onStandardClick,
  onMobileMenuClick,
  onMobileBackClick,
  showMobileControls = false,
  onToggleSidebar,
}: RightPanelProps) {
  // 👇 New reference for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 👇 Auto-scroll effect (runs when messages change)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 bg-[#f5f5dc] flex flex-col h-screen relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showMobileControls && (
            <button
              onClick={onMobileMenuClick}
              className="p-2 rounded-lg transition-colors lg:hidden"
              title="Menu">
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}
          

          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#003E6B] border-2 border-white flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#ffd700]" />
            </div>
          </div>
          <span className="ml-2 text-gray-700">Feedback Helper</span>
        </div>

      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Intro Message */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-center mb-4">
                {/* ✅ Circular bot icon */}
                <div className="w-12 h-12 rounded-full bg-[#003E6B] flex items-center justify-center">
                  <Bot className="w-6 h-6 text-[#ffd700]" />
                </div>
              </div>
              <h3 className="text-lg text-gray-800 mb-2 text-center font-semibold">
                Feedback Assistant
              </h3>
              <p className="text-gray-600 text-center">
                I'm here to help you provide effective feedback to nursing learners based on BCCNM standards of practice.
              </p>
            </div>

            {/* BCCNM Standards */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="text-gray-800 mb-4 font-semibold">
                BCCNM Standards of Practice:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {standards.map((standard) => (
                  <div
                    key={standard.id}
                    onClick={() => onStandardClick?.(standard)}
                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-all border-l-4 border-l-[#003E6B] hover:border-l-[#ffd700] flex flex-col h-24 sm:h-28"
                  >
                    <h5 className="text-gray-800 font-medium mb-1 text-sm sm:text-base">{standard.title}</h5>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{standard.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-[#ffd700] flex items-center justify-center overflow-hidden">
                    <Bot className="w-4 h-4 text-[#003E6B]" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-[#003E6B] text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#003E6B] flex items-center justify-center overflow-hidden">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {/* 👇 Auto-scroll anchor (always at bottom) */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input - Floating at Panel Bottom */}
      <div className="mt-auto px-4 sm:px-6 pb-6 sm:pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-300 flex gap-2 sm:gap-3 items-center px-4 sm:px-6 py-3 sm:py-4 transform transition-all duration-200 hover:shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-transparent focus:outline-none text-sm sm:text-base text-gray-800 placeholder-gray-400"
            />
            <button
              onClick={onSendMessage}
              disabled={!inputValue.trim()}
              className="p-2 sm:p-2.5 bg-[#003E6B] text-white rounded-full hover:bg-[#002a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
