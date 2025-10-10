import React, { useState } from 'react';
import { PermanentSidebar } from './components/PermanentSidebar';
import { RightPanel } from './components/RightPanel';
import { ProgressModal } from './components/ProgressModal';
import { GuidelinesModal } from './components/GuidelinesModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { SettingsModal } from './components/SettingsModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { standardPrompts, generateTransitionFeedback, generateFinalFeedback } from './utils/chatResponses';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  messages: Message[];
  unread?: boolean;
  currentStandard: number;
}

export default function App() {
  const [progressOpen, setProgressOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [completedStandards, setCompletedStandards] = useState<number[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleStandard = (standardIndex: number) => {
    setCompletedStandards((prev) =>
      prev.includes(standardIndex)
        ? prev.filter((i) => i !== standardIndex)
        : [...prev, standardIndex]
    );
  };

  const getActiveConversation = () => {
    return conversations.find((c) => c.id === activeConversationId);
  };

  const getCurrentMessages = () => {
    return getActiveConversation()?.messages || [];
  };

  const createNewConversation = (firstMessage?: string) => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: firstMessage ? firstMessage.substring(0, 30) + '...' : 'New Conversation',
      preview: firstMessage || 'Start a conversation...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [],
      currentStandard: 1,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    let convId = activeConversationId;
    
    // Create new conversation if none is active
    if (!convId) {
      convId = createNewConversation(inputValue);
    }

    const currentConv = conversations.find(c => c.id === convId);
    if (!currentConv) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              preview: inputValue,
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : conv
      )
    );

    setInputValue('');

    // Store current conversation state before async operation
    const currentConvState = {
      standard: currentConv.currentStandard,
      messageCount: currentConv.messages.length
    };

    // Generate and add bot response after a short delay
    setTimeout(() => {
      // User is providing feedback - give transition feedback and move to next standard
      if (currentConvState.messageCount > 0) {
        if (currentConvState.standard < 4) {
          // First, send the transition feedback
          const feedbackMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: generateTransitionFeedback(currentConvState.standard),
            sender: 'bot',
            timestamp: new Date(),
          };
          
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === convId
                ? {
                    ...conv,
                    messages: [...conv.messages, feedbackMessage],
                    preview: feedbackMessage.content.substring(0, 50) + '...',
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  }
                : conv
            )
          );

          // Then, after another delay, send the next standard prompt
          setTimeout(() => {
            const newStandard = currentConvState.standard + 1;
            const nextStandardMessage: Message = {
              id: (Date.now() + 2).toString(),
              content: standardPrompts[newStandard as keyof typeof standardPrompts],
              sender: 'bot',
              timestamp: new Date(),
            };
            
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === convId
                  ? {
                      ...conv,
                      messages: [...conv.messages, nextStandardMessage],
                      preview: nextStandardMessage.content.substring(0, 50) + '...',
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      currentStandard: newStandard,
                    }
                  : conv
              )
            );

            // Auto-complete the standard in progress bar when moving to next
            const standardIndex = currentConvState.standard - 1;
            if (!completedStandards.includes(standardIndex)) {
              setCompletedStandards((prev) => [...prev, standardIndex]);
            }
          }, 1500);
        } else {
          // After standard 4, just give final feedback
          const finalMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: generateFinalFeedback(),
            sender: 'bot',
            timestamp: new Date(),
          };
          
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === convId
                ? {
                    ...conv,
                    messages: [...conv.messages, finalMessage],
                    preview: finalMessage.content.substring(0, 50) + '...',
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  }
                : conv
            )
          );

          // Complete standard 4
          const standardIndex = 3;
          if (!completedStandards.includes(standardIndex)) {
            setCompletedStandards((prev) => [...prev, standardIndex]);
          }
        }
      } else {
        // First message - start with Standard 1
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: standardPrompts[1],
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === convId
              ? {
                  ...conv,
                  messages: [...conv.messages, botResponse],
                  preview: botResponse.content.substring(0, 50) + '...',
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  currentStandard: 1,
                }
              : conv
          )
        );
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStandardClick = (prompt: string) => {
    // When a standard is clicked, start the guided flow with Standard 1
    let convId = activeConversationId;
    
    // Create new conversation if none is active
    if (!convId) {
      convId = createNewConversation('Start feedback session');
    }

    // Generate the first standard prompt immediately
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now().toString(),
        content: standardPrompts[1],
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === convId
            ? {
                ...conv,
                messages: [...conv.messages, botResponse],
                preview: 'Standard 1: Professionalism & Responsibility',
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                currentStandard: 1,
              }
            : conv
        )
      );
    }, 100);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar - Permanent on desktop, drawer on mobile */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50
        transform transition-transform duration-300 lg:transform-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <PermanentSidebar
          onProgressClick={() => {
            setProgressOpen(true);
            setMobileMenuOpen(false);
          }}
          onGuidelinesClick={() => {
            setGuidelinesOpen(true);
            setMobileMenuOpen(false);
          }}
          onPrivacyPolicyClick={() => {
            setPrivacyPolicyOpen(true);
            setMobileMenuOpen(false);
          }}
          onSettingsClick={() => {
            setSettingsOpen(true);
            setMobileMenuOpen(false);
          }}
          onDocumentPreviewClick={() => {
            setDocumentPreviewOpen(true);
            setMobileMenuOpen(false);
          }}
          isCollapsed={leftSidebarCollapsed}
          onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />
      </div>

      {/* Right Panel - Chat Area */}
      <div className="flex-1 flex flex-col">
        <RightPanel
          messages={getCurrentMessages()}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          onStandardClick={handleStandardClick}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
          onMobileBackClick={() => {}}
          showMobileControls={true}
          onToggleSidebar={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />
      </div>

      {/* Modals */}
      <ProgressModal
        isOpen={progressOpen}
        onClose={() => setProgressOpen(false)}
        completedStandards={completedStandards}
        onToggleStandard={toggleStandard}
        currentStandard={getActiveConversation()?.currentStandard}
      />

      <GuidelinesModal
        isOpen={guidelinesOpen}
        onClose={() => setGuidelinesOpen(false)}
      />

      <PrivacyPolicyModal
        isOpen={privacyPolicyOpen}
        onClose={() => setPrivacyPolicyOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <DocumentPreviewModal
        isOpen={documentPreviewOpen}
        onClose={() => setDocumentPreviewOpen(false)}
      />
    </div>
  );
}