import { type Conversation, type Message, type InsertConversation, type InsertMessage, type UpdateConversation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: UpdateConversation): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;
  
  // Messages
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessages(conversationId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: UpdateConversation): Promise<Conversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;

    const updated: Conversation = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const deleted = this.conversations.delete(id);
    if (deleted) {
      // Delete all messages for this conversation
      const messagesToDelete = Array.from(this.messages.values())
        .filter(msg => msg.conversationId === id);
      messagesToDelete.forEach(msg => this.messages.delete(msg.id));
    }
    return deleted;
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);

    // Update conversation's updatedAt timestamp
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      this.conversations.set(conversation.id, {
        ...conversation,
        updatedAt: new Date(),
      });
    }

    return message;
  }

  async deleteMessages(conversationId: string): Promise<boolean> {
    const messagesToDelete = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId);
    
    messagesToDelete.forEach(msg => this.messages.delete(msg.id));
    return messagesToDelete.length > 0;
  }
}

export const storage = new MemStorage();
