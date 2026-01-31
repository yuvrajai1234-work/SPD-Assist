import { useState } from "react";
import { PlusCircle, PanelLeftClose, PanelLeft, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isDark, onToggleTheme }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-background border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-0 overflow-hidden" : "w-[180px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 h-14">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-2">
        <button className="flex items-center gap-2 text-sm text-foreground hover:bg-accent rounded-md px-2 py-1.5 w-full transition-colors">
          <PlusCircle className="w-4 h-4" />
          <span>New chat</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

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
