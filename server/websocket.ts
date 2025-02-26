import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import { User } from '@shared/schema';

interface ConnectedUser {
  ws: WebSocket;
  user: User;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private connections: Map<number, ConnectedUser> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          switch (data.type) {
            case 'user_connected':
              this.handleUserConnected(ws, data.user);
              break;
            case 'chat_message':
              this.broadcastChatMessage(data.chatId, data.message, data.user);
              break;
            case 'typing':
              this.broadcastTypingStatus(data.chatId, data.user, data.isTyping);
              break;
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });
  }

  private handleUserConnected(ws: WebSocket, user: User) {
    this.connections.set(user.id, { ws, user });
    this.broadcastUserStatus(user, true);
  }

  private handleDisconnect(ws: WebSocket) {
    for (const [userId, conn] of this.connections.entries()) {
      if (conn.ws === ws) {
        this.connections.delete(userId);
        this.broadcastUserStatus(conn.user, false);
        break;
      }
    }
  }

  private broadcastChatMessage(chatId: number, message: string, user: User) {
    const payload = JSON.stringify({
      type: 'chat_message',
      chatId,
      message,
      user,
      timestamp: new Date().toISOString(),
    });

    this.broadcast(payload);
  }

  private broadcastTypingStatus(chatId: number, user: User, isTyping: boolean) {
    const payload = JSON.stringify({
      type: 'typing_status',
      chatId,
      user,
      isTyping,
    });

    this.broadcast(payload);
  }

  private broadcastUserStatus(user: User, isOnline: boolean) {
    const payload = JSON.stringify({
      type: 'user_status',
      user,
      isOnline,
      timestamp: new Date().toISOString(),
    });

    this.broadcast(payload);
  }

  private broadcast(payload: string) {
    for (const connection of this.connections.values()) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(payload);
      }
    }
  }
}
