"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function EducationPage() {
  return (
    <>
      <AppHeader
        variant="detail"
        title="Education"
        description="School infrastructure, enrollment, and literacy data for the district."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Education" },
        ]}
        backLink={{ label: "Back to Overview", href: "/" }}
        onMenuClick={() => {}}
      />
      <ComingSoon
        title="Education Dashboard"
        description="Data covering schools, teacher-student ratios, enrollment trends, dropout rates, mid-day meal programs, and digital infrastructure in educational institutions is being compiled."
        icon="GraduationCap"
      />
    </>
  );
}
