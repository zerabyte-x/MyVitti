import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

export function useWebSocket() {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Send user info when connected
      ws.send(JSON.stringify({
        type: 'user_connected',
        user,
      }));
    };

    ws.onclose = () => {
      // Attempt to reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 2000);
    };

    return () => {
      ws.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    const cleanup = connect();
    return () => cleanup?.();
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const subscribe = useCallback((handler: (message: WebSocketMessage) => void) => {
    if (!wsRef.current) return;

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handler(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }, []);

  return { sendMessage, subscribe };
}
