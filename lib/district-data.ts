/**
 * District Data Loader
 * ────────────────────
 * Maps (sector, district) → static JSON import.
 * Uses a switch-based approach so Next.js can tree-shake unused districts.
 */

// ── Sector-specific imports per district ──────────────────

// Milk Production
import milkAhilyanagar from "@/data/milk-production--ahilyanagar.json";
import milkAkola from "@/data/milk-production--akola.json";
import milkAmravati from "@/data/milk-production--amravati.json";
import milkBeed from "@/data/milk-production--beed.json";
import milkBhandara from "@/data/milk-production--bhandara.json";
import milkDhule from "@/data/milk-production--dhule.json";

// Infrastructure (vet/livestock census)
import infraAhilyanagar from "@/data/infrastructure--ahilyanagar.json";
import infraAkola from "@/data/infrastructure--akola.json";
import infraAmravati from "@/data/infrastructure--amravati.json";
import infraBeed from "@/data/infrastructure--beed.json";
import infraBhandara from "@/data/infrastructure--bhandara.json";
import infraDhule from "@/data/infrastructure--dhule.json";

// Artificial Insemination
import aiAhilyanagar from "@/data/artificial-insemination--ahilyanagar.json";
import aiAkola from "@/data/artificial-insemination--akola.json";
import aiAmravati from "@/data/artificial-insemination--amravati.json";
import aiBeed from "@/data/artificial-insemination--beed.json";
import aiBhandara from "@/data/artificial-insemination--bhandara.json";
import aiDhule from "@/data/artificial-insemination--dhule.json";

// Fisheries
import fishAhilyanagar from "@/data/fisheries--ahilyanagar.json";
import fishAkola from "@/data/fisheries--akola.json";
import fishAmravati from "@/data/fisheries--amravati.json";
import fishBeed from "@/data/fisheries--beed.json";
import fishBhandara from "@/data/fisheries--bhandara.json";
import fishDhule from "@/data/fisheries--dhule.json";

// Health Immunization
import hImmAhilyanagar from "@/data/health-immunization--ahilyanagar.json";
import hImmAkola from "@/data/health-immunization--akola.json";
import hImmAmravati from "@/data/health-immunization--amravati.json";
import hImmBeed from "@/data/health-immunization--beed.json";
import hImmBhandara from "@/data/health-immunization--bhandara.json";
import hImmDhule from "@/data/health-immunization--dhule.json";

// Health Infrastructure
import hInfAhilyanagar from "@/data/health-infrastructure--ahilyanagar.json";
import hInfAkola from "@/data/health-infrastructure--akola.json";
import hInfAmravati from "@/data/health-infrastructure--amravati.json";
import hInfBeed from "@/data/health-infrastructure--beed.json";
import hInfBhandara from "@/data/health-infrastructure--bhandara.json";
import hInfDhule from "@/data/health-infrastructure--dhule.json";

// Health Maternal-Child
import hMatAhilyanagar from "@/data/health-maternal-child--ahilyanagar.json";
import hMatAkola from "@/data/health-maternal-child--akola.json";
import hMatAmravati from "@/data/health-maternal-child--amravati.json";
import hMatBeed from "@/data/health-maternal-child--beed.json";
import hMatBhandara from "@/data/health-maternal-child--bhandara.json";
import hMatDhule from "@/data/health-maternal-child--dhule.json";

// Health Nutrition
import hNutAhilyanagar from "@/data/health-nutrition--ahilyanagar.json";
import hNutAkola from "@/data/health-nutrition--akola.json";
import hNutAmravati from "@/data/health-nutrition--amravati.json";
import hNutBeed from "@/data/health-nutrition--beed.json";
import hNutBhandara from "@/data/health-nutrition--bhandara.json";
import hNutDhule from "@/data/health-nutrition--dhule.json";

// Funding
import fundAhilyanagar from "@/data/funding--ahilyanagar.json";
import fundAkola from "@/data/funding--akola.json";
import fundAmravati from "@/data/funding--amravati.json";
import fundBeed from "@/data/funding--beed.json";
import fundBhandara from "@/data/funding--bhandara.json";
import fundDhule from "@/data/funding--dhule.json";

// Overview
import ovAhilyanagar from "@/data/overview--ahilyanagar.json";
import ovAkola from "@/data/overview--akola.json";
import ovAmravati from "@/data/overview--amravati.json";
import ovBeed from "@/data/overview--beed.json";
import ovBhandara from "@/data/overview--bhandara.json";
import ovDhule from "@/data/overview--dhule.json";

// Geographic
import geoAhilyanagar from "@/data/geographic--ahilyanagar.json";
import geoAkola from "@/data/geographic--akola.json";
import geoAmravati from "@/data/geographic--amravati.json";
import geoBeed from "@/data/geographic--beed.json";
import geoBhandara from "@/data/geographic--bhandara.json";
import geoDhule from "@/data/geographic--dhule.json";

// ── Data map ────────────────────────────────────────────
export type SectorKey =
  | "milk-production"
  | "infrastructure"
  | "artificial-insemination"
  | "fisheries"
  | "health-immunization"
  | "health-infrastructure"
  | "health-maternal-child"
  | "health-nutrition"
  | "funding"
  | "overview"
  | "geographic";

type DistrictSlug = "ahilyanagar" | "akola" | "amravati" | "beed" | "bhandara" | "dhule";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DATA_MAP: Record<SectorKey, Record<DistrictSlug, any>> = {
  "milk-production": {
    ahilyanagar: milkAhilyanagar, akola: milkAkola, amravati: milkAmravati,
    beed: milkBeed, bhandara: milkBhandara, dhule: milkDhule,
  },
  infrastructure: {
    ahilyanagar: infraAhilyanagar, akola: infraAkola, amravati: infraAmravati,
    beed: infraBeed, bhandara: infraBhandara, dhule: infraDhule,
  },
  "artificial-insemination": {
    ahilyanagar: aiAhilyanagar, akola: aiAkola, amravati: aiAmravati,
    beed: aiBeed, bhandara: aiBhandara, dhule: aiDhule,
  },
  fisheries: {
    ahilyanagar: fishAhilyanagar, akola: fishAkola, amravati: fishAmravati,
    beed: fishBeed, bhandara: fishBhandara, dhule: fishDhule,
  },
  "health-immunization": {
    ahilyanagar: hImmAhilyanagar, akola: hImmAkola, amravati: hImmAmravati,
    beed: hImmBeed, bhandara: hImmBhandara, dhule: hImmDhule,
  },
  "health-infrastructure": {
    ahilyanagar: hInfAhilyanagar, akola: hInfAkola, amravati: hInfAmravati,
    beed: hInfBeed, bhandara: hInfBhandara, dhule: hInfDhule,
  },
  "health-maternal-child": {
    ahilyanagar: hMatAhilyanagar, akola: hMatAkola, amravati: hMatAmravati,
    beed: hMatBeed, bhandara: hMatBhandara, dhule: hMatDhule,
  },
  "health-nutrition": {
    ahilyanagar: hNutAhilyanagar, akola: hNutAkola, amravati: hNutAmravati,
    beed: hNutBeed, bhandara: hNutBhandara, dhule: hNutDhule,
  },
  funding: {
    ahilyanagar: fundAhilyanagar, akola: fundAkola, amravati: fundAmravati,
    beed: fundBeed, bhandara: fundBhandara, dhule: fundDhule,
  },
  overview: {
    ahilyanagar: ovAhilyanagar, akola: ovAkola, amravati: ovAmravati,
    beed: ovBeed, bhandara: ovBhandara, dhule: ovDhule,
  },
  geographic: {
    ahilyanagar: geoAhilyanagar, akola: geoAkola, amravati: geoAmravati,
    beed: geoBeed, bhandara: geoBhandara, dhule: geoDhule,
  },
};

/**
 * Get data for a given sector and district.
 * Falls back to Ahilyanagar if the district slug is not found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDistrictData(sector: SectorKey, district: string): any {
  const sectorMap = DATA_MAP[sector];
  if (!sectorMap) return null;
  return sectorMap[district as DistrictSlug] ?? sectorMap.ahilyanagar;
}
