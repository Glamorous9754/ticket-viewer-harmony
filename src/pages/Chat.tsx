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
    <div className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)]">
      <div className="flex-1 w-full max-w-3xl mx-auto bg-background/95 rounded-xl border border-border/20 backdrop-blur-sm">
        <div className="p-4 border-b border-border/20">
          <h2 className="text-lg font-semibold text-primary-foreground">Chat Assistant</h2>
        </div>
        
        <ScrollArea className="flex-1 px-2 sm:px-4 py-6 h-[calc(100vh-16rem)]">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm sm:text-base ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-4 sm:ml-12"
                      : "bg-muted/50 text-muted-foreground border border-border/20 mr-4 sm:mr-12"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-2 sm:p-4 bg-background/95 border-t border-border/20 rounded-b-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-2 sm:gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[56px] max-h-[200px] resize-none text-sm sm:text-base 
                    bg-white/80 border-[1.5px] border-[#aaaaaa]
                    hover:border-primary/30 hover:bg-white
                    focus-visible:ring-1 focus-visible:ring-primary 
                    focus-visible:border-primary/50 focus-visible:bg-white
                    transition-all duration-200 ease-in-out
                    rounded-xl pl-3 sm:pl-4 pr-12 py-3 sm:py-4 
                    placeholder:text-muted-foreground/70"
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
                className="bg-primary hover:bg-primary/90 transition-colors h-[56px] px-4 sm:px-6 rounded-xl"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;