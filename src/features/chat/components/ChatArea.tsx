import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../../types';

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

// Reusable Avatar Component
const Avatar = ({ sender }: { sender: 'user' | 'bot' }) => {
  const isUser = sender === 'user';
  return (
    <div
      className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-bcit-blue' : 'bg-bcit-gold'
      }`}
    >
      {isUser ? (
        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
      ) : (
        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-bcit-blue" />
      )}
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  
  // Debug: Log the message content to see what we're actually receiving
  if (!isUser) {
    console.log('Bot message content:', message.content);
    console.log('Content type:', typeof message.content);
  }
  
  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar sender={message.sender} />
      
      <div className={`flex-1 max-w-[85%] sm:max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block p-2 sm:p-3 rounded-lg ${
            isUser
              ? 'bg-bcit-blue text-white'
              : 'bg-white border border-gray-200 text-gray-800 '
          }`}
        >
          <div className={`text-sm sm:text-base ${isUser ? 'whitespace-pre-wrap' : 'markdown-content'}`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Customize heading styles
                  h1: ({ node, ...props }) => <h1 className="text-xl sm:text-2xl font-bold mb-2 mt-4" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg sm:text-xl font-bold mb-2 mt-3" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base sm:text-lg font-semibold mb-2 mt-2" {...props} />,
                  // Customize paragraph styles
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                  // Customize list styles
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                  li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                  // Customize link styles
                  a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
                  // Customize code styles
                  code: ({ node, inline, ...props }: any) => 
                    inline ? (
                      <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
                    ) : (
                      <code className="block bg-gray-100 text-gray-800 p-2 rounded my-2 overflow-x-auto text-sm" {...props} />
                    ),
                  // Customize pre styles (code blocks)
                  pre: ({ node, ...props }) => <pre className="bg-gray-100 p-3 rounded my-2 overflow-x-auto" {...props} />,
                  // Customize blockquote styles
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
                  // Customize table styles
                  table: ({ node, ...props }) => <table className="border-collapse border border-gray-300 my-2" {...props} />,
                  th: ({ node, ...props }) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold" {...props} />,
                  td: ({ node, ...props }) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                  // Customize strong/bold styles
                  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                  // Customize emphasis/italic styles
                  em: ({ node, ...props }) => <em className="italic" {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onSuggestedPrompt }: { onSuggestedPrompt: (prompt: string) => void }) => (
  <div className="text-center space-y-6">
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-bcit-blue p-3 sm:p-4 rounded-full">
          <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-bcit-gold" />
        </div>
      </div>
      <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
        BCIT Feedback Helper
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4">
        I'm here to help you provide effective feedback to nursing learners based on BCCNM standards of practice.
      </p>
    </div>
    
    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
      <div className="space-y-2">
        {suggestedPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSuggestedPrompt(prompt)}
            className="w-full text-left p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 hover:border-bcit-blue rounded-lg transition-all text-xs sm:text-sm md:text-base text-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-bcit-blue focus:ring-offset-2"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export function ChatArea({ messages, onSuggestedPrompt }: ChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2 sm:px-4 md:px-6">
      {messages.length === 0 ? (
        <EmptyState onSuggestedPrompt={onSuggestedPrompt} />
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
