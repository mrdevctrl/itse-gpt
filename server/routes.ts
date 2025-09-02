import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema, updateConversationSchema } from "@shared/schema";
import type { ChatCompletionRequest, ChatCompletionResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Conversations endpoints
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  app.patch("/api/conversations/:id", async (req, res) => {
    try {
      const validatedData = updateConversationSchema.parse(req.body);
      const conversation = await storage.updateConversation(req.params.id, validatedData);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteConversation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Messages endpoints
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        conversationId: req.params.id,
      };
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Chat completion proxy to external API
  app.post("/api/chat/completions", async (req, res) => {
    try {
      const { model, messages, temperature, max_tokens, stream } = req.body as ChatCompletionRequest;
      
      const requestBody = {
        model,
        messages,
        temperature,
        max_tokens,
        stream,
      };

      const response = await fetch("http://20.122.69.232:1234/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          message: `API Error: ${response.status} ${response.statusText}`,
          details: errorText 
        });
      }

      if (stream) {
        // Handle streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const reader = response.body?.getReader();
        if (!reader) {
          return res.status(500).json({ message: "Failed to read stream" });
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            res.write(chunk);
          }
        } finally {
          reader.releaseLock();
          res.end();
        }
      } else {
        // Handle regular response
        const data: ChatCompletionResponse = await response.json();
        res.json(data);
      }
    } catch (error) {
      console.error("Chat completion error:", error);
      res.status(500).json({ 
        message: "Failed to process chat completion",
        suggestion: "Verify that the endpoint allows CORS or use a proxy HTTPS connection"
      });
    }
  });

  // Clear conversation messages (for new chat functionality)
  app.delete("/api/conversations/:id/messages", async (req, res) => {
    try {
      const deleted = await storage.deleteMessages(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
