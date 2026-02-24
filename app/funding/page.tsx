"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageFooter } from "@/components/layout/page-footer";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { FilterSidebar } from "@/components/dashboard/filter-sidebar";
import { RelatedMetricsGrid } from "@/components/dashboard/related-metrics";
import { WaterfallChart, type WaterfallItem } from "@/components/charts/waterfall-chart";
import { ViewModeTabs } from "@/components/controls/view-mode-tabs";
import { DataTable, type DataTableColumn } from "@/components/controls/data-table";

import fundingData from "@/data/funding.json";
import type { KpiCardData, RelatedMetricCard } from "@/lib/types";

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "category", label: "Category", sortable: true },
  {
    key: "amount",
    label: "Amount (₹ Cr)",
    align: "right",
    mono: true,
    sortable: true,
  },
  { key: "pct", label: "Share", align: "right", mono: true },
  {
    key: "status",
    label: "Status",
    align: "center",
    badge: true,
    badgeColorKey: "statusColor",
  },
];

export default function FundingPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const { kpis: rawKpis, waterfallData: rawWaterfall, tableData, relatedMetrics: rawMetrics } = fundingData;
  const kpis = rawKpis as KpiCardData[];
  const waterfallData = rawWaterfall as WaterfallItem[];
  const relatedMetrics = rawMetrics as RelatedMetricCard[];

  return (
    <>
      <AppHeader
        variant="detail"
        title="Funding Allocation & Utilization"
        description="Tracking budget allocation, sector-wise spending, and remaining balance for FY 2023-24."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Funding", href: "/funding" },
          { label: "Budget Allocation" },
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

        {/* Main chart / table */}
        <ChartCard
          title="Budget Waterfall Breakdown"
          description="Flow of the ₹500 Cr annual budget across development sectors and their utilization status."
          source="Source: District Planning Committee Report, FY 2023-24"
          legends={[
            { color: "#3c4e6a", label: "Total / Balance" },
            { color: "#dc2626", label: "Expenses" },
            { color: "#008450", label: "Remaining" },
          ]}
          headerRight={
            <ViewModeTabs
              modes={["chart", "table"]}
              activeMode={viewMode}
              onModeChange={(m) => setViewMode(m as any)}
            />
          }
        >
          {viewMode === "chart" && (
            <div className="relative w-full" style={{ height: 380 }}>
              <WaterfallChart data={waterfallData} height={380} detailed />
            </div>
          )}

          {viewMode === "table" && (
            <DataTable columns={TABLE_COLUMNS} data={tableData} />
          )}
        </ChartCard>

        {/* Related metrics */}
        <RelatedMetricsGrid metrics={relatedMetrics} />

        <PageFooter />
      </div>

      <FilterSidebar
        open={filterOpen}
        onOpenChange={setFilterOpen}
        variant="funding"
      />
    </>
  );
}
