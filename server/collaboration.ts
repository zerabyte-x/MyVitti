
import { WebSocket } from 'ws';
import { vectorDb } from './vector_db';

interface CollaborationRoom {
  id: string;
  participants: Map<string, WebSocket>;
  messages: any[];
}

export class CollaborationSystem {
  private static rooms = new Map<string, CollaborationRoom>();

  static createRoom(roomId: string): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        participants: new Map(),
        messages: []
      });
    }
  }

  static joinRoom(roomId: string, userId: string, ws: WebSocket): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.set(userId, ws);
      this.broadcastMessage(roomId, {
        type: 'USER_JOINED',
        userId,
        timestamp: new Date().toISOString()
      });
    }
  }

  static leaveRoom(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.delete(userId);
      this.broadcastMessage(roomId, {
        type: 'USER_LEFT',
        userId,
        timestamp: new Date().toISOString()
      });
    }
  }

  private static broadcastMessage(roomId: string, message: any): void {
    const room = this.rooms.get(roomId);
    if (room) {
      const messageStr = JSON.stringify(message);
      room.participants.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
      room.messages.push(message);
    }
  }
}
