"use client";

import { cn } from "@/lib/utils";

export interface ViewModeTabsProps {
  modes?: string[];
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export function ViewModeTabs({ modes = ["chart", "table", "map"], activeMode, onModeChange }: ViewModeTabsProps) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5">
      {modes.map((mode) => (
        <button
          key={mode}
          className={cn(
            "px-4 py-1.5 text-xs font-medium rounded-md transition-all btn-press",
            activeMode === mode
              ? "bg-white text-primary shadow-sm"
              : "text-subtext-light hover:text-primary"
          )}
          onClick={() => onModeChange(mode)}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
