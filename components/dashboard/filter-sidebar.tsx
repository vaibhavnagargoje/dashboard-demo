"use client";

import { Search, MapPin, ChevronDown, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useFilterContext } from "@/lib/filter-context";

interface FilterCheckbox {
  id: string;
  label: string;
  checked: boolean;
  sublabel?: string;
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
  breakdownLevels?: BreakdownLevel[];
  onApply?: () => void;
}

const TIME_PERIODS = [
  { label: "All", range: [2012, 2021] as [number, number] },
  { label: "2012-15", range: [2012, 2015] as [number, number] },
  { label: "2016-18", range: [2016, 2018] as [number, number] },
  { label: "2019-21", range: [2019, 2021] as [number, number] },
];

export function FilterSidebar({
  open,
  onOpenChange,
  variant = "overview",
  metrics,
  breakdownLevels,
  onApply,
}: FilterSidebarProps) {
  const {
    filters,
    allDistricts,
    districtInfo,
    availableTalukas,
    setDistrict,
    toggleTaluka,
    setTalukas,
    setYearRange,
    resetFilters,
  } = useFilterContext();

  const [talukaSearch, setTalukaSearch] = useState("");
  const [breakdownLevel, setBreakdownLevel] = useState("high");
  const [districtOpen, setDistrictOpen] = useState(false);

  // Active time period index
  const activeTimePeriod = useMemo(() => {
    const idx = TIME_PERIODS.findIndex(
      (tp) => tp.range[0] === filters.yearRange[0] && tp.range[1] === filters.yearRange[1]
    );
    return idx >= 0 ? idx : 0;
  }, [filters.yearRange]);

  // Filter talukas by search
  const filteredTalukas = useMemo(
    () =>
      availableTalukas.filter((name) =>
        name.toLowerCase().includes(talukaSearch.toLowerCase())
      ),
    [availableTalukas, talukaSearch]
  );

  const isTalukaSelected = (name: string) =>
    filters.talukas.length === 0 || filters.talukas.includes(name);

  const allTalukasSelected = filters.talukas.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0 flex flex-col">
        <SheetHeader className="p-5 border-b border-border-light bg-slate-50">
          <SheetTitle className="font-display text-base font-bold text-primary">
            {variant === "funding" ? "Chart Controls" : "Select Data Points"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ── District Selection ──────────────────── */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-subtext-light mb-3">
              District
            </h4>
            <div className="relative">
              <button
                onClick={() => setDistrictOpen(!districtOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-border-light rounded-lg text-sm text-text-light hover:border-primary/50 transition-all"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  <span className="font-medium">{districtInfo.name}</span>
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-subtext-light transition-transform",
                    districtOpen && "rotate-180"
                  )}
                />
              </button>

              {districtOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-border-light rounded-lg shadow-lg overflow-hidden">
                  {allDistricts.map((d) => (
                    <button
                      key={d.slug}
                      onClick={() => {
                        setDistrict(d.slug);
                        setDistrictOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors",
                        d.slug === filters.district
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-text-light hover:bg-slate-50"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin size={12} className={d.slug === filters.district ? "text-primary" : "text-subtext-light"} />
                        {d.name}
                      </span>
                      {d.slug === filters.district && (
                        <Check size={14} className="text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-subtext-light mt-1.5">
              {districtInfo.talukas.length} talukas available
            </p>
          </div>

          {/* ── Taluka Selection ──────────────────── */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-subtext-light mb-3">
              Taluka Selection
            </h4>
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute inset-y-0 left-0 flex items-center ml-3 mt-2.5 text-subtext-light"
              />
              <input
                type="text"
                placeholder="Search Taluka..."
                value={talukaSearch}
                onChange={(e) => setTalukaSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-border-light rounded-lg bg-slate-50 text-text-light focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white placeholder:text-subtext-light/60 transition-all"
              />
            </div>

            {/* Select All toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-1.5 rounded hover:bg-slate-50 transition-colors mb-1 border-b border-border-light pb-2">
              <Checkbox
                checked={allTalukasSelected}
                onCheckedChange={() => setTalukas([])}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-sm font-medium text-primary">All Talukas</span>
              <span className="text-xs text-subtext-light ml-auto">{availableTalukas.length}</span>
            </label>

            <div className="space-y-1 max-h-44 overflow-y-auto scrollbar-hide pr-1">
              {filteredTalukas.map((name) => (
                <label
                  key={name}
                  className="flex items-center gap-3 cursor-pointer p-1.5 rounded hover:bg-slate-50 transition-colors"
                >
                  <Checkbox
                    checked={isTalukaSelected(name)}
                    onCheckedChange={() => {
                      if (allTalukasSelected) {
                        // Switch from "all" to "all except this one"
                        setTalukas(availableTalukas.filter((t) => t !== name));
                      } else {
                        toggleTaluka(name);
                      }
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className="text-sm text-text-light">{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Time Period ──────────────────── */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-subtext-light mb-3">
              Time Period
            </h4>
            <div className="flex gap-2">
              {TIME_PERIODS.map((period, i) => (
                <button
                  key={period.label}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all btn-press",
                    i === activeTimePeriod
                      ? "bg-primary text-white shadow-sm border border-primary"
                      : "bg-white border border-border-light text-subtext-light hover:bg-slate-50 hover:border-primary/50"
                  )}
                  onClick={() => setYearRange(period.range)}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Metric Categories ──────────────────── */}
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
                    <Checkbox
                      defaultChecked={m.checked}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className="text-sm text-text-light group-hover:text-primary transition-colors">
                      {m.label}
                    </span>
                    {m.sublabel && (
                      <span className="text-xs text-subtext-light ml-auto">
                        {m.sublabel}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Breakdown Level (funding) ──────────────────── */}
          {breakdownLevels && breakdownLevels.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-subtext-light mb-3">
                Breakdown Level
              </h4>
              <RadioGroup
                value={breakdownLevel}
                onValueChange={setBreakdownLevel}
                className="space-y-2"
              >
                {breakdownLevels.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-3 cursor-pointer p-1.5 rounded hover:bg-slate-50 transition-colors"
                  >
                    <RadioGroupItem value={level.value} />
                    <span className="text-sm text-text-light">
                      {level.label}
                    </span>
                  </label>
                ))}
              </RadioGroup>
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
            onClick={() => {
              resetFilters();
              onOpenChange(false);
            }}
          >
            Reset to Default
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
