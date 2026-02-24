"use client";

import { useState, useMemo } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageFooter } from "@/components/layout/page-footer";
import { ChartCard } from "@/components/dashboard/chart-card";
import { FilterSidebar } from "@/components/dashboard/filter-sidebar";
import { RelatedMetricsGrid } from "@/components/dashboard/related-metrics";
import { DualAxisLineChart } from "@/components/charts/dual-axis-line-chart";
import { ViewModeTabs } from "@/components/controls/view-mode-tabs";
import { CompareToggle } from "@/components/controls/compare-toggle";
import { TimelineSlider } from "@/components/controls/timeline-slider";
import { DataTable, type DataTableColumn } from "@/components/controls/data-table";

import infraData from "@/data/infrastructure.json";
import type { RelatedMetricCard } from "@/lib/types";

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "year", label: "Year", sortable: true },
  { key: "vaccinations", label: "Vaccinations", align: "right", mono: true, sortable: true },
  { key: "clinics", label: "Active Clinics", align: "right", mono: true, sortable: true },
  { key: "stateAvg", label: "State Avg", align: "right", mono: true, sortable: true },
  { key: "target2025", label: "Target 2025", align: "right", mono: true },
];

export default function InfrastructurePage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table" | "map">("chart");
  const [showStateAvg, setShowStateAvg] = useState(true);
  const [showTarget, setShowTarget] = useState(false);
  const [currentYear, setCurrentYear] = useState(2024);

  const { chartData, relatedMetrics: rawMetrics } = infraData;
  const relatedMetrics = rawMetrics as RelatedMetricCard[];

  /* Build series dynamically using DualAxisSeriesConfig shape */
  const series = useMemo(() => {
    const s: Array<{
      dataKey: string;
      name: string;
      color: string;
      yAxisId: "left" | "right";
      strokeWidth?: number;
      fill?: boolean;
      dashed?: boolean;
    }> = [
      {
        dataKey: "vaccinations",
        name: "Vaccinations",
        color: "#2c699a",
        yAxisId: "left",
        strokeWidth: 2.5,
        fill: true,
      },
    ];
    if (showStateAvg) {
      s.push({
        dataKey: "stateAvg",
        name: "State Avg",
        color: "#d4af37",
        yAxisId: "left",
        strokeWidth: 2,
        dashed: true,
      });
    }
    s.push({
      dataKey: "clinics",
      name: "Active Clinics",
      color: "#008450",
      yAxisId: "right",
      strokeWidth: 2,
    });
    if (showTarget) {
      s.push({
        dataKey: "target2025",
        name: "Target 2025",
        color: "#cf5c36",
        yAxisId: "right",
        strokeWidth: 1.5,
        dashed: true,
      });
    }
    return s;
  }, [showStateAvg, showTarget]);

  const filteredData = useMemo(
    () => chartData.filter((d) => Number(d.year) <= currentYear),
    [chartData, currentYear]
  );

  return (
    <>
      <AppHeader
        variant="detail"
        title="Infrastructure & Service Trends"
        description="Veterinary clinics, vaccination drives, and mobile service coverage across talukas."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Livestock", href: "/livestock/milk-production" },
          { label: "Census & Infrastructure" },
        ]}
        backLink={{ label: "Back to Overview", href: "/" }}
        onMenuClick={() => {}}
        onFilterClick={() => setFilterOpen(true)}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 bg-bg-light">
        {/* Main chart card */}
        <ChartCard
          title="Vaccination & Clinic Trends"
          description="Monthly vaccination counts (left axis) versus active clinic count (right axis) over time."
          source="Source: District Veterinary Services Office, Ahilyanagar (2024)"
          legends={[
            { color: "#2c699a", label: "Vaccinations" },
            { color: "#d4af37", label: "State Avg" },
            { color: "#008450", label: "Active Clinics" },
            { color: "#cf5c36", label: "Target 2025" },
          ]}
          headerRight={
            <div className="flex flex-wrap items-center gap-4">
              <CompareToggle
                label="Compare with State Average"
                checked={showStateAvg}
                onCheckedChange={setShowStateAvg}
              />
              <CompareToggle
                label="Show Target 2025"
                checked={showTarget}
                onCheckedChange={setShowTarget}
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
              <div className="relative w-full" style={{ height: 400 }}>
                <DualAxisLineChart
                  data={filteredData}
                  series={series}
                  xDataKey="year"
                  leftAxisLabel="Vaccinations"
                  rightAxisLabel="Clinic Count"
                  height={400}
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
            <DataTable columns={TABLE_COLUMNS} data={chartData} />
          )}

          {viewMode === "map" && (
            <div className="flex items-center justify-center h-[400px] text-subtext-light text-sm">
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
        variant="infra"
      />
    </>
  );
}
