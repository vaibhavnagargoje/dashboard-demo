import { LucideIcon } from "lucide-react";

// ── Navigation ──────────────────────────────────────────
export interface NavItem {
  icon: string; // lucide icon name
  label: string;
  path: string;
  page: string; // unique page identifier
}

export interface QuickAction {
  icon: string;
  label: string;
  path?: string;
  onClick?: string;
}

// ── KPI Cards ───────────────────────────────────────────
export interface KpiTrend {
  direction: "up" | "down" | "neutral";
  value: string;
  context: string;
}

export interface KpiProgress {
  value: number;
  label: string;
}

export interface KpiCardData {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  trend?: KpiTrend;
  progress?: KpiProgress;
  href?: string;
}

// ── Charts ──────────────────────────────────────────────
export interface LivestockBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface ServiceTrendPoint {
  month: string;
  vaccinations: number;
  aiServices: number;
}

export interface MilkTrendPoint {
  year: string;
  districtAvg: number;
  stateAvg: number;
  sangamner: number;
  kopargaon: number;
}

export interface FundingWaterfallItem {
  category: string;
  base: number;
  value: number;
  type: "total" | "expense" | "balance";
}

export interface InfraDataPoint {
  year: string;
  vaccinations: number;
  clinics: number;
  stateAvg?: number;
  target2025?: number;
}

// ── Related Metrics / Mini Charts ───────────────────────
export interface MiniChartData {
  label: string;
  value: number;
}

export interface RelatedMetricCard {
  title: string;
  subtitle: string;
  icon: string;
  chartType: "bar" | "donut" | "area";
  data: MiniChartData[];
  colors?: string[];
}

// ── Taluka ──────────────────────────────────────────────
export interface TalukaData {
  name: string;
  milkProduction?: number;
  vetFacilities?: number;
  cooperatives?: number;
  selected?: boolean;
}

// ── Notifications ───────────────────────────────────────
export interface NotificationItem {
  id: string;
  message: string;
  highlight?: string;
  time: string;
  type: "info" | "success" | "warning";
  read: boolean;
}

// ── Filter Configuration ────────────────────────────────
export interface MetricCategory {
  id: string;
  label: string;
  checked: boolean;
}

export interface FilterConfig {
  metricCategories?: MetricCategory[];
  talukas?: TalukaData[];
  timePeriods?: string[];
  breakdownLevels?: { label: string; value: string }[];
}

// ── Table ───────────────────────────────────────────────
export interface TableColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  mono?: boolean;
}

export interface TableRow {
  [key: string]: string | number;
}

export interface StatusBadge {
  label: string;
  color: string;
}

// ── Chart Series Configuration ──────────────────────────
export interface ChartSeries {
  dataKey: string;
  name: string;
  color: string;
  dashed?: boolean;
  fill?: boolean;
  pointRadius?: number;
  hidden?: boolean;
  yAxisId?: string;
}
