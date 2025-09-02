import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import type { Message } from "@shared/schema";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export function ChatMessages({ messages, isLoading, error, onClearError }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
      {/* Welcome Message */}
      {messages.length === 0 && !isLoading && (
        <div className="text-center py-8" data-testid="welcome-message">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-welcome-title">
            Welcome to AI Chat Assistant
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto" data-testid="text-welcome-description">
            Start a conversation by typing your message below. I'm here to help with any questions you have.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-start" data-testid="loading-indicator">
          <div className="max-w-3xl">
            <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-sm text-muted-foreground">Assistant is thinking...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="border-destructive/20 bg-destructive/10" data-testid="error-alert">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive-foreground flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearError}
              className="h-auto p-1 text-destructive hover:text-destructive/80"
              data-testid="button-clear-error"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
