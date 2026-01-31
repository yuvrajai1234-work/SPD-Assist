import { cn } from "@/lib/utils";

interface SuggestionChipProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export function SuggestionChip({ label, onClick, className }: SuggestionChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm border border-border rounded-full",
        "bg-background hover:bg-accent transition-colors",
        "text-foreground",
        className
      )}
    >
      {label}
    </button>
  );
}
