import { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Standard } from '../../../types';
import rehypeRaw from 'rehype-raw';
import { StandardCard } from './StandardCard';

interface ChatAreaProps {
  messages: Message[];
  onSuggestedPrompt: (prompt: string) => void;
  onStandardClick?: (standard: Standard) => void;
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

// Reusable Avatar Component
const Avatar = ({ sender }: { sender: 'user' | 'bot' }) => {
  // ... (Avatar implementation)
  const isUser = sender === 'user';
  return (
    <div
      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm mt-1 ${isUser ? 'bg-bcit-gold' : 'bg-white border border-gray-200'
        }`}
    >
      {isUser ? (
        <User className="w-5 h-5 text-bcit-dark" />
      ) : (
        <Bot className="w-5 h-5 text-bcit-blue" />
      )}
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }: { message: Message }) => {
  // ... (MessageBubble implementation)
  const isUser = message.sender === 'user';

  const rawContent = typeof message.content === 'string' ? message.content : String(message.content || '');
  const content = rawContent
    .replace(/\\n/g, '\n')
    .replace(/\n(?!\s*([*-]|\d+\.)\s)/g, '  \n');

  return (
    <div
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <Avatar sender={message.sender} />

      <div className={`flex-1 max-w-[85%] sm:max-w-[75%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block p-4 sm:p-5 rounded-2xl shadow-sm text-left ${isUser
            ? 'bg-bcit-blue text-white rounded-tr-none'
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
            }`}
        >
          <div className={`text-sm sm:text-base ${isUser ? 'whitespace-pre-wrap' : 'markdown-content'}`}>
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none text-gray-800 prose-headings:font-bold prose-a:text-bcit-blue prose-strong:text-bcit-blue">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-xl sm:text-2xl font-bold mb-2 mt-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg sm:text-xl font-bold mb-2 mt-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base sm:text-lg font-semibold mb-2 mt-2" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
                    code: ({ node, inline, ...props }: any) =>
                      inline ? (
                        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
                      ) : (
                        <code className="block bg-gray-100 text-gray-800 p-2 rounded my-2 overflow-x-auto text-sm" {...props} />
                      ),
                    pre: ({ node, ...props }) => <pre className="bg-gray-100 p-3 rounded my-2 overflow-x-auto" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
                    table: ({ node, ...props }) => <table className="border-collapse border border-gray-300 my-2" {...props} />,
                    th: ({ node, ...props }) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold" {...props} />,
                    td: ({ node, ...props }) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        <p className={`text-[10px] sm:text-xs mt-2 font-medium ${isUser ? 'text-gray-400 mr-1' : 'text-gray-400 ml-1'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div >
  );
};

// Empty State Component
const EmptyState = ({ onStandardClick }: { onStandardClick?: (standard: Standard) => void }) => (
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
);

export function ChatArea({ messages, onStandardClick }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
      {messages.length === 0 ? (
        <EmptyState onStandardClick={onStandardClick} />
      ) : (
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {/* Spacer for input area */}
          <div className="h-24" />
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
