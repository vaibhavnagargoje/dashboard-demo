"use client";

import { useState, useMemo } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageFooter } from "@/components/layout/page-footer";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { FilterSidebar } from "@/components/dashboard/filter-sidebar";
import { RelatedMetricsGrid } from "@/components/dashboard/related-metrics";
import { DashboardLineChart } from "@/components/charts/line-chart";
import { ViewModeTabs } from "@/components/controls/view-mode-tabs";
import { TimelineSlider } from "@/components/controls/timeline-slider";
import { DataTable, type DataTableColumn } from "@/components/controls/data-table";
import { MapView } from "@/components/map/map-view";
import { Card } from "@/components/ui/card";
import { Syringe, ShieldCheck } from "lucide-react";

import data from "@/data/health-immunization.json";
import type { KpiCardData, RelatedMetricCard } from "@/lib/types";

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "year", label: "Year", sortable: true },
  { key: "dptPenta", label: "DPT / Pentavalent", align: "right", mono: true, sortable: true },
  { key: "polio", label: "Polio", align: "right", mono: true, sortable: true },
  { key: "bcg", label: "BCG", align: "right", mono: true, sortable: true },
  { key: "measles", label: "Measles", align: "right", mono: true, sortable: true },
  { key: "tetanus", label: "Tetanus (PW)", align: "right", mono: true, sortable: true },
];

export default function ImmunizationPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table" | "map">("chart");
  const [currentYear, setCurrentYear] = useState(2021);
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);

  const { kpis: rawKpis, chartData, tableData, relatedMetrics: rawMetrics, talukas } = data;
  const kpis = rawKpis as KpiCardData[];
  const relatedMetrics = rawMetrics as RelatedMetricCard[];

  const series = useMemo(() => [
    { dataKey: "dptPenta", name: "DPT/Pentavalent", color: "#2c699a" },
    { dataKey: "polio", name: "Polio", color: "#10b981" },
    { dataKey: "bcg", name: "BCG", color: "#d4af37" },
    { dataKey: "measles", name: "Measles", color: "#e07b39" },
  ], []);

  const filteredData = useMemo(
    () => chartData.filter((d) => Number(d.year) <= currentYear),
    [chartData, currentYear]
  );

  return (
    <>
      <AppHeader
        variant="detail"
        title="Immunization"
        description="Vaccine coverage data across all 14 talukas of Ahmednagar district (2012–2021)."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Health", href: "/health" },
          { label: "Immunization" },
        ]}
        backLink={{ label: "Back to Health", href: "/health" }}
        onMenuClick={() => {}}
        onFilterClick={() => setFilterOpen(true)}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 bg-bg-light">
        <KpiGrid>
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.label} data={kpi} index={i} />
          ))}
        </KpiGrid>

        <ChartCard
          title="Vaccination Trends"
          description="Key vaccine doses administered across Ahmednagar district from 2012 to 2021. DPT was replaced by Pentavalent from 2018."
          source="Source: District Statistical Abstract, Ahmednagar (2021)"
          legends={[
            { color: "#2c699a", label: "DPT / Pentavalent" },
            { color: "#10b981", label: "Polio" },
            { color: "#d4af37", label: "BCG" },
            { color: "#e07b39", label: "Measles" },
          ]}
          headerRight={
            <ViewModeTabs
              activeMode={viewMode}
              onModeChange={(m) => setViewMode(m as any)}
            />
          }
        >
          {viewMode === "chart" && (
            <>
              <div className="relative w-full" style={{ height: 400 }}>
                <DashboardLineChart
                  data={filteredData}
                  series={series}
                  xDataKey="year"
                  height={400}
                />
              </div>
              <div className="mt-4">
                <TimelineSlider
                  minYear={2012}
                  maxYear={2021}
                  value={currentYear}
                  onChange={setCurrentYear}
                />
              </div>
            </>
          )}

          {viewMode === "table" && (
            <DataTable columns={TABLE_COLUMNS} data={tableData} />
          )}

          {viewMode === "map" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <Card className="overflow-hidden border-border-light">
                  <MapView
                    className="h-[420px]"
                    center={[74.7, 19.1]}
                    zoom={9}
                    markers={talukas.map((t) => ({
                      lng: t.lng,
                      lat: t.lat,
                      label: t.name,
                      value: `DPT/Penta: ${t.dptPenta.toLocaleString()} | Polio: ${t.polio.toLocaleString()}`,
                      color: t.color,
                    }))}
                    onMarkerClick={(m) => setSelectedTaluka(m.label)}
                    selectedMarker={selectedTaluka}
                  />
                </Card>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Taluka-wise Vaccines</div>
                {[...talukas]
                  .sort((a, b) => b.polio - a.polio)
                  .map((t) => {
                    const selected = selectedTaluka === t.name;
                    return (
                      <button
                        key={t.name}
                        onClick={() => setSelectedTaluka(t.name)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all text-sm ${
                          selected
                            ? "bg-primary/5 border-primary/30 text-primary font-medium"
                            : "bg-white border-border-light hover:border-primary/20 text-text-light"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                            {t.name}
                          </span>
                          <span className="text-xs font-mono font-semibold">{t.polio.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-4 text-xs text-subtext-light">
                          <span className="flex items-center gap-1"><Syringe className="h-3 w-3" />Penta: {t.dptPenta.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />BCG: {t.bcg.toLocaleString()}</span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </ChartCard>

        <RelatedMetricsGrid metrics={relatedMetrics} />
        <PageFooter />
      </div>

      <FilterSidebar
        open={filterOpen}
        onOpenChange={setFilterOpen}
        variant="health"
      />
    </>
  );
}
