import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  preferredLanguage: text("preferred_language").notNull().default("en"),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  messages: jsonb("messages").notNull().default([]),
  createdAt: text("created_at").notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferredLanguage: true,
});

export const insertChatSchema = createInsertSchema(chats);
export const insertFileSchema = createInsertSchema(files);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type File = typeof files.$inferSelect;

export const supportedLanguages = ["en", "hi", "ta"] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("user_connected"),
    user: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
  z.object({
    type: z.literal("chat_message"),
    chatId: z.number(),
    message: z.string(),
    user: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }),
  z.object({
    type: z.literal("typing"),
    chatId: z.number(),
    user: z.object({
      id: z.number(),
      username: z.string(),
    }),
    isTyping: z.boolean(),
  }),
]);

export type WebSocketMessage = z.infer<typeof wsMessageSchema>;