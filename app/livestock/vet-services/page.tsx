"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function VetServicesPage() {
  return (
    <>
      <AppHeader
        variant="detail"
        title="Veterinary Services"
        description="Detailed veterinary service delivery data across all talukas."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Livestock", href: "/livestock/milk-production" },
          { label: "Vet Services" },
        ]}
        backLink={{ label: "Back to Overview", href: "/" }}
        onMenuClick={() => {}}
      />
      <ComingSoon
        title="Veterinary Services"
        description="Detailed data on veterinary clinics, mobile units, AI centers, disease control programs, and vaccination drives is being compiled. This section will be available soon."
        icon="Stethoscope"
      />
    </>
  );
}
