import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { getAIResponse, analyzeFile } from "./openai";
import { supportedLanguages } from "@shared/schema";

const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

function isAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

function isAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Chat endpoints
  app.post("/api/chat", isAuthenticated, async (req, res) => {
    try {
      const { message, language } = req.body;
      if (!message || !supportedLanguages.includes(language)) {
        return res.status(400).json({ message: "Invalid request" });
      }

      const response = await getAIResponse(message, language);
      const chat = await storage.createChat(req.user!.id, message);
      const updatedChat = await storage.updateChat(chat.id, response);
      
      res.json(updatedChat);
    } catch (error) {
      res.status(500).json({ message: "Failed to process chat" });
    }
  });

  app.get("/api/chats", isAuthenticated, async (req, res) => {
    try {
      const chats = await storage.getChats(req.user!.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  // File upload endpoints
  app.post("/api/upload", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const content = req.file.buffer.toString();
      const analysis = await analyzeFile(content, req.user!.preferredLanguage);
      
      const file = await storage.createFile(req.user!.id, {
        userId: req.user!.id,
        filename: req.file.originalname,
        type: req.file.mimetype,
        content: content,
        uploadedAt: new Date().toISOString(),
      });

      res.json({ file, analysis });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get("/api/files", isAuthenticated, async (req, res) => {
    try {
      const files = await storage.getFiles(req.user!.id);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
