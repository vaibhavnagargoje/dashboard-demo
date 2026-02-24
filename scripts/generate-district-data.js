/**
 * generate-district-data.js
 * ─────────────────────────
 * Generates per-district dashboard JSON files for all 6 districts.
 * Ahilyanagar keeps its original data; other districts get scaled variants.
 *
 * Run: node scripts/generate-district-data.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DISTRICTS_FILE = path.join(DATA_DIR, "districts.json");
const { districts } = JSON.parse(fs.readFileSync(DISTRICTS_FILE, "utf8"));

// Sector template files (Ahilyanagar originals)
const SECTOR_FILES = [
  "milk-production",
  "infrastructure",
  "artificial-insemination",
  "fisheries",
  "health-immunization",
  "health-infrastructure",
  "health-maternal-child",
  "health-nutrition",
  "funding",
  "overview",
  "geographic",
];

// Deterministic seeded random (mulberry32)
function seedRandom(seed) {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return Math.abs(hash);
}

// Scale a numeric value by a factor with slight random variation per year
function scaleValue(val, factor, yearSeed) {
  if (typeof val !== "number" || isNaN(val)) return val;
  const variation = 0.85 + seedRandom(yearSeed) * 0.3; // 0.85 to 1.15
  return Math.round(val * factor * variation);
}

// District-specific scale factors (relative to Ahilyanagar)
const DISTRICT_SCALE = {
  ahilyanagar: 1.0,
  akola: 0.55,
  amravati: 0.75,
  beed: 0.65,
  bhandara: 0.40,
  dhule: 0.45,
};

const TALUKA_COLORS = [
  "#2c699a", "#008450", "#cf5c36", "#3c4e6a", "#d4af37",
  "#10b981", "#e07b39", "#dc2626", "#7c3aed", "#0891b2",
  "#65a30d", "#c026d3", "#ea580c", "#0d9488",
];

function generateDistrictData(district, templateData, sectorName) {
  const scale = DISTRICT_SCALE[district.slug] || 0.5;
  const distSeed = hashString(district.slug + sectorName);

  // Deep clone
  const data = JSON.parse(JSON.stringify(templateData));

  // Scale KPIs
  if (data.kpis) {
    data.kpis.forEach((kpi, i) => {
      // Scale numeric values in the value string
      const numMatch = kpi.value.match(/([\d,]+\.?\d*)/);
      if (numMatch) {
        const origNum = parseFloat(numMatch[1].replace(/,/g, ""));
        const scaled = scaleValue(origNum, scale, distSeed + i);
        const formatted = scaled.toLocaleString("en-IN");
        kpi.value = kpi.value.replace(numMatch[1], formatted);
      }
      // Update trend context
      if (kpi.trend) {
        const trendNum = kpi.trend.value.match(/([\d.]+)/);
        if (trendNum) {
          const newTrendVal = (parseFloat(trendNum[1]) * (0.7 + seedRandom(distSeed + i + 100) * 0.6)).toFixed(1);
          kpi.trend.value = kpi.trend.value.replace(trendNum[1], newTrendVal);
        }
      }
    });
  }

  // Scale chartData
  if (data.chartData) {
    data.chartData = data.chartData.map((row, ri) => {
      const newRow = { ...row };
      Object.keys(newRow).forEach((k) => {
        if (k === "year") return;
        if (typeof newRow[k] === "number") {
          newRow[k] = scaleValue(newRow[k], scale, distSeed + ri * 100 + hashString(k));
        }
      });
      return newRow;
    });
  }

  // Scale tableData
  if (data.tableData) {
    data.tableData = data.tableData.map((row, ri) => {
      const newRow = { ...row };
      Object.keys(newRow).forEach((k) => {
        if (k === "year" || k === "category" || k === "status" || k === "statusColor" || k === "pct" || k === "topTaluka") return;
        if (typeof newRow[k] === "number") {
          newRow[k] = scaleValue(newRow[k], scale, distSeed + ri * 200 + hashString(k));
        }
      });
      return newRow;
    });
  }

  // Rebuild talukas for this district
  if (data.talukas && district.talukas) {
    const templateTalukas = data.talukas;
    data.talukas = district.talukas.map((dt, ti) => {
      // Use a template taluka as base, cycling through them
      const tmpl = templateTalukas[ti % templateTalukas.length];
      const newT = { ...tmpl };
      newT.name = dt.name;
      newT.lng = dt.lng;
      newT.lat = dt.lat;
      newT.color = TALUKA_COLORS[ti % TALUKA_COLORS.length];

      // Scale all numeric fields
      Object.keys(newT).forEach((k) => {
        if (["name", "lng", "lat", "color"].includes(k)) return;
        if (typeof newT[k] === "number") {
          newT[k] = scaleValue(newT[k], scale, distSeed + ti * 50 + hashString(k));
        }
      });
      return newT;
    });
  }

  // Scale waterfallData (funding)
  if (data.waterfallData) {
    data.waterfallData = data.waterfallData.map((item, i) => ({
      ...item,
      base: typeof item.base === "number" ? scaleValue(item.base, scale, distSeed + i * 300) : item.base,
      value: typeof item.value === "number" ? scaleValue(item.value, scale, distSeed + i * 301) : item.value,
    }));
  }

  // Scale relatedMetrics chart data
  if (data.relatedMetrics) {
    data.relatedMetrics.forEach((metric, mi) => {
      if (metric.data) {
        metric.data = metric.data.map((d, di) => ({
          ...d,
          value: typeof d.value === "number" ? scaleValue(d.value, scale, distSeed + mi * 400 + di) : d.value,
        }));
      }
    });
  }

  // Scale livestockComposition, serviceTrends, infraSummary (overview)
  if (data.livestockComposition) {
    data.livestockComposition = data.livestockComposition.map((item, i) => ({
      ...item,
      value: scaleValue(item.value, scale, distSeed + i * 500),
    }));
  }
  if (data.serviceTrends) {
    data.serviceTrends = data.serviceTrends.map((item, i) => {
      const newItem = { ...item };
      Object.keys(newItem).forEach((k) => {
        if (k === "month") return;
        if (typeof newItem[k] === "number") {
          newItem[k] = scaleValue(newItem[k], scale, distSeed + i * 600 + hashString(k));
        }
      });
      return newItem;
    });
  }
  if (data.infraSummary) {
    data.infraSummary = data.infraSummary.map((item, i) => {
      const numMatch = item.value?.match(/([\d,]+)/);
      if (numMatch) {
        const origNum = parseInt(numMatch[1].replace(/,/g, ""));
        const scaled = scaleValue(origNum, scale, distSeed + i * 700);
        item.value = item.value.replace(numMatch[1], scaled.toLocaleString("en-IN"));
      }
      return item;
    });
  }

  // Scale milkTrends (overview)
  if (data.milkTrends) {
    data.milkTrends = data.milkTrends.map((row, ri) => {
      const newRow = { ...row };
      Object.keys(newRow).forEach((k) => {
        if (k === "year") return;
        if (typeof newRow[k] === "number") {
          newRow[k] = scaleValue(newRow[k], scale, distSeed + ri * 800 + hashString(k));
        }
      });
      return newRow;
    });
  }

  // Scale fundingWaterfall (overview)
  if (data.fundingWaterfall) {
    data.fundingWaterfall = data.fundingWaterfall.map((item, i) => ({
      ...item,
      base: typeof item.base === "number" ? scaleValue(item.base, scale, distSeed + i * 900) : item.base,
      value: typeof item.value === "number" ? scaleValue(item.value, scale, distSeed + i * 901) : item.value,
    }));
  }

  // Update geographic center/zoom
  if (sectorName === "geographic") {
    data.center = district.center;
    data.zoom = district.zoom;
  }

  // Scale byProducts (fisheries)
  if (data.byProducts) {
    data.byProducts = data.byProducts.map((item, i) => ({
      ...item,
      value: typeof item.value === "number" ? scaleValue(item.value, scale, distSeed + i * 1000) : item.value,
    }));
  }

  // Scale livestockBreakdown (infrastructure) — it's an object keyed by year
  if (data.livestockBreakdown && typeof data.livestockBreakdown === "object" && !Array.isArray(data.livestockBreakdown)) {
    Object.keys(data.livestockBreakdown).forEach((year) => {
      if (Array.isArray(data.livestockBreakdown[year])) {
        data.livestockBreakdown[year] = data.livestockBreakdown[year].map((item, i) => ({
          ...item,
          value: typeof item.value === "number" ? scaleValue(item.value, scale, distSeed + i * 1100 + hashString(year)) : item.value,
        }));
      }
    });
  } else if (Array.isArray(data.livestockBreakdown)) {
    data.livestockBreakdown = data.livestockBreakdown.map((item, i) => ({
      ...item,
      value: typeof item.value === "number" ? scaleValue(item.value, scale, distSeed + i * 1100) : item.value,
    }));
  }

  return data;
}

// ── Main ─────────────────────────────────────────────────
console.log("Generating per-district data files...\n");

districts.forEach((district) => {
  SECTOR_FILES.forEach((sector) => {
    const templatePath = path.join(DATA_DIR, `${sector}.json`);
    if (!fs.existsSync(templatePath)) {
      console.log(`  ⚠ Template not found: ${sector}.json — skipping`);
      return;
    }

    const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));

    if (district.slug === "ahilyanagar") {
      // Ahilyanagar keeps its original data — just copy as-is with district suffix
      const outPath = path.join(DATA_DIR, `${sector}--ahilyanagar.json`);
      fs.writeFileSync(outPath, JSON.stringify(template, null, 2));
      console.log(`  ✓ ${sector}--ahilyanagar.json (original)`);
    } else {
      const data = generateDistrictData(district, template, sector);
      const outPath = path.join(DATA_DIR, `${sector}--${district.slug}.json`);
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
      console.log(`  ✓ ${sector}--${district.slug}.json (scaled ×${DISTRICT_SCALE[district.slug]})`);
    }
  });
  console.log("");
});

console.log("Done! Generated district data for:", districts.map((d) => d.name).join(", "));
