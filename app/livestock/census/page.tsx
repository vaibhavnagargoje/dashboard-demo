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
import { Hospital, Stethoscope } from "lucide-react";

import infraData from "@/data/infrastructure.json";
import type { KpiCardData, RelatedMetricCard } from "@/lib/types";

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "year", label: "Year", sortable: true },
  { key: "totalFacilities", label: "Total Facilities", align: "right", mono: true, sortable: true },
  { key: "vetHospitals", label: "Vet Hospitals", align: "right", mono: true, sortable: true },
  { key: "firstAidCentres", label: "First-Aid Centres", align: "right", mono: true, sortable: true },
  { key: "livestock", label: "Livestock Population", align: "right", mono: true, sortable: true },
];

export default function InfrastructurePage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table" | "map">("chart");
  const [currentYear, setCurrentYear] = useState(2021);
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);

  const { kpis: rawKpis, chartData, tableData, relatedMetrics: rawMetrics, talukas } = infraData;
  const kpis = rawKpis as KpiCardData[];
  const relatedMetrics = rawMetrics as RelatedMetricCard[];

  /* Dual-axis series: Total Facilities (left) + Livestock in '000 (right) */
  const series = useMemo(() => [
    {
      dataKey: "totalFacilities",
      name: "Total Vet Facilities",
      color: "#2c699a",
      yAxisId: "left" as const,
      strokeWidth: 2.5,
      fill: true,
    },
    {
      dataKey: "livestock",
      name: "Livestock ('000)",
      color: "#008450",
      yAxisId: "right" as const,
      strokeWidth: 2,
    },
  ], []);

  const filteredData = useMemo(
    () => chartData.filter((d) => Number(d.year) <= currentYear),
    [chartData, currentYear]
  );

  return (
    <>
      <AppHeader
        variant="detail"
        title="Veterinary Facilities & Livestock Census"
        description="Veterinary infrastructure and livestock population across all 14 talukas (2012–2021)."
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
        {/* KPI strip */}
        <KpiGrid>
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.label} data={kpi} index={i} />
          ))}
        </KpiGrid>

        {/* Main chart card */}
        <ChartCard
          title="Veterinary Facilities & Livestock Trends"
          description="Total veterinary facilities (left axis) versus total livestock population in thousands (right axis)."
          source="Source: District Veterinary & Animal Husbandry Office, Ahilyanagar (2021)"
          legends={[
            { color: "#2c699a", label: "Total Vet Facilities" },
            { color: "#008450", label: "Livestock ('000)" },
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
                  leftAxisLabel="Vet Facilities"
                  rightAxisLabel="Livestock ('000)"
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
                      value: `Facilities: ${t.totalFacilities} | Hospitals: ${t.vetHospitals}`,
                      color: t.color,
                    }))}
                    onMarkerClick={(m) => setSelectedTaluka(m.label)}
                    selectedMarker={selectedTaluka}
                  />
                </Card>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Taluka-wise Facilities</div>
                {[...talukas]
                  .sort((a, b) => b.totalFacilities - a.totalFacilities)
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
                          <span className="text-xs font-mono">{t.totalFacilities} total</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-4 text-xs text-subtext-light">
                          <span className="flex items-center gap-1"><Hospital className="h-3 w-3" />{t.vetHospitals} hospitals</span>
                          <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3" />{t.firstAidCentres} first-aid</span>
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
