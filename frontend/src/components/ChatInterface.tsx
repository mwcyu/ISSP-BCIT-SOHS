import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, CheckCircle } from 'lucide-react';
import { Message, FeedbackSection, ChatResponse } from '../types';
import { ChatbotService } from '../services/api';

interface ChatInterfaceProps {
  sessionId: string;
  sections: FeedbackSection[];
}

const ChatInterface = ({ sessionId, sections }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentSection, setCurrentSection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send initial greeting when component mounts
    if (sections.length > 0 && messages.length === 0) {
      const initialMessage: Message = {
        id: `msg-${Date.now()}`,
        content: `Welcome to the Nursing Feedback AI Chatbot! 🏥\n\n🔒 **PRIVACY NOTICE**: This session is completely anonymous. We do not collect or store any personal information including names, facility names, or patient identifiers. All feedback is anonymized and used solely for educational purposes.\n\nI'm here to help you provide comprehensive feedback for your nursing student. We'll work through structured sections to ensure thorough evaluation.\n\n**Section 1: ${sections[0]?.title}**\n${sections[0]?.description}\n\nTo get started, please share your observations about the student's clinical knowledge application. Focus on behaviors and skills rather than specific individuals or situations.`,
        role: 'assistant',
        timestamp: new Date(),
        section_id: 1
      };
      setMessages([initialMessage]);
    }
  }, [sections, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      section_id: currentSection
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response: ChatResponse = await ChatbotService.sendMessage({
        session_id: sessionId,
        message: inputValue,
        section_id: currentSection
      });

      setIsTyping(false);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
        section_id: response.current_section
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentSection(response.current_section);

      // If section is complete, show completion status
      if (response.is_section_complete && response.next_action === 'next_section') {
        setTimeout(() => {
          const nextSectionMessage: Message = {
            id: `msg-${Date.now()}-next`,
            content: `✅ **Section ${currentSection} Complete!**\n\nMoving to **Section ${response.current_section}: ${sections[response.current_section - 1]?.title}**\n\n${sections[response.current_section - 1]?.description}`,
            role: 'assistant',
            timestamp: new Date(),
            section_id: response.current_section
          };
          setMessages(prev => [...prev, nextSectionMessage]);
        }, 1000);
      }

    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        content: 'Sorry, I encountered an error. Please try again or check if the backend server is running.',
        role: 'assistant',
        timestamp: new Date(),
        section_id: currentSection
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCurrentSectionInfo = () => {
    return sections.find(section => section.id === currentSection);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-primary-50">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">
            Section {currentSection}: {getCurrentSectionInfo()?.title}
          </h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {getCurrentSectionInfo()?.description}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`message-bubble ${
                message.role === 'user' ? 'user-message' : 'bot-message'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bot-message message-bubble typing-indicator">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Share your observations for ${getCurrentSectionInfo()?.title} (focus on behaviors and skills, avoid names)...`}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;