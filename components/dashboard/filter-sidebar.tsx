"use client";

import { Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FilterCheckbox {
  id: string;
  label: string;
  checked: boolean;
  sublabel?: string;
}

interface FilterTaluka {
  name: string;
  selected: boolean;
  value?: string;
}

interface BreakdownLevel {
  label: string;
  value: string;
}

interface FilterSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "overview" | "milk" | "infra" | "funding" | "health";
  metrics?: FilterCheckbox[];
  talukas?: FilterTaluka[];
  timePeriods?: string[];
  breakdownLevels?: BreakdownLevel[];
  onApply?: () => void;
}

export function FilterSidebar({
  open,
  onOpenChange,
  variant = "overview",
  metrics,
  talukas,
  timePeriods,
  breakdownLevels,
  onApply,
}: FilterSidebarProps) {
  const [talukaSearch, setTalukaSearch] = useState("");
  const [activeTimePeriod, setActiveTimePeriod] = useState(0);
  const [breakdownLevel, setBreakdownLevel] = useState("high");

  const filteredTalukas = talukas?.filter(
    (t) => t.name.toLowerCase().includes(talukaSearch.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0 flex flex-col">
        <SheetHeader className="p-5 border-b border-border-light bg-slate-50">
          <SheetTitle className="font-display text-base font-bold text-primary">
            {variant === "funding" ? "Chart Controls" : "Select Data Points"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Metric Categories */}
          {metrics && metrics.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-subtext-light mb-3">
                {variant === "infra" ? "Available Data Points" : "Metric Categories"}
              </h4>
              <div className="space-y-2.5">
                {metrics.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 cursor-pointer group p-1 rounded hover:bg-slate-50 transition-colors"
                  >
                    <Checkbox defaultChecked={m.checked} className="data-[state=checked]:bg-primary" />
                    <span className="text-sm text-text-light group-hover:text-primary transition-colors">
                      {m.label}
                    </span>
                    {m.sublabel && (
                      <span className="text-xs text-subtext-light ml-auto">{m.sublabel}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Breakdown Level (funding) */}
          {breakdownLevels && breakdownLevels.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-subtext-light mb-3">
                Breakdown Level
              </h4>
              <RadioGroup value={breakdownLevel} onValueChange={setBreakdownLevel} className="space-y-2">
                {breakdownLevels.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-3 cursor-pointer p-1.5 rounded hover:bg-slate-50 transition-colors"
                  >
                    <RadioGroupItem value={level.value} />
                    <span className="text-sm text-text-light">{level.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Taluka Selection */}
          {talukas && talukas.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-subtext-light mb-3">
                Taluka Selection
              </h4>
              <div className="relative mb-3">
                <Search size={14} className="absolute inset-y-0 left-0 flex items-center ml-3 mt-2.5 text-subtext-light" />
                <input
                  type="text"
                  placeholder="Search Taluka..."
                  value={talukaSearch}
                  onChange={(e) => setTalukaSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-border-light rounded-lg bg-slate-50 text-text-light focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white placeholder:text-subtext-light/60 transition-all"
                />
              </div>
              <div className="space-y-1 max-h-44 overflow-y-auto scrollbar-hide pr-1">
                {filteredTalukas?.map((t) => (
                  <label
                    key={t.name}
                    className="flex items-center gap-3 cursor-pointer p-1.5 rounded hover:bg-slate-50 transition-colors"
                  >
                    <Checkbox defaultChecked={t.selected} className="data-[state=checked]:bg-primary" />
                    <span className="text-sm text-text-light">{t.name}</span>
                    {t.value && (
                      <span className="text-xs text-subtext-light ml-auto">{t.value}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Time Period (overview) */}
          {timePeriods && timePeriods.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-subtext-light mb-3">
                Time Period
              </h4>
              <div className="flex gap-2">
                {timePeriods.map((period, i) => (
                  <button
                    key={period}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all btn-press",
                      i === activeTimePeriod
                        ? "bg-primary text-white shadow-sm border border-primary"
                        : "bg-white border border-border-light text-subtext-light hover:bg-slate-50 hover:border-primary/50"
                    )}
                    onClick={() => setActiveTimePeriod(i)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border-light bg-slate-50 space-y-2">
          <button
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm transition-colors btn-press"
            onClick={() => {
              onApply?.();
              onOpenChange(false);
            }}
          >
            {variant === "overview" ? "Apply Filters" : "Update View"}
          </button>
          <button
            className="w-full py-2 text-sm text-subtext-light hover:text-primary font-medium transition-colors btn-press"
            onClick={() => onOpenChange(false)}
          >
            Reset to Default
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
