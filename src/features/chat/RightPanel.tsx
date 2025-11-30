import { Bot, Menu } from "lucide-react";
import { Message, Standard } from "../../types";
import { ChatArea } from "./components/ChatArea";
import { ChatInput } from "./components/ChatInput";

interface RightPanelProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onStandardClick?: (standard: Standard) => void;
  onMobileMenuClick?: () => void;
  showMobileControls?: boolean;
}

export function RightPanel({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onStandardClick,
  onMobileMenuClick,
  showMobileControls = false,
}: RightPanelProps) {
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
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-bcit-blue to-bcit-dark flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm leading-tight">Clinical Feedback Helper</h2>
              <p className="text-xs text-gray-500 font-medium">Because giving feedback should be easy.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <ChatArea
        messages={messages}
        onStandardClick={onStandardClick}
        onSuggestedPrompt={(prompt) => onInputChange(prompt)}
      />

      {/* Input Area */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSendMessage}
      />
    </div>
  );
}
