import { IStorage } from "./types";
import { Chat, File, InsertUser, User } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private files: Map<number, File>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.files = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: false
    };
    this.users.set(id, user);
    return user;
  }

  async createChat(userId: number, message: string): Promise<Chat> {
    const id = this.currentId++;
    const chat: Chat = {
      id,
      userId,
      messages: [{ role: "user", content: message }],
      createdAt: new Date().toISOString(),
    };
    this.chats.set(id, chat);
    return chat;
  }

  async updateChat(chatId: number, message: string): Promise<Chat> {
    const chat = this.chats.get(chatId);
    if (!chat) throw new Error("Chat not found");
    
    const updatedChat: Chat = {
      ...chat,
      messages: [...chat.messages, { role: "assistant", content: message }],
    };
    this.chats.set(chatId, updatedChat);
    return updatedChat;
  }

  async getChats(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      (chat) => chat.userId === userId,
    );
  }

  async createFile(userId: number, file: Omit<File, "id">): Promise<File> {
    const id = this.currentId++;
    const newFile: File = { ...file, id };
    this.files.set(id, newFile);
    return newFile;
  }

  async getFiles(userId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.userId === userId,
    );
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalChats: number;
    totalFiles: number;
  }> {
    return {
      totalUsers: this.users.size,
      totalChats: this.chats.size,
      totalFiles: this.files.size,
    };
  }
}

export const storage = new MemStorage();
