import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  systemPrompt: text("system_prompt").notNull().default("Eres un asistente que ofrece información certera y no muy extensa sobre los temas consultados."),
  temperature: real("temperature").notNull().default(0.9),
  maxTokens: integer("max_tokens").notNull().default(-1),
  model: text("model").notNull().default("openai/gpt-oss-20b"),
  streaming: boolean("streaming").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant" | "system"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const updateConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type UpdateConversation = z.infer<typeof updateConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

// Chat settings type for frontend
export interface ChatSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
  streaming: boolean;
}

// API request/response types
export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}
