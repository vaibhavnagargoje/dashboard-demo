"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function ExportsPage() {
  return (
    <>
      <AppHeader
        variant="detail"
        title="Export Data"
        description="Livestock and dairy product export statistics."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Livestock", href: "/livestock/milk-production" },
          { label: "Export Data" },
        ]}
        backLink={{ label: "Back to Overview", href: "/" }}
        onMenuClick={() => {}}
      />
      <ComingSoon
        title="Export Data"
        description="Export statistics for dairy products, livestock trade, and inter-district supply chain data are being collected. This section will be available soon."
        icon="Truck"
      />
    </>
  );
}
