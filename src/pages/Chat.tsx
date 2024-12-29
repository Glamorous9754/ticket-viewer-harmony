import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message
    const newMessage: Message = {
      role: "user",
      content: message.trim()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    
    // TODO: Implement AI response logic
    // For now, add a mock response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "This is a placeholder response. The AI integration will be implemented soon."
      }]);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-6rem)] px-6">
      <div className="w-full max-w-4xl bg-background rounded-lg border border-border">
        <ScrollArea className="flex-1 p-6 min-h-[500px] max-h-[calc(100vh-12rem)]">
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 text-base ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <form
          onSubmit={handleSubmit}
          className="border-t border-border p-4"
        >
          <div className="flex gap-3 items-end max-w-3xl mx-auto">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[56px] max-h-[200px] resize-none text-base border-border focus-visible:ring-1 focus-visible:ring-primary/20"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              size="lg"
              disabled={!message.trim()}
              className="bg-primary hover:bg-primary/90 transition-colors h-[56px] px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;