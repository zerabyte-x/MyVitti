import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { Chat } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ChatInterfaceProps {
  chats: Chat[];
}

interface TypingUser {
  id: number;
  username: string;
}

export default function ChatInterface({ chats }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { sendMessage, subscribe } = useWebSocket();
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        message,
        language: user?.preferredLanguage
      });
      return res.json();
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setMessage("");
      // Broadcast the message via WebSocket
      sendMessage({
        type: 'chat_message',
        chatId: chat.id,
        message: chat.messages[chat.messages.length - 1].content,
        user
      });
    }
  });

  useEffect(() => {
    subscribe((message) => {
      switch (message.type) {
        case 'chat_message':
          queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
          break;
        case 'typing_status':
          setTypingUsers(prev => {
            if (message.isTyping) {
              if (prev.find(u => u.id === message.user.id)) return prev;
              return [...prev, message.user];
            } else {
              return prev.filter(u => u.id !== message.user.id);
            }
          });
          break;
      }
    });
  }, [subscribe]);

  const handleTyping = () => {
    if (typingTimeout) clearTimeout(typingTimeout);

    sendMessage({
      type: 'typing',
      chatId: chats[chats.length - 1]?.id,
      user,
      isTyping: true
    });

    setTypingTimeout(setTimeout(() => {
      sendMessage({
        type: 'typing',
        chatId: chats[chats.length - 1]?.id,
        user,
        isTyping: false
      });
    }, 2000));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !chatMutation.isPending) {
      chatMutation.mutate(message);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 p-4 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {chats.map((chat) => (
              <div key={chat.id} className="space-y-4">
                {chat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </ScrollArea>

        {typingUsers.length > 0 && (
          <div className="text-sm text-muted-foreground italic">
            {typingUsers.map(u => u.username).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Ask your question..."
            disabled={chatMutation.isPending}
          />
          <Button type="submit" disabled={chatMutation.isPending || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}