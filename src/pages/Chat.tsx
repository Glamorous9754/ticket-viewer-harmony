import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 1. On first render, retrieve the conversation from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("conversationHistory");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // 2. Whenever `messages` changes, store them in localStorage
  useEffect(() => {
    localStorage.setItem("conversationHistory", JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const newMessage: Message = {
      role: "user",
      content: message.trim(),
    };

    // Add the new user message to state
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Example: Get user data from Supabase (if needed)
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error("Failed to get user data");
      }

      // Example: Ensure user is logged in
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("You must be logged in to fetch tickets");
      }

      // 3. Send the entire conversation (including the new user message) in the request body
      const response = await fetch(
        "https://iedlbysyadijjcpwgbvd.supabase.co/functions/v1/chat-bot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            conversationHistory: [...messages, newMessage],
            query: message.trim(),
            profile_id: userData.user.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const aiResponse = data.summary;
      console.log("AI Response:", data);

      // 4. Add the AI’s response to the conversation
      if (aiResponse) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: aiResponse,
          },
        ]);
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-1 w-full max-w-3xl mx-auto bg-background/95 rounded-xl border border-border/20 backdrop-blur-sm">
        <div className="p-4 border-b border-border/20">
          <h2 className="text-lg font-semibold text-primary-foreground">
            Chat Assistant
          </h2>
        </div>

        <ScrollArea className="flex-1 px-4 py-6 h-[calc(100vh-16rem)]">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-base ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-muted/50 text-muted-foreground border border-border/20 mr-12"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-base bg-muted/50 text-muted-foreground border border-border/20 mr-12">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background/95 border-t border-border/20 rounded-b-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[56px] max-h-[200px] resize-none text-base 
                    bg-white/80 border-[1.5px] border-[#aaaaaa]
                    hover:border-primary/30 hover:bg-white
                    focus-visible:ring-1 focus-visible:ring-primary 
                    focus-visible:border-primary/50 focus-visible:bg-white
                    transition-all duration-200 ease-in-out
                    rounded-xl pl-4 pr-12 py-4 
                    placeholder:text-muted-foreground/70"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!message.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 transition-colors h-[56px] px-6 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
