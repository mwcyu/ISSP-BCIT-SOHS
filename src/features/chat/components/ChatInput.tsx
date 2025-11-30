import { useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled?: boolean;
}

export const ChatInput = ({ value, onChange, onSend, disabled }: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !disabled) {
                onSend();
            }
        }
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-4 z-20 pointer-events-none">
            <div className="max-w-3xl mx-auto relative pointer-events-auto">
                <div className="relative flex items-end gap-2 bg-white border border-gray-200 rounded-2xl p-3 shadow-xl focus-within:ring-2 focus-within:ring-bcit-blue/10 focus-within:border-bcit-blue transition-all duration-200">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message here..."
                        className="w-full max-h-[120px] py-3 px-3 bg-transparent border-none focus:ring-0 outline-none shadow-none resize-none text-gray-800 placeholder-gray-400 text-sm sm:text-base leading-relaxed scrollbar-hide"
                        rows={1}
                        disabled={disabled}
                    />
                    <button
                        onClick={onSend}
                        disabled={!value.trim() || disabled}
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
    );
};
