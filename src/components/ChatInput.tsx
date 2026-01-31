import { useState } from "react";
import { Smile, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({ onSend, placeholder = "Ask me anything..." }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className="chat-input-wrapper w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 pt-4 pb-2 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <button
              type="button"
              className="p-1 rounded-md hover:bg-accent transition-colors"
            >
              <Smile className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              type="submit"
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                message.trim()
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
