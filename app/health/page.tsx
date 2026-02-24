"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function HealthPage() {
  return (
    <>
      <AppHeader
        variant="detail"
        title="Health"
        description="Public health infrastructure and service delivery across the district."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Health" },
        ]}
        backLink={{ label: "Back to Overview", href: "/" }}
        onMenuClick={() => {}}
      />
      <ComingSoon
        title="Health Dashboard"
        description="Comprehensive health data including Primary Health Centers, hospital occupancy, disease surveillance, maternal & child health indicators, and rural health statistics is being compiled."
        icon="HeartPulse"
      />
    </>
  );
}
