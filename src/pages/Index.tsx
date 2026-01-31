import { useState, useEffect, useRef } from "react";
import { Sidebar, SidebarToggle } from "@/components/Sidebar";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionChip } from "@/components/SuggestionChip";
import { HeroIcon } from "@/components/HeroIcon";
import { ChatMessage } from "@/components/ChatMessage";
import { streamChat } from "@/lib/api/chat";
import { useToast } from "@/hooks/use-toast";

const suggestions = [
  "What is SPD?",
  "List all hemostatic forceps by size",
  "What blade fits a #3 handle?",
  "Difference between Mayo and Metzenbaum scissors?",
];

type Message = { role: "user" | "assistant"; content: string };

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setIsLoading(false);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header with sidebar toggle when collapsed */}
        {sidebarCollapsed && (
          <div className="p-3">
            <SidebarToggle onClick={() => setSidebarCollapsed(false)} />
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col items-center px-4 overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Hero Section */}
              <div className="flex flex-col items-center mb-8">
                <HeroIcon />
                <h1 className="mt-4 text-3xl font-semibold text-foreground">
                  SPD Assist
                </h1>
              </div>

              {/* Chat Input */}
              <ChatInput onSend={handleSend} disabled={isLoading} />

              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {suggestions.map((suggestion) => (
                  <SuggestionChip
                    key={suggestion}
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 w-full max-w-3xl overflow-y-auto py-8 space-y-6">
                {messages.map((msg, idx) => (
                  <ChatMessage key={idx} message={msg} />
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input at bottom */}
              <div className="w-full max-w-2xl pb-8">
                <ChatInput onSend={handleSend} disabled={isLoading} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {messages.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            </div>
            <span>Powered by Chatbase</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
