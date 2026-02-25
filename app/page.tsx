"use client";

import { useState, useMemo } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageFooter } from "@/components/layout/page-footer";
import { DataStatusBar } from "@/components/dashboard/data-status-bar";
import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { FilterSidebar } from "@/components/dashboard/filter-sidebar";
import { SectorCard } from "@/components/dashboard/sector-card";
import { DonutChart, DonutLegend } from "@/components/charts/donut-chart";
import { DashboardLineChart } from "@/components/charts/line-chart";
import { WaterfallChart, type WaterfallItem } from "@/components/charts/waterfall-chart";

import sectorsData from "@/data/sectors.json";
import type { KpiCardData } from "@/lib/types";
import { useFilterContext } from "@/lib/filter-context";
import { getDistrictData } from "@/lib/district-data";
import {
  Stethoscope,
  FlaskConical,
  Truck,
  TrendingUp,
  Plus,
  Droplets,
} from "lucide-react";

const INFRA_ICON_MAP: Record<string, React.ElementType> = {
  Stethoscope,
  FlaskConical,
  Truck,
};

export default function OverviewPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const { filters, districtInfo } = useFilterContext();
  const overviewData = getDistrictData("overview", filters.district);

  const kpis = overviewData.kpis as KpiCardData[];
  const livestockComposition = overviewData.livestockComposition as any[];
  const serviceTrends = overviewData.serviceTrends as any[];
  const infraSummary = overviewData.infraSummary as any[];
  const fundingWaterfall = overviewData.fundingWaterfall as WaterfallItem[];
  const milkTrends = overviewData.milkTrends as any[];

  /* ── Derived / filtered data ─── */
  const livestockTotal = useMemo(() => {
    const total = livestockComposition.reduce((s: number, d: any) => s + d.value, 0);
    if (total >= 100000) return `${(total / 100000).toFixed(2)}L`;
    if (total >= 1000) return `${(total / 1000).toFixed(1)}k`;
    return total.toString();
  }, [livestockComposition]);

  const filteredMilkTrends = useMemo(
    () => milkTrends.filter((d: any) => {
      const y = Number(d.year);
      return y >= filters.yearRange[0] && y <= filters.yearRange[1];
    }),
    [milkTrends, filters.yearRange]
  );

  const filteredServiceTrends = useMemo(
    () => serviceTrends.filter((d: any) => {
      const y = Number(d.year);
      return y >= filters.yearRange[0] && y <= filters.yearRange[1];
    }),
    [serviceTrends, filters.yearRange]
  );

  return (
    <>
      {/* Header */}
      <AppHeader
        variant="overview"
        title={`${districtInfo.name} District Dashboard`}
        subtitle="Consolidated Overview"
        onMenuClick={() => {}}
        onFilterClick={() => setFilterOpen(true)}
      />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 bg-bg-light">
        {/* Live status bar */}
        <DataStatusBar />

        {/* ─── Sector Cards Grid ─── */}
        <div>
          <h2 className="text-lg font-bold text-primary mb-4">
            District Sectors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorsData.sectors.map((sector) => (
              <SectorCard
                key={sector.id}
                id={sector.id}
                label={sector.label}
                icon={sector.icon}
                description={sector.description}
                status={sector.status}
                href={sector.href}
                kpis={sector.kpis}
              />
            ))}
          </div>
        </div>

        {/* ─── Key Highlights ─── */}
        <div>
          <h2 className="text-lg font-bold text-primary mb-4">
            Key Highlights
          </h2>
          <KpiGrid>
            {kpis.map((kpi, i) => (
              <KpiCard key={kpi.label} data={kpi} index={i} />
            ))}
          </KpiGrid>
        </div>

        {/* ─── Row: Livestock Donut + Infra & Service Trends ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Livestock Composition Donut */}
          <ChartCard
            title="Livestock Composition"
            description="Breakdown by species (Census 2021)"
          >
            <div className="relative flex-1 flex justify-center items-center min-h-[220px] max-h-[260px]">
              <DonutChart
                data={livestockComposition}
                centerValue={livestockTotal}
                centerLabel="Total Head"
              />
            </div>
            <DonutLegend data={livestockComposition} className="mt-4 pt-3 border-t border-border-light" />
          </ChartCard>

          {/* Infrastructure & Service Trends */}
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-border-light shadow-card card-hover overflow-hidden group flex flex-col">
            <div className="flex justify-between items-start mb-4 pr-8">
              <div>
                <a
                  href="/livestock/census"
                  className="text-lg font-bold text-primary mb-0.5 hover:underline block"
                >
                  Infrastructure &amp; Service Trends
                </a>
                <p className="text-xs text-subtext-light font-light">
                  Veterinary facilities, AI achievement and fisheries production trends.
                </p>
              </div>
              <div className="hidden sm:flex gap-2">
                <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> 228 facilities
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div className="space-y-3 flex flex-col justify-center">
                {infraSummary.map((item) => {
                  const Icon = INFRA_ICON_MAP[item.icon] || Stethoscope;
                  return (
                    <div
                      key={item.label}
                      className="p-4 bg-slate-50 rounded-lg border border-border-light hover:border-primary/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-subtext-light text-[10px] uppercase tracking-wide font-semibold">
                          {item.label}
                        </div>
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {item.value}
                      </div>
                      <p className="text-[10px] text-subtext-light mt-1">
                        {item.sub}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                        <Plus className="h-2.5 w-2.5" /> {item.trend}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="md:col-span-2 relative w-full min-h-[250px] max-h-[320px]">
                <DashboardLineChart
                  data={filteredServiceTrends}
                  xDataKey="year"
                  series={[
                    {
                      dataKey: "vetFacilities",
                      name: "Vet Facilities",
                      color: "#2c699a",
                      strokeWidth: 2,
                    },
                    {
                      dataKey: "aiAchievement",
                      name: "AI Achievement %",
                      color: "#008450",
                      strokeWidth: 2,
                      dashed: true,
                    },
                  ]}
                  height={280}
                  showLegend
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Funding Waterfall ─── */}
        <ChartCard
          title="Funding Allocation & Utilization Flow"
          description="Visualizing the flow of allocated budget (₹ Cr) through various development phases to final utilization. This chart details the breakdown of the ₹500 Cr annual budget across key sectors."
          href="/funding"
          source="Source: District Planning Committee Report, Q3 2023"
          legends={[
            { color: "#3c4e6a", label: "Total Allocation" },
            { color: "#64748b", label: "Sector Breakdown" },
            { color: "#008450", label: "Utilized Total" },
          ]}
        >
          <div className="relative w-full h-[350px] max-h-[400px]">
            <WaterfallChart data={fundingWaterfall} height={350} />
          </div>
        </ChartCard>

        {/* ─── Milk Production Trends ─── */}
        <div className="bg-white p-5 rounded-lg border border-border-light shadow-card card-hover overflow-hidden group">
          <div className="flex justify-between items-start mb-4 pr-8">
            <div>
              <a
                href="/livestock/milk-production"
                className="text-lg font-bold text-primary mb-0.5 hover:underline block"
              >
                Milk Production Trends
              </a>
              <p className="text-xs text-subtext-light font-light">
                District daily milk collection trends from 2012 to 2021.
              </p>
            </div>
            <div className="hidden sm:flex gap-2">
              <div className="px-2.5 py-1 bg-blue-50 text-chart-line-1 text-xs rounded-full font-medium flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> 616k L/day
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3 flex flex-col justify-center">
              <a
                href="/livestock/milk-production"
                className="p-4 bg-slate-50 rounded-lg border border-border-light hover:border-primary/30 transition-colors cursor-pointer block no-underline"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-subtext-light text-[10px] uppercase tracking-wide font-semibold">
                    District Average
                  </div>
                  <Droplets className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  616k{" "}
                  <span className="text-xs font-normal text-subtext-light">
                    L/day
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600">
                  <TrendingUp className="h-3 w-3" /> -4.6% from 2020
                </div>
              </a>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-border-light">
                  <div className="text-subtext-light text-[9px] uppercase tracking-wide font-semibold mb-1">
                    Top Taluka
                  </div>
                  <div className="text-sm font-bold text-chart-line-1">
                    Sangamner
                  </div>
                  <div className="text-[10px] text-subtext-light mt-0.5">
                    310k L/day
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-border-light">
                  <div className="text-subtext-light text-[9px] uppercase tracking-wide font-semibold mb-1">
                    Societies
                  </div>
                  <div className="text-sm font-bold text-state-avg">
                    902
                  </div>
                  <div className="text-[10px] text-subtext-light mt-0.5">
                    Dairy Co-ops
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 relative w-full min-h-[250px] max-h-[320px]">
              <DashboardLineChart
                data={filteredMilkTrends}
                xDataKey="year"
                series={[
                  {
                    dataKey: "districtTotal",
                    name: "District Total",
                    color: "#3c4e6a",
                    strokeWidth: 2.5,
                  },
                  {
                    dataKey: "sangamner",
                    name: "Sangamner",
                    color: "#2c699a",
                    strokeWidth: 1.5,
                  },
                  {
                    dataKey: "kopargaon",
                    name: "Kopargaon",
                    color: "#10b981",
                    strokeWidth: 1.5,
                  },
                ]}
                height={280}
                showLegend
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-light flex flex-col sm:flex-row justify-between items-center text-xs text-subtext-light gap-3">
            <span>Source: Dairy Co-operative Data, Ahilyanagar (2021)</span>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#3c4e6a] rounded-sm" /> District Total
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#2c699a] rounded-sm" /> Sangamner
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#10b981] rounded-sm" /> Kopargaon
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <PageFooter />
      </div>

      {/* Filter sidebar */}
      <FilterSidebar
        open={filterOpen}
        onOpenChange={setFilterOpen}
        variant="overview"
      />
    </>
  );
}
