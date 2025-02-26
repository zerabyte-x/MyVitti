import { users, chats, files, type User, type InsertUser, type Chat, type File } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createChat(userId: number, message: string): Promise<Chat> {
    const [chat] = await db.insert(chats).values({
      userId,
      messages: [{ role: "user", content: message }],
      createdAt: new Date().toISOString(),
    }).returning();
    return chat;
  }

  async updateChat(chatId: number, message: string): Promise<Chat> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
    if (!chat) throw new Error("Chat not found");

    const updatedMessages = [...chat.messages, { role: "assistant", content: message }];
    const [updatedChat] = await db
      .update(chats)
      .set({ messages: updatedMessages })
      .where(eq(chats.id, chatId))
      .returning();
    return updatedChat;
  }

  async getChats(userId: number): Promise<Chat[]> {
    return db.select().from(chats).where(eq(chats.userId, userId));
  }

  async createFile(userId: number, file: Omit<File, "id">): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async getFiles(userId: number): Promise<File[]> {
    return db.select().from(files).where(eq(files.userId, userId));
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalChats: number;
    totalFiles: number;
  }> {
    const [usersCount] = await db.select({ count: sql`count(*)` }).from(users);
    const [chatsCount] = await db.select({ count: sql`count(*)` }).from(chats);
    const [filesCount] = await db.select({ count: sql`count(*)` }).from(files);

    return {
      totalUsers: Number(usersCount?.count || 0),
      totalChats: Number(chatsCount?.count || 0),
      totalFiles: Number(filesCount?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();