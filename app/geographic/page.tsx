"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageFooter } from "@/components/layout/page-footer";
import { MapView } from "@/components/map/map-view";
import { Card } from "@/components/ui/card";
import { useFilterContext } from "@/lib/filter-context";
import { getDistrictData } from "@/lib/district-data";
import {
  Droplets,
  Fish,
  Stethoscope,
  MapPin,
  TrendingUp,
  Target,
} from "lucide-react";

export default function GeographicPage() {
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);
  const { filters, districtInfo } = useFilterContext();
  const geoData = getDistrictData("geographic", filters.district);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const talukas: any[] = geoData.talukas ?? [];

  const markers = talukas.map((t) => ({
    lng: t.lng,
    lat: t.lat,
    label: t.name,
    value: `Milk: ${t.milkDaily}k L/day | Vet: ${t.vetFacilities} | Fish: ${t.fishProd}T`,
    color: t.color,
  }));

  const selected = talukas.find((t) => t.name === selectedTaluka);

  // Summary stats
  const totalTalukas = talukas.length;
  const totalVetFacilities = talukas.reduce((s: number, t: any) => s + t.vetFacilities, 0);
  const totalFishProd = talukas.reduce((s: number, t: any) => s + t.fishProd, 0);
  const avgAI = (talukas.reduce((s: number, t: any) => s + t.aiAchievement, 0) / totalTalukas).toFixed(1);

  return (
    <>
      <AppHeader
        variant="detail"
        title="Geographic View"
        description={`Taluka-wise distribution of livestock data, services, and infrastructure across ${districtInfo.name} district (2021).`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Geographic View" },
        ]}
        backLink={{ label: "Back to Overview", href: "/" }}
        onMenuClick={() => {}}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 bg-bg-light">
        {/* Quick summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 border-border-light shadow-card flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">Talukas</div>
              <div className="text-lg font-bold text-primary">{totalTalukas}</div>
            </div>
          </Card>
          <Card className="p-3 border-border-light shadow-card flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Stethoscope className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">Vet Facilities</div>
              <div className="text-lg font-bold text-emerald-700">{totalVetFacilities}</div>
            </div>
          </Card>
          <Card className="p-3 border-border-light shadow-card flex items-center gap-3">
            <div className="p-2 bg-chart-line-1/10 rounded-lg">
              <Fish className="h-4 w-4 text-chart-line-1" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">Fish Production</div>
              <div className="text-lg font-bold text-chart-line-1">{totalFishProd.toLocaleString()}T</div>
            </div>
          </Card>
          <Card className="p-3 border-border-light shadow-card flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Target className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">Avg AI Achievement</div>
              <div className="text-lg font-bold text-amber-700">{avgAI}%</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden border-border-light shadow-card">
              <MapView
                className="h-[500px] md:h-[600px]"
                center={districtInfo.center as [number, number]}
                zoom={districtInfo.zoom}
                markers={markers}
                onMarkerClick={(m) => setSelectedTaluka(m.label)}
                selectedMarker={selectedTaluka}
              />
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Selected taluka detail */}
            {selected ? (
              <Card className="p-4 border-border-light shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.color }} />
                  <h3 className="font-bold text-primary text-base">
                    {selected.name}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                    <Droplets className="h-4 w-4 text-chart-line-1" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">
                        Daily Milk
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {selected.milkDaily}k L/day
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                    <Stethoscope className="h-4 w-4 text-emerald-600" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">
                        Vet Facilities
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {selected.vetFacilities}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                    <Fish className="h-4 w-4 text-chart-line-1" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">
                        Fish Production
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {selected.fishProd} T
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                    <Target className="h-4 w-4 text-amber-600" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">
                        AI Achievement
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {selected.aiAchievement}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-4 border-border-light shadow-card">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <MapPin className="h-8 w-8 text-subtext-light/40 mb-2" />
                  <p className="text-sm text-subtext-light">
                    Click a marker on the map to view taluka details
                  </p>
                </div>
              </Card>
            )}

            {/* Taluka list */}
            <Card className="border-border-light shadow-card overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-border-light">
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wide">
                  All Talukas
                </h4>
              </div>
              <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
                {[...talukas]
                  .sort((a, b) => b.milkDaily - a.milkDaily)
                  .map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTaluka(t.name)}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors hover:bg-slate-50 border-b border-border-light/50 last:border-0 ${
                      selectedTaluka === t.name
                        ? "bg-primary/5 text-primary font-medium"
                        : "text-text-light"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      {t.name}
                    </span>
                    <span className="text-xs text-subtext-light font-mono">
                      {t.milkDaily}k L/day
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <PageFooter />
      </div>
    </>
  );
}
