import { useAuth } from "@/hooks/use-auth";
import ChatInterface from "@/components/chat-interface";
import FileUpload from "@/components/file-upload";
import LanguageSelector from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { File, Chat } from "@shared/schema";
import { Link } from "wouter";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  
  const { data: chats } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
  });

  const { data: files } = useQuery<File[]>({
    queryKey: ["/api/files"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">iVidya</h1>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline">Admin Dashboard</Button>
              </Link>
            )}
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChatInterface chats={chats || []} />
          </div>
          <div className="space-y-8">
            <FileUpload files={files || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
