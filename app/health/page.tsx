"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageFooter } from "@/components/layout/page-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Syringe, Baby, HeartPulse, ArrowRight } from "lucide-react";

const sections = [
  {
    title: "Health Infrastructure",
    description: "Public & private hospitals, PHCs, sub-centres, beds, and medical staff across 14 talukas.",
    href: "/health/infrastructure",
    icon: Building2,
    kpis: [
      { label: "Public Hospitals", value: "27" },
      { label: "PHCs", value: "105" },
      { label: "Total Beds", value: "18,077" },
    ],
    color: "#2c699a",
  },
  {
    title: "Immunization",
    description: "DPT/Pentavalent, Polio, BCG, and Measles vaccine coverage across the district.",
    href: "/health/immunization",
    icon: Syringe,
    kpis: [
      { label: "DPT/Penta", value: "153,328" },
      { label: "Polio", value: "153,328" },
      { label: "BCG", value: "151,030" },
    ],
    color: "#10b981",
  },
  {
    title: "Maternal & Child Health",
    description: "Registered births, infant mortality, sex ratio at birth, and delivery statistics.",
    href: "/health/maternal-child",
    icon: Baby,
    kpis: [
      { label: "Registered Births", value: "145,504" },
      { label: "Sex Ratio", value: "916" },
      { label: "ANC Coverage", value: "90.1%" },
    ],
    color: "#e07b39",
  },
  {
    title: "Nutrition & Anganwadis",
    description: "Child malnutrition rates (Normal/MAM/SAM) and Anganwadi centre coverage.",
    href: "/health/nutrition",
    icon: HeartPulse,
    kpis: [
      { label: "Normal Weight", value: "94.3%" },
      { label: "MAM Rate", value: "5.0%" },
      { label: "Working AW", value: "11,810" },
    ],
    color: "#d4af37",
  },
];

export default function HealthPage() {
  return (
    <>
      <AppHeader
        variant="detail"
        title="Health"
        description="Comprehensive health data for Ahmednagar district — hospitals, immunization, maternal & child indicators, and nutrition."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Health" },
        ]}
        backLink={{ label: "Back to Overview", href: "/" }}
        onMenuClick={() => {}}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 bg-bg-light">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.href} href={s.href} className="group">
                <Card className="h-full border-border-light hover:border-primary/30 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                          <Icon className="h-5 w-5" style={{ color: s.color }} />
                        </div>
                        <CardTitle className="text-lg font-semibold text-primary">{s.title}</CardTitle>
                      </div>
                      <ArrowRight className="h-4 w-4 text-subtext-light group-hover:text-primary transition-colors" />
                    </div>
                    <CardDescription className="text-sm text-subtext-light mt-1">{s.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      {s.kpis.map((k) => (
                        <div key={k.label} className="flex-1 bg-bg-light rounded-lg p-2.5 text-center">
                          <div className="text-xs text-subtext-light">{k.label}</div>
                          <div className="text-sm font-bold font-mono text-primary mt-0.5">{k.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        <PageFooter />
      </div>
    </>
  );
}
