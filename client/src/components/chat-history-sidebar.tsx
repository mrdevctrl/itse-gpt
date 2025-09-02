import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@shared/schema";

interface ChatHistorySidebarProps {
  currentConversationId?: string;
}

export function ChatHistorySidebar({ currentConversationId }: ChatHistorySidebarProps) {
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  });

  const formatDate = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <aside className="w-64 bg-card border-r border-border" data-testid="chat-history-sidebar">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground text-sm" data-testid="text-sidebar-title">
          Chat History
        </h2>
      </div>
      
      <ScrollArea className="h-full">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/chat/${conversation.id}`}
              className="block"
              data-testid={`link-conversation-${conversation.id}`}
            >
              <Button
                variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left h-auto p-3"
                data-testid={`button-conversation-${conversation.id}`}
              >
                <div className="w-full">
                  <div className="text-sm font-medium text-foreground truncate" data-testid={`text-conversation-title-${conversation.id}`}>
                    {conversation.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1" data-testid={`text-conversation-date-${conversation.id}`}>
                    {formatDate(conversation.updatedAt)}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
          
          {conversations.length === 0 && (
            <div className="p-4 text-center" data-testid="text-no-conversations">
              <p className="text-sm text-muted-foreground">
                No conversations yet. Start a new chat to begin.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
