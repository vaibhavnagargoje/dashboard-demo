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
import { CompareToggle } from "@/components/controls/compare-toggle";
import { TimelineSlider } from "@/components/controls/timeline-slider";
import { DataTable, type DataTableColumn } from "@/components/controls/data-table";

import milkData from "@/data/milk-production.json";
import type { KpiCardData, RelatedMetricCard } from "@/lib/types";

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "year", label: "Year", sortable: true },
  { key: "districtAvg", label: "District Avg (k L)", align: "right", mono: true, sortable: true },
  { key: "stateAvg", label: "State Avg (k L)", align: "right", mono: true, sortable: true },
  { key: "sangamner", label: "Sangamner (k L)", align: "right", mono: true, sortable: true },
  { key: "kopargaon", label: "Kopargaon (k L)", align: "right", mono: true, sortable: true },
];

export default function MilkProductionPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table" | "map">("chart");
  const [showStateAvg, setShowStateAvg] = useState(true);
  const [currentYear, setCurrentYear] = useState(2024);

  const { kpis: rawKpis, chartData, tableData, relatedMetrics: rawMetrics } = milkData;
  const kpis = rawKpis as KpiCardData[];
  const relatedMetrics = rawMetrics as RelatedMetricCard[];

  /* Build series list based on toggle */
  const series = useMemo(() => {
    const base = [
      {
        dataKey: "districtAvg",
        name: "District Avg",
        color: "#3c4e6a",
        strokeWidth: 2.5,
      },
    ];
    if (showStateAvg) {
      base.push({
        dataKey: "stateAvg",
        name: "State Avg",
        color: "#d4af37",
        strokeWidth: 2,
        dashed: true,
      } as any);
    }
    base.push(
      { dataKey: "sangamner", name: "Sangamner", color: "#2c699a", strokeWidth: 1.5 },
      { dataKey: "kopargaon", name: "Kopargaon", color: "#10b981", strokeWidth: 1.5 }
    );
    return base;
  }, [showStateAvg]);

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
        description="District & taluka-wise milk output trends from 2018 to 2024."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Milk Production" },
        ]}
        backLink={{ label: "Back to Dashboard", href: "/" }}
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
          description="Compare district, state, and taluka-level production trends over time."
          source="Source: District Dairy Development Office, Ahilyanagar (2024)"
          legends={[
            { color: "#3c4e6a", label: "District Avg" },
            { color: "#d4af37", label: "State Avg" },
            { color: "#2c699a", label: "Sangamner" },
            { color: "#10b981", label: "Kopargaon" },
          ]}
          headerRight={
            <div className="flex items-center gap-4">
              <CompareToggle
                label="Compare with State Average"
                checked={showStateAvg}
                onCheckedChange={setShowStateAvg}
              />
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
                  minYear={2018}
                  maxYear={2024}
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
            <div className="flex items-center justify-center h-[380px] text-subtext-light text-sm">
              Map view coming soon — see Geographic View page
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
