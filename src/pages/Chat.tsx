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
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex-1 w-full max-w-3xl mx-auto bg-background/95 rounded-xl border border-border/20 backdrop-blur-sm">
        <div className="p-4 border-b border-border/20">
          <h2 className="text-lg font-semibold text-primary-foreground">Chat Assistant</h2>
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
                  className="min-h-[56px] max-h-[200px] resize-none text-base bg-background border-border/30 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl pl-4 pr-12 py-4"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                disabled={!message.trim()}
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