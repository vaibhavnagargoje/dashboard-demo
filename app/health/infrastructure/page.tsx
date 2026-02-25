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
import { CompareToggle } from "@/components/controls/compare-toggle";
import { TimelineSlider } from "@/components/controls/timeline-slider";
import { DataTable, type DataTableColumn } from "@/components/controls/data-table";
import { MapView } from "@/components/map/map-view";
import { Card } from "@/components/ui/card";
import { Building2, Stethoscope, BedDouble } from "lucide-react";

import stateAverages from "@/data/state-averages.json";

import type { KpiCardData, RelatedMetricCard } from "@/lib/types";
import { useFilterContext } from "@/lib/filter-context";
import { getDistrictData } from "@/lib/district-data";

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "year", label: "Year", sortable: true },
  { key: "pubHospitals", label: "Public Hospitals", align: "right", mono: true, sortable: true },
  { key: "phcs", label: "PHCs", align: "right", mono: true, sortable: true },
  { key: "subCentres", label: "Sub-Centres", align: "right", mono: true, sortable: true },
  { key: "privHospitals", label: "Private Hospitals", align: "right", mono: true, sortable: true },
  { key: "totalBeds", label: "Total Beds", align: "right", mono: true, sortable: true },
  { key: "doctors", label: "Doctors", align: "right", mono: true, sortable: true },
];

export default function HealthInfrastructurePage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "table" | "map">("chart");
  const [currentYear, setCurrentYear] = useState(2021);
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);
  const [showStateAvg, setShowStateAvg] = useState(false);
  const { filters, districtInfo } = useFilterContext();
  const data = getDistrictData("health-infrastructure", filters.district);

  const kpis = data.kpis as KpiCardData[];
  const chartData = data.chartData as any[];
  const tableData = data.tableData as any[];
  const relatedMetrics = data.relatedMetrics as RelatedMetricCard[];
  const talukas = data.talukas as any[];

  const visibleTalukas = useMemo(
    () => filters.talukas.length === 0 ? talukas : talukas.filter((t: any) => filters.talukas.includes(t.name)),
    [talukas, filters.talukas]
  );

  const series = useMemo(() => [
    {
      dataKey: "phcs",
      name: "PHCs",
      color: "#2c699a",
      yAxisId: "left" as const,
      strokeWidth: 2.5,
      fill: true,
    },
    {
      dataKey: "pubHospitals",
      name: "Public Hospitals",
      color: "#3c4e6a",
      yAxisId: "left" as const,
      strokeWidth: 2,
    },
    {
      dataKey: "totalBeds",
      name: "Total Beds",
      color: "#d4af37",
      yAxisId: "right" as const,
      strokeWidth: 2,
    },
  ], []);

  const filteredData = useMemo(
    () => (chartData as any[]).filter((d: any) => Number(d.year) <= currentYear),
    [chartData, currentYear]
  );

  const chartDataWithAvg = useMemo(() => {
    if (!showStateAvg) return filteredData;
    const avgMap = new Map(
      (stateAverages["health-infrastructure"].data as any[]).map((d: any) => [d.year, d.stateAvg])
    );
    return filteredData.map((d: any) => ({ ...d, stateAvg: avgMap.get(d.year) ?? null }));
  }, [filteredData, showStateAvg]);

  const allSeries = useMemo(() => {
    const base: any[] = [...series];
    if (showStateAvg) {
      base.push({ dataKey: "stateAvg", name: "State Average", color: "#94a3b8", yAxisId: "right" as const, dashed: true, strokeWidth: 1.5 });
    }
    return base;
  }, [series, showStateAvg]);

  return (
    <>
      <AppHeader
        variant="detail"
        title="Health Infrastructure"
        description={`Public & private health facilities, beds, and medical staff across ${districtInfo.name} district (2012–2021).`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Health", href: "/health" },
          { label: "Infrastructure" },
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
          title="Health Infrastructure Trends"
          description="PHCs and public hospitals (left axis) with total hospital beds (right axis) from 2012 to 2021."
          source="Source: District Statistical Abstract, Ahmednagar (2021)"
          legends={[
            { color: "#2c699a", label: "PHCs" },
            { color: "#3c4e6a", label: "Public Hospitals" },
            { color: "#d4af37", label: "Total Beds" },
          ]}
          headerRight={
            <div className="flex items-center gap-4">
              <CompareToggle
                label="Compare with State Avg"
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
              <div className="relative w-full" style={{ height: 400 }}>
                <DualAxisLineChart
                  data={chartDataWithAvg}
                  series={allSeries}
                  xDataKey="year"
                  leftAxisLabel="Facilities"
                  rightAxisLabel="Beds"
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
                      value: `PHCs: ${t.phcs} | Hosp: ${t.pubHospitals + t.privHospitals} | Beds: ${t.beds}`,
                      color: t.color,
                    }))}
                    onMarkerClick={(m) => setSelectedTaluka(m.label)}
                    selectedMarker={selectedTaluka}
                    boundaryPoints={talukas.map((t: any) => ({ lat: t.lat, lng: t.lng, name: t.name }))}
                  />
                </Card>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Taluka-wise Facilities</div>
                {[...visibleTalukas]
                  .sort((a, b) => b.beds - a.beds)
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
                          <span className="text-xs font-mono font-semibold">{t.beds} beds</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-4 text-xs text-subtext-light">
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />Hosp: {t.pubHospitals}</span>
                          <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3" />PHCs: {t.phcs}</span>
                          <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />Doctors: {t.doctors}</span>
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
