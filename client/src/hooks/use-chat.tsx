import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation, Message, ChatSettings, ChatCompletionRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useChat(conversationId: string | undefined, settings: ChatSettings) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // Fetch current conversation
  const { data: currentConversation } = useQuery({
    queryKey: ['/api/conversations', conversationId],
    enabled: !!conversationId,
  });

  // Fetch messages for current conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: Partial<Conversation>) => {
      const response = await apiRequest('POST', '/api/conversations', data);
      return response.json();
    },
    onSuccess: (conversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setLocation(`/chat/${conversation.id}`);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      // First, save the user message
      await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        role: 'user',
        content,
      });

      // Prepare chat completion request
      const conversationMessages = await queryClient.fetchQuery({
        queryKey: ['/api/conversations', conversationId, 'messages'],
      }) as Message[];

      const systemMessage = {
        role: 'system' as const,
        content: settings.systemPrompt,
      };

      const chatMessages = [
        systemMessage,
        ...conversationMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content },
      ];

      const chatRequest: ChatCompletionRequest = {
        model: settings.model,
        messages: chatMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        stream: settings.streaming,
      };

      if (settings.streaming) {
        // Handle streaming response
        const response = await fetch('/api/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatRequest),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let assistantContent = '';
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    assistantContent += content;
                    // You could update UI here for real-time display
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Save the complete assistant response
        if (assistantContent) {
          await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
            role: 'assistant',
            content: assistantContent,
          });
        }
      } else {
        // Handle regular response
        const response = await apiRequest('POST', '/api/chat/completions', chatRequest);
        const data = await response.json();

        const assistantContent = data.choices?.[0]?.message?.content;
        if (!assistantContent) {
          throw new Error('No response content received from API');
        }

        // Save assistant response
        await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
          role: 'assistant',
          content: assistantContent,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    let currentConvId = conversationId;

    // Create new conversation if needed
    if (!currentConvId) {
      const conversation = await createConversationMutation.mutateAsync({
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        systemPrompt: settings.systemPrompt,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        model: settings.model,
        streaming: settings.streaming,
      });
      currentConvId = conversation.id;
    }

    if (currentConvId) {
      await sendMessageMutation.mutateAsync({
        conversationId: currentConvId,
        content,
      });
    }
  };

  const startNewChat = () => {
    setLocation('/');
    setError(null);
  };

  const clearError = () => setError(null);

  return {
    currentConversation,
    messages,
    isLoading: sendMessageMutation.isPending || createConversationMutation.isPending,
    error,
    sendMessage,
    startNewChat,
    clearError,
  };
}
