"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function TransportPage() {
  return (
    <>
      <AppHeader
        variant="detail"
        title="Transport"
        description="Road network, public transport, and logistics infrastructure data."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Transport" },
        ]}
        backLink={{ label: "Back to Overview", href: "/" }}
        onMenuClick={() => {}}
      />
      <ComingSoon
        title="Transport Dashboard"
        description="Road infrastructure data, bus connectivity, village road coverage, and logistics network information is being collected. This section will be available soon."
        icon="Truck"
      />
    </>
  );
}
