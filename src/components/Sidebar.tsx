import { PlusCircle, PanelLeftClose, PanelLeft, Moon, Sun, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/useConversations";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onNewChat: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function Sidebar({
  isCollapsed,
  onToggle,
  isDark,
  onToggleTheme,
  onNewChat,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-background border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-0 overflow-hidden" : "w-[220px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 h-14">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          </div>
          <span className="font-medium text-sm">SPD Assist</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          <PanelLeftClose className="w-1 h-10 text-muted-foreground" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-2">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 text-sm text-foreground hover:bg-accent rounded-md px-2 py-1.5 w-full transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New chat</span>
        </button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-2 text-sm rounded-md px-2 py-1.5 w-full transition-colors cursor-pointer",
                currentConversationId === conv.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-opacity"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-md hover:bg-accent transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </aside>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-md hover:bg-accent transition-colors"
    >
      <PanelLeft className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}
