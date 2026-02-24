"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageFooter } from "@/components/layout/page-footer";
import { MapView } from "@/components/map/map-view";
import { Card } from "@/components/ui/card";
import geoData from "@/data/geographic.json";
import {
  Droplets,
  Syringe,
  Stethoscope,
  MapPin,
  TrendingUp,
  BarChart3,
  Users,
} from "lucide-react";

export default function GeographicPage() {
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);

  const markers = geoData.talukas.map((t) => ({
    lng: t.lng,
    lat: t.lat,
    label: t.name,
    value: `Milk: ${t.milkProduction} | Vacc: ${t.vaccinations} | Clinics: ${t.clinics}`,
    color: t.color,
  }));

  const selected = geoData.talukas.find((t) => t.name === selectedTaluka);

  // Summary stats
  const totalTalukas = geoData.talukas.length;
  const totalClinics = geoData.talukas.reduce((s, t) => s + t.clinics, 0);

  return (
    <>
      <AppHeader
        variant="detail"
        title="Geographic View"
        description="Taluka-wise distribution of livestock data, services, and infrastructure across Ahilyanagar district."
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
            <div className="p-2 bg-chart-line-1/10 rounded-lg">
              <Droplets className="h-4 w-4 text-chart-line-1" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">Top Producer</div>
              <div className="text-lg font-bold text-chart-line-1">Ahilyanagar</div>
            </div>
          </Card>
          <Card className="p-3 border-border-light shadow-card flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Stethoscope className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">Total Clinics</div>
              <div className="text-lg font-bold text-emerald-700">{totalClinics}</div>
            </div>
          </Card>
          <Card className="p-3 border-border-light shadow-card flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">Growth</div>
              <div className="text-lg font-bold text-amber-700">+4.9%</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden border-border-light shadow-card">
              <MapView
                className="h-[500px] md:h-[600px]"
                center={geoData.center as [number, number]}
                zoom={geoData.zoom}
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
                        Milk Production
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {selected.milkProduction}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                    <Syringe className="h-4 w-4 text-secondary" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">
                        Vaccinations
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {selected.vaccinations}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                    <Stethoscope className="h-4 w-4 text-chart-line-2" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-subtext-light font-semibold">
                        Clinics
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {selected.clinics}
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
                {geoData.talukas.map((t) => (
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
                    <span className="text-xs text-subtext-light">
                      {t.milkProduction}
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
