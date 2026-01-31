import { useState, useEffect } from "react";
import { Sidebar, SidebarToggle } from "@/components/Sidebar";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionChip } from "@/components/SuggestionChip";
import { HeroIcon } from "@/components/HeroIcon";

const suggestions = [
  "What is SPD?",
  "Equipments used in SPD?",
  "Stages in SPD?",
];

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleSend = (message: string) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    // Simulate assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `You asked: "${message}". This is a demo response.` },
      ]);
    }, 500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
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
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {messages.length === 0 ? (
            <>
              {/* Hero Section */}
              <div className="flex flex-col items-center mb-8">
                <HeroIcon />
                <h1 className="mt-4 text-3xl font-semibold text-foreground">
                  SPD Assist
                </h1>
              </div>

              {/* Chat Input */}
              <ChatInput onSend={handleSend} />

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
            </>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 w-full max-w-2xl overflow-y-auto py-8 space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input at bottom */}
              <div className="w-full pb-8">
                <ChatInput onSend={handleSend} />
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
