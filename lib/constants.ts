// ── Dashboard Color Palette (matching HTML designs) ─────
export const COLORS = {
  primary: "#3c4e6a",
  secondary: "#008450",
  backgroundLight: "#f8f9fb",
  surfaceLight: "#ffffff",
  borderLight: "#e2e5ea",
  textLight: "#1e293b",
  subtextLight: "#64748b",
  chartLine1: "#2c699a",
  chartLine2: "#cf5c36",
  accentEmerald: "#10b981",
  stateAvg: "#d4af37",
  owidBlue: "#002147",
  gridColor: "#e2e5ea",
  slateLight: "#f1f5f9",
} as const;

// ── Chart Color Arrays ──────────────────────────────────
export const LIVESTOCK_COLORS = ["#3c4e6a", "#2c699a", "#008450", "#cf5c36"];
export const LIVESTOCK_LABELS = ["Cattle", "Buffalo", "Goat", "Sheep & Others"];

export const WATERFALL_COLORS = {
  total: "#3c4e6a",
  expense: "#94a3b8",
  balance: "#008450",
  expenseHover: "#64748b",
  totalHover: "#2d3d55",
  balanceHover: "#006b40",
};

export const WATERFALL_DETAILED_COLORS = {
  total: "#3c4e6a",
  expense: "#ef4444",
  balance: "#10b981",
};

export const MILK_SERIES_COLORS = {
  districtAvg: "#3c4e6a",
  stateAvg: "#d4af37",
  sangamner: "#2c699a",
  kopargaon: "#10b981",
};

export const INFRA_SERIES_COLORS = {
  vaccinations: "#008450",
  clinics: "#3c4e6a",
  stateAvg: "#a1a1aa",
  target2025: "#10b981",
};

// ── Gradient Definitions ────────────────────────────────
export const GRADIENTS = {
  vaccination: {
    start: "rgba(0, 132, 80, 0.12)",
    end: "rgba(0, 132, 80, 0)",
  },
  milkTrend: {
    start: "rgba(60, 78, 106, 0.10)",
    end: "rgba(60, 78, 106, 0)",
  },
  coldStorage: {
    start: "rgba(212, 175, 55, 0.1)",
    end: "rgba(212, 175, 55, 0)",
  },
  fisheries: {
    start: "rgba(44, 105, 154, 0.1)",
    end: "rgba(44, 105, 154, 0)",
  },
};

// ── Icon Mapping (Material Symbols → Lucide) ────────────
export const ICON_MAP: Record<string, string> = {
  dashboard: "LayoutDashboard",
  pets: "PawPrint",
  water_drop: "Droplets",
  local_shipping: "Truck",
  medical_services: "Stethoscope",
  account_balance: "Landmark",
  map: "MapIcon",
  download: "Download",
  settings: "Settings",
  summarize: "FileText",
  logout: "LogOut",
  search: "Search",
  notifications: "Bell",
  filter_list: "SlidersHorizontal",
  open_in_new: "ExternalLink",
  trending_up: "TrendingUp",
  trending_down: "TrendingDown",
  vaccines: "Syringe",
  fullscreen: "Maximize",
  refresh: "RefreshCw",
  close: "X",
  play_arrow: "Play",
  pause: "Pause",
  share: "Share2",
  print: "Printer",
  arrow_back: "ArrowLeft",
  check: "Check",
  chevron_down: "ChevronDown",
  storefront: "Store",
  ac_unit: "Snowflake",
  flag: "Flag",
  emoji_events: "Trophy",
  groups: "Users",
  domain: "Building",
  local_hospital: "Hospital",
  biotech: "FlaskConical",
  phishing: "Fish",
  account_balance_wallet: "Wallet",
  savings: "PiggyBank",
};

// ── Fiscal Year Options ─────────────────────────────────
export const FISCAL_YEARS = [
  "FY 2023-24",
  "FY 2022-23",
  "FY 2021-22",
  "FY 2020-21",
];
