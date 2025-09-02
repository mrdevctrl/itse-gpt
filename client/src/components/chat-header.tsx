import { Settings, Plus, Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import type { Conversation, ChatSettings } from "@shared/schema";

interface ChatHeaderProps {
  currentConversation?: Conversation;
  settings: ChatSettings;
  onToggleSettings: () => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  showSettings: boolean;
}

export function ChatHeader({
  currentConversation,
  settings,
  onToggleSettings,
  onToggleSidebar,
  onNewChat,
  showSettings,
}: ChatHeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between" data-testid="chat-header">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden"
          data-testid="button-toggle-sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-primary-foreground rounded-sm" />
        </div>
        
        <div>
          <h1 className="text-lg font-semibold text-foreground" data-testid="text-app-title">
            AI Chat Assistant
          </h1>
          <p className="text-xs text-muted-foreground" data-testid="text-model-info">
            Connected to {settings.model}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onNewChat}
          className="text-sm font-medium"
          data-testid="button-new-chat"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleSettings}
          data-testid="button-toggle-settings"
        >
          <Settings className={`w-4 h-4 ${showSettings ? 'text-primary' : ''}`} />
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          data-testid="button-toggle-theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
