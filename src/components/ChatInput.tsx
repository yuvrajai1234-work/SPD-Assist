import { useState } from "react";
import { Mic, MicOff, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechToText } from "@/hooks/useSpeechToText";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, placeholder = "Ask me anything...", disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const { startListening, stopListening, isListening, isConnecting } = useSpeechToText(
    (transcript) => {
      setMessage(transcript);
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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
            placeholder={isListening ? "Listening..." : placeholder}
            disabled={disabled || isListening}
            className="w-full px-4 pt-4 pb-2 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <button
              type="button"
              onClick={handleMicClick}
              disabled={disabled || isConnecting}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isListening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "hover:bg-accent text-muted-foreground"
              )}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <button
              type="submit"
              disabled={disabled || !message.trim()}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                message.trim() && !disabled
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
