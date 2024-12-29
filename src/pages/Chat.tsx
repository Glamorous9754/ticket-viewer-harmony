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
    <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
      <div className="w-full max-w-4xl bg-gradient-to-b from-accent to-white rounded-xl shadow-lg p-6">
        <ScrollArea className="flex-1 mb-6 min-h-[400px]">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-4"
                      : "bg-muted text-muted-foreground mr-4"
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
          className="relative max-w-3xl mx-auto"
        >
          <div className="flex gap-2 items-end bg-white rounded-lg shadow-sm p-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[20px] max-h-[200px] resize-none text-base border-none focus-visible:ring-1 focus-visible:ring-primary/20 bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={!message.trim()}
              className="bg-primary/90 hover:bg-primary transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;