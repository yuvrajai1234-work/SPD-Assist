import { useState, useEffect, useRef } from "react";
import { Sidebar, SidebarToggle } from "@/components/Sidebar";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionChip } from "@/components/SuggestionChip";
import { HeroIcon } from "@/components/HeroIcon";
import { ChatMessage } from "@/components/ChatMessage";
import { streamChat } from "@/lib/api/chat";
import { useToast } from "@/hooks/use-toast";
import { useConversations, useMessages, type Message } from "@/hooks/useConversations";

const suggestions = [
  "What is SPD?",
  "List all hemostatic forceps by size",
  "What blade fits a #3 handle?",
  "Difference between Mayo and Metzenbaum scissors?",
];

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    conversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
  } = useConversations();

  const { messages: dbMessages, addMessage, setMessages: setDbMessages } = useMessages(currentConversationId);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, dbMessages]);

  // Sync local messages with DB messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      setLocalMessages(dbMessages.map(m => ({ role: m.role, content: m.content })));
    }
  }, [dbMessages, currentConversationId]);

  const handleSend = async (input: string) => {
    let convId = currentConversationId;
    let isNewConversation = !convId;

    const userMsg: { role: "user" | "assistant"; content: string } = { role: "user", content: input };
    setLocalMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Create new conversation if needed
    if (isNewConversation) {
      const newId = await createConversation(input.slice(0, 50));
      if (!newId) {
        toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
        setIsLoading(false);
        setLocalMessages([]); // Revert local state
        return;
      }
      convId = newId;
      setCurrentConversationId(newId);
      await addMessage("user", input, newId);
    } else {
        if (localMessages.length === 1 && !isNewConversation) {
            // Update title for first message
            await updateConversationTitle(convId, input.slice(0, 50));
        }
        await addMessage("user", input, convId);
    }

    let assistantSoFar = "";

    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setLocalMessages((prev) => {
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
      messages: [...localMessages, userMsg],
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: async () => {
        setIsLoading(false);
        // Save assistant message to DB
        if (assistantSoFar) {
          await addMessage("assistant", assistantSoFar, convId);
        }
      },
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

  const handleSuggestionClick = async (suggestion: string) => {
    await handleNewChat();
    handleSend(suggestion);
  };

  const handleNewChat = async () => {
    setCurrentConversationId(null);
    setLocalMessages([]);
    setDbMessages([]);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    if (currentConversationId === id) {
      handleNewChat();
    }
  };

  const displayMessages = localMessages;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onNewChat={handleNewChat}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
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
          {displayMessages.length === 0 ? (
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
                {displayMessages.map((msg, idx) => (
                  <ChatMessage key={idx} message={msg} />
                ))}
                {isLoading && displayMessages[displayMessages.length - 1]?.role !== "assistant" && (
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
        
      </main>
    </div>
  );
};

export default Index;
