"use client";

import { RefreshCw, Maximize } from "lucide-react";

export function DataStatusBar() {
  return (
    <div className="flex items-center justify-between bg-white border border-border-light rounded-lg px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-dot" />
          <span className="text-xs font-medium text-emerald-600">Live</span>
        </div>
        <span className="text-xs text-subtext-light">
          Last updated: 21 Feb 2026, 10:30 AM IST
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="text-xs text-subtext-light hover:text-primary transition-colors flex items-center gap-1 btn-press"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={12} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button
          className="text-xs text-primary font-medium hover:underline btn-press hidden sm:flex items-center gap-1"
          onClick={() => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
          }}
        >
          <Maximize size={12} />
          Fullscreen
        </button>
      </div>
    </div>
  );
}
