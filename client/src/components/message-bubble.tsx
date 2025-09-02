import { format } from "date-fns";
import { MarkdownRenderer } from "./markdown-renderer";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timestamp = format(new Date(message.timestamp), 'h:mm a');

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in slide-in-from-bottom-2 duration-300`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      <div className="max-w-3xl">
        <div
          className={`rounded-lg px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border'
          }`}
          data-testid={`bubble-${message.role}`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed" data-testid="text-user-message">
              {message.content}
            </p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
        <div 
          className={`text-xs text-muted-foreground mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
          data-testid={`timestamp-${message.role}`}
        >
          {isUser ? 'You' : 'Assistant'} • {timestamp}
        </div>
      </div>
    </div>
  );
}
