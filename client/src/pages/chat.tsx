import { useState } from "react";
import { useParams } from "wouter";
import { ChatHeader } from "@/components/chat-header";
import { SettingsPanel } from "@/components/settings-panel";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { useChat } from "@/hooks/use-chat";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { ChatSettings } from "@shared/schema";

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const [settings, setSettings] = useState<ChatSettings>({
    systemPrompt: "Eres un asistente que ofrece información certera y no muy extensa sobre los temas consultados.",
    temperature: 0.9,
    maxTokens: -1,
    model: "openai/gpt-oss-20b",
    streaming: false,
  });

  const {
    currentConversation,
    messages,
    isLoading,
    error,
    sendMessage,
    startNewChat,
    clearError,
  } = useChat(conversationId, settings);

  useKeyboardShortcuts({
    onFocusInput: () => {
      const input = document.getElementById('message-input');
      input?.focus();
    },
    onSendMessage: () => {
      const form = document.getElementById('chat-form') as HTMLFormElement;
      form?.requestSubmit();
    },
    onNewChat: startNewChat,
  });

  const handleSettingsChange = (newSettings: Partial<ChatSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleSettings = () => setShowSettings(!showSettings);
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground" data-testid="chat-page">
      <SettingsPanel
        settings={settings}
        onChange={handleSettingsChange}
        isVisible={showSettings}
        hasMessages={messages.length > 0}
      />
      
      <ChatHeader
        currentConversation={currentConversation}
        settings={settings}
        onToggleSettings={toggleSettings}
        onToggleSidebar={toggleSidebar}
        onNewChat={startNewChat}
        showSettings={showSettings}
      />

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <ChatHistorySidebar 
            currentConversationId={conversationId}
          />
        )}
        
        <main className="flex-1 flex flex-col">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            error={error}
            onClearError={clearError}
          />
          
          <ChatInput
            onSendMessage={sendMessage}
            disabled={isLoading}
          />
        </main>
      </div>
    </div>
  );
}
