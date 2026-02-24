"use client";

import { useState, useMemo } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageFooter } from "@/components/layout/page-footer";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { FilterSidebar } from "@/components/dashboard/filter-sidebar";
import { RelatedMetricsGrid } from "@/components/dashboard/related-metrics";
import { DualAxisLineChart } from "@/components/charts/dual-axis-line-chart";
import { ViewModeTabs } from "@/components/controls/view-mode-tabs";
import { TimelineSlider } from "@/components/controls/timeline-slider";
import { DataTable, type DataTableColumn } from "@/components/controls/data-table";
import { MapView } from "@/components/map/map-view";
import { Card } from "@/components/ui/card";
import { HeartPulse, AlertTriangle, Home } from "lucide-react";

import type { KpiCardData, RelatedMetricCard } from "@/lib/types";
import { useFilterContext } from "@/lib/filter-context";
import { getDistrictData } from "@/lib/district-data";

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "year", label: "Year", sortable: true },
  { key: "normalPct", label: "Normal %", align: "right", mono: true, sortable: true },
  { key: "mamPct", label: "MAM %", align: "right", mono: true, sortable: true },
  { key: "samPct", label: "SAM %", align: "right", mono: true, sortable: true },
  { key: "approvedAW", label: "Approved AW", align: "right", mono: true, sortable: true },
  { key: "workingAW", label: "Working AW", align: "right", mono: true, sortable: true },
  { key: "awWorkers", label: "AW Workers", align: "right", mono: true, sortable: true },
];

export default function NutritionPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table" | "map">("chart");
  const [currentYear, setCurrentYear] = useState(2021);
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);
  const { filters, districtInfo } = useFilterContext();
  const data = getDistrictData("health-nutrition", filters.district);

  const kpis = data.kpis as KpiCardData[];
  const chartData = data.chartData as any[];
  const tableData = data.tableData as any[];
  const relatedMetrics = data.relatedMetrics as RelatedMetricCard[];
  const talukas = data.talukas as any[];

  const series = useMemo(() => [
    { dataKey: "normalPct", name: "Normal Weight %", color: "#10b981", yAxisId: "left" as const, fill: true, strokeWidth: 2.5 },
    { dataKey: "mamPct", name: "MAM %", color: "#f59e0b", yAxisId: "left" as const, strokeWidth: 2 },
    { dataKey: "samPct", name: "SAM %", color: "#dc2626", yAxisId: "left" as const, strokeWidth: 2 },
    { dataKey: "workingAW", name: "Working Anganwadis", color: "#2c699a", yAxisId: "right" as const, strokeWidth: 2.5 },
  ], []);

  const filteredData = useMemo(
    () => (chartData as any[]).filter((d: any) => Number(d.year) <= currentYear),
    [chartData, currentYear]
  );

  return (
    <>
      <AppHeader
        variant="detail"
        title="Nutrition & Anganwadis"
        description={`Child malnutrition rates and Anganwadi centre coverage across ${districtInfo.name} district (2012–2021).`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Health", href: "/health" },
          { label: "Nutrition" },
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
          title="Nutrition & Anganwadi Trends"
          description="Left axis shows malnutrition breakdown (Normal / MAM / SAM %). Right axis shows the number of working Anganwadi centres."
          source="Source: District Statistical Abstract, Ahmednagar (2021)"
          legends={[
            { color: "#10b981", label: "Normal Weight %" },
            { color: "#f59e0b", label: "MAM %" },
            { color: "#dc2626", label: "SAM %" },
            { color: "#2c699a", label: "Working Anganwadis" },
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
                <DualAxisLineChart
                  data={filteredData}
                  series={series}
                  xDataKey="year"
                  leftAxisLabel="Malnutrition %"
                  rightAxisLabel="Anganwadis"
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
                    center={districtInfo.center as [number, number]}
                    zoom={districtInfo.zoom}
                    markers={talukas.map((t) => ({
                      lng: t.lng,
                      lat: t.lat,
                      label: t.name,
                      value: `Normal: ${t.normalPct}% | MAM: ${t.mamPct}% | AW: ${t.workingAW.toLocaleString()}`,
                      color: t.color,
                    }))}
                    onMarkerClick={(m) => setSelectedTaluka(m.label)}
                    selectedMarker={selectedTaluka}
                  />
                </Card>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Taluka-wise Nutrition</div>
                {[...talukas]
                  .sort((a, b) => b.workingAW - a.workingAW)
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
                          <span className="text-xs font-mono font-semibold">{t.workingAW.toLocaleString()} AW</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-4 text-xs text-subtext-light">
                          <span className="flex items-center gap-1"><HeartPulse className="h-3 w-3" />Normal: {t.normalPct}%</span>
                          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />MAM: {t.mamPct}%</span>
                          <span className="flex items-center gap-1"><Home className="h-3 w-3" />Workers: {t.awWorkers}</span>
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
