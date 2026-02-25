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
import { Target, TrendingUp } from "lucide-react";

import type { KpiCardData, RelatedMetricCard } from "@/lib/types";
import { useFilterContext } from "@/lib/filter-context";
import { getDistrictData } from "@/lib/district-data";

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "year", label: "Year", sortable: true },
  { key: "districtTarget", label: "Target", align: "right", mono: true, sortable: true },
  { key: "districtActual", label: "Achieved", align: "right", mono: true, sortable: true },
  { key: "achievement", label: "Achievement %", align: "right", mono: true, sortable: true },
  { key: "topTaluka", label: "Top Taluka", sortable: true },
];

export default function VetServicesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table" | "map">("chart");
  const [currentYear, setCurrentYear] = useState(2021);
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);
  const { filters, districtInfo } = useFilterContext();
  const aiData = getDistrictData("artificial-insemination", filters.district);

  const kpis = aiData.kpis as KpiCardData[];
  const chartData = aiData.chartData as any[];
  const tableData = aiData.tableData as any[];
  const relatedMetrics = aiData.relatedMetrics as RelatedMetricCard[];
  const talukas = aiData.talukas as any[];

  const visibleTalukas = useMemo(
    () => filters.talukas.length === 0 ? talukas : talukas.filter((t: any) => filters.talukas.includes(t.name)),
    [talukas, filters.talukas]
  );

  /* Dual-axis: Target & Actual (left, in thousands) + Achievement % (right) */
  const series = useMemo(() => [
    {
      dataKey: "districtTarget",
      name: "Target ('000)",
      color: "#3c4e6a",
      yAxisId: "left" as const,
      strokeWidth: 2,
      dashed: true,
    },
    {
      dataKey: "districtActual",
      name: "Achieved ('000)",
      color: "#2c699a",
      yAxisId: "left" as const,
      strokeWidth: 2.5,
      fill: true,
    },
    {
      dataKey: "achievement",
      name: "Achievement %",
      color: "#d4af37",
      yAxisId: "right" as const,
      strokeWidth: 2,
    },
  ], []);

  const filteredData = useMemo(
    () => (chartData as any[]).filter((d: any) => Number(d.year) <= currentYear),
    [chartData, currentYear]
  );

  return (
    <>
      <AppHeader
        variant="detail"
        title="Artificial Insemination Services"
        description={`AI target achievement data across all talukas of ${districtInfo.name} (2012–2021).`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Livestock", href: "/livestock/milk-production" },
          { label: "Vet Services" },
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
          title="AI Target vs Achievement Trends"
          description="District-level target (dashed) and achieved counts (left axis, '000) with achievement percentage (right axis)."
          source="Source: District Veterinary & Animal Husbandry Office, Ahilyanagar (2021)"
          legends={[
            { color: "#3c4e6a", label: "Target ('000)" },
            { color: "#2c699a", label: "Achieved ('000)" },
            { color: "#d4af37", label: "Achievement %" },
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
                  leftAxisLabel="Count ('000)"
                  rightAxisLabel="Achievement %"
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
                    markers={visibleTalukas.map((t) => ({
                      lng: t.lng,
                      lat: t.lat,
                      label: t.name,
                      value: `Achievement: ${t.achievement}% | Target: ${(t.target / 1000).toFixed(1)}k`,
                      color: t.color,
                    }))}
                    onMarkerClick={(m) => setSelectedTaluka(m.label)}
                    selectedMarker={selectedTaluka}
                  />
                </Card>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Taluka-wise Achievement</div>
                {[...visibleTalukas]
                  .sort((a, b) => b.achievement - a.achievement)
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
                          <span className="text-xs font-mono font-semibold">{t.achievement}%</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-4 text-xs text-subtext-light">
                          <span className="flex items-center gap-1"><Target className="h-3 w-3" />Target: {(t.target / 1000).toFixed(1)}k</span>
                          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />Actual: {((t.target * t.achievement / 100) / 1000).toFixed(1)}k</span>
                        </div>
                      </button>
                    );
                  })}
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
        variant="infra"
      />
    </>
  );
}
