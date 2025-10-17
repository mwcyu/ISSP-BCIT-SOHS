import React from 'react';
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatAreaProps {
  messages: Message[];
  onSuggestedPrompt: (prompt: string) => void;
}

const suggestedPrompts = [
  "How can I provide constructive feedback on clinical skills?",
  "What are key indicators of professional responsibility in nursing learners?",
  "How do I address communication concerns with a learner?", 
  "What specific examples should I include in feedback?",
  "How can I support a struggling learner's development?",
  "What documentation should I include for client-focused care?"
];

export function ChatArea({ messages, onSuggestedPrompt }: ChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
      {messages.length === 0 ? (
        <div className="text-center space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-[#003E6B] p-3 rounded-full">
                <Bot className="w-8 h-8 text-[#ffd700]" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">BCIT Feedback Helper</h3>
            <p className="text-gray-600 mb-4">
              I'm here to help you provide effective feedback to nursing learners based on BCCNM standards of practice.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            {/* <h4 className="font-medium text-gray-800 mb-3">Suggested prompts:</h4> */}
            <div className="space-y-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestedPrompt(prompt)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 hover:border-[#003E6B] rounded-lg transition-all text-sm text-gray-700 border border-transparent"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-[#003E6B]' 
                  : 'bg-[#ffd700]'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-[#003E6B]" />
                )}
              </div>
              <div className={`flex-1 max-w-[80%] ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-[#003E6B] text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}