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
import { Droplets, MapPin } from "lucide-react";

import milkData from "@/data/milk-production.json";
import type { KpiCardData, RelatedMetricCard } from "@/lib/types";

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "year", label: "Year", sortable: true },
  { key: "districtTotal", label: "District Total (k L/day)", align: "right", mono: true, sortable: true },
  { key: "sangamner", label: "Sangamner (k L/day)", align: "right", mono: true, sortable: true },
  { key: "kopargaon", label: "Kopargaon (k L/day)", align: "right", mono: true, sortable: true },
  { key: "societies", label: "Societies", align: "right", mono: true, sortable: true },
  { key: "members", label: "Members", align: "right", mono: true, sortable: true },
];

export default function MilkProductionPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table" | "map">("chart");
  const [currentYear, setCurrentYear] = useState(2021);
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);

  const { kpis: rawKpis, chartData, tableData, relatedMetrics: rawMetrics, talukas } = milkData;
  const kpis = rawKpis as KpiCardData[];
  const relatedMetrics = rawMetrics as RelatedMetricCard[];

  /* Build series list */
  const series = useMemo(() => [
    { dataKey: "districtTotal", name: "District Total", color: "#3c4e6a", strokeWidth: 2.5 },
    { dataKey: "sangamner", name: "Sangamner", color: "#2c699a", strokeWidth: 1.5 },
    { dataKey: "kopargaon", name: "Kopargaon", color: "#10b981", strokeWidth: 1.5 },
  ], []);

  /* Filtered chart data up to selected year */
  const filteredData = useMemo(
    () => chartData.filter((d) => Number(d.year) <= currentYear),
    [chartData, currentYear]
  );

  return (
    <>
      <AppHeader
        variant="detail"
        title="Milk Production Trends"
        description="District & taluka-wise daily milk collection trends from 2012 to 2021."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Livestock", href: "/livestock/milk-production" },
          { label: "Milk Production" },
        ]}
        backLink={{ label: "Back to Overview", href: "/" }}
        onMenuClick={() => {}}
        onFilterClick={() => setFilterOpen(true)}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 bg-bg-light">
        {/* KPI strip */}
        <KpiGrid>
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.label} data={kpi} index={i} />
          ))}
        </KpiGrid>

        {/* Main chart card */}
        <ChartCard
          title="Milk Production Overview"
          description="Compare district total and top taluka daily milk collection (k L/day) over time."
          source="Source: Dairy Co-operative Data, Ahilyanagar (2021)"
          legends={[
            { color: "#3c4e6a", label: "District Total" },
            { color: "#2c699a", label: "Sangamner" },
            { color: "#10b981", label: "Kopargaon" },
          ]}
          headerRight={
            <div className="flex items-center gap-4">
              <ViewModeTabs
                activeMode={viewMode}
                onModeChange={(m) => setViewMode(m as any)}
              />
            </div>
          }
        >
          {viewMode === "chart" && (
            <>
              <div className="relative w-full" style={{ height: 380 }}>
                <DashboardLineChart
                  data={filteredData}
                  xDataKey="year"
                  series={series}
                  height={380}
                  showLegend={false}
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
                    className="h-[400px]"
                    center={[74.7, 19.1]}
                    zoom={9}
                    markers={talukas.map((t) => ({
                      lng: t.lng,
                      lat: t.lat,
                      label: t.name,
                      value: `Daily Milk: ${t.milkDaily}k L/day | Societies: ${t.societies}`,
                      color: t.color,
                    }))}
                    onMarkerClick={(m) => setSelectedTaluka(m.label)}
                    selectedMarker={selectedTaluka}
                  />
                </Card>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Taluka-wise Production</div>
                {talukas
                  .sort((a, b) => b.milkDaily - a.milkDaily)
                  .map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setSelectedTaluka(t.name)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between text-sm ${
                        selectedTaluka === t.name
                          ? "bg-primary/5 border-primary/30 text-primary font-medium"
                          : "bg-white border-border-light hover:border-primary/20 text-text-light"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                        {t.name}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-mono">
                        <Droplets className="h-3 w-3 text-chart-line-1" />
                        {t.milkDaily}k L/day
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Related metrics */}
        <RelatedMetricsGrid metrics={relatedMetrics} />

        <PageFooter />
      </div>

      <FilterSidebar
        open={filterOpen}
        onOpenChange={setFilterOpen}
        variant="milk"
      />
    </>
  );
}
