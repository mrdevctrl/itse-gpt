import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="border-t border-border bg-card p-4" data-testid="chat-input">
      <form id="chat-form" onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            id="message-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="resize-none min-h-[2.5rem] max-h-32 pr-16"
            disabled={disabled}
            data-testid="textarea-message-input"
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground" data-testid="text-character-count">
            {input.length}/4000
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!input.trim() || disabled}
          className="px-6 font-medium"
          data-testid="button-send-message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
      
      {/* Keyboard Shortcuts Hint */}
      <div className="mt-2 text-xs text-muted-foreground text-center" data-testid="text-keyboard-shortcuts">
        <span className="inline-flex items-center space-x-2">
          <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">K</kbd>
          <span>to focus input</span>
          <span className="mx-2">•</span>
          <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">Enter</kbd>
          <span>to send</span>
        </span>
      </div>
    </div>
  );
}
