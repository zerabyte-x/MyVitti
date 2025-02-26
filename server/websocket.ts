import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';
import { User, WebSocketMessage, wsMessageSchema } from '@shared/schema';

interface ConnectedUser {
  ws: WebSocket;
  user: User;
}

// Placeholder for CollaborationSystem -  Implementation details omitted as they are outside the scope of the provided code.
class CollaborationSystem {
  static joinRoom(roomId: number, userId: number, ws: WebSocket) {
    console.log(`User ${userId} joined room ${roomId}`);
    // Add user to room in database or other system
  }

  static leaveRoom(roomId: number, userId: number) {
    console.log(`User ${userId} left room ${roomId}`);
    // Remove user from room in database or other system
  }
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
            case 'JOIN_ROOM':
              CollaborationSystem.joinRoom(data.roomId, data.userId, ws);
              break;
            case 'LEAVE_ROOM':
              CollaborationSystem.leaveRoom(data.roomId, data.userId);
              break;
            case 'CHAT_MESSAGE':
              // Handle chat messages -  Implementation details omitted as they are outside the scope of the provided code.
              break;
            default:
              console.warn('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('WebSocket message handling error:', error);
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
    for (const [userId, conn] of this.connections) {
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