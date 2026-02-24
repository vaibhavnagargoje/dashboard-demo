"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import districtsData from "@/data/districts.json";

// ── Types ────────────────────────────────────────────────
export interface DistrictInfo {
  slug: string;
  name: string;
  center: [number, number];
  zoom: number;
  talukas: { name: string; lng: number; lat: number }[];
}

export interface FilterState {
  district: string;        // district slug
  talukas: string[];       // selected taluka names (empty = all)
  yearRange: [number, number]; // [start, end]
  metrics: string[];       // selected metric dataKeys (empty = all)
}

interface FilterContextValue {
  // Current state
  filters: FilterState;
  districtInfo: DistrictInfo;
  allDistricts: DistrictInfo[];

  // Actions
  setDistrict: (slug: string) => void;
  setTalukas: (talukas: string[]) => void;
  toggleTaluka: (name: string) => void;
  setYearRange: (range: [number, number]) => void;
  setMetrics: (metrics: string[]) => void;
  resetFilters: () => void;

  // Convenience
  isAllTalukas: boolean;
  availableTalukas: string[];
}

// ── Defaults ─────────────────────────────────────────────
const DEFAULT_DISTRICT = "ahilyanagar";
const DEFAULT_YEAR_RANGE: [number, number] = [2012, 2021];

const allDistricts = districtsData.districts as DistrictInfo[];

function getDistrictInfo(slug: string): DistrictInfo {
  return allDistricts.find((d) => d.slug === slug) || allDistricts[0];
}

function getDefaultFilters(): FilterState {
  return {
    district: DEFAULT_DISTRICT,
    talukas: [],
    yearRange: DEFAULT_YEAR_RANGE,
    metrics: [],
  };
}

// ── Context ──────────────────────────────────────────────
const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters);

  const districtInfo = useMemo(() => getDistrictInfo(filters.district), [filters.district]);

  const availableTalukas = useMemo(
    () => districtInfo.talukas.map((t) => t.name),
    [districtInfo],
  );

  const isAllTalukas = filters.talukas.length === 0;

  const setDistrict = useCallback((slug: string) => {
    setFilters((prev) => ({
      ...prev,
      district: slug,
      talukas: [], // reset taluka selection when district changes
    }));
  }, []);

  const setTalukas = useCallback((talukas: string[]) => {
    setFilters((prev) => ({ ...prev, talukas }));
  }, []);

  const toggleTaluka = useCallback((name: string) => {
    setFilters((prev) => {
      const current = prev.talukas;
      const next = current.includes(name)
        ? current.filter((t) => t !== name)
        : [...current, name];
      return { ...prev, talukas: next };
    });
  }, []);

  const setYearRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, yearRange: range }));
  }, []);

  const setMetrics = useCallback((metrics: string[]) => {
    setFilters((prev) => ({ ...prev, metrics }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      districtInfo,
      allDistricts,
      setDistrict,
      setTalukas,
      toggleTaluka,
      setYearRange,
      setMetrics,
      resetFilters,
      isAllTalukas,
      availableTalukas,
    }),
    [filters, districtInfo, availableTalukas, isAllTalukas, setDistrict, setTalukas, toggleTaluka, setYearRange, setMetrics, resetFilters],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilterContext() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilterContext must be used within <FilterProvider>");
  return ctx;
}
