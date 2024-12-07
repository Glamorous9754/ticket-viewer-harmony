import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Chat = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Here you would typically handle the message
    console.log("Message sent:", message);
    setMessage("");
  };

  return (
    <div className="fixed inset-0 pl-64 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Support Chat</h1>
      </div>
      
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto text-center text-gray-500">
          <p>This is a simple chat interface.</p>
          <p>Start typing below to begin a conversation.</p>
        </div>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;