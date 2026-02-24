"use client";

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { ArrowRight, Construction } from "lucide-react";
import { cn } from "@/lib/utils";

function getIcon(name: string): React.ElementType | null {
  return ((LucideIcons as unknown) as Record<string, React.ElementType>)[name] || null;
}

interface SectorKpi {
  label: string;
  value: string;
  trend: string;
}

interface SectorCardProps {
  id: string;
  label: string;
  icon: string;
  description: string;
  status: "active" | "coming-soon" | string;
  href: string;
  kpis: SectorKpi[];
  className?: string;
}

export function SectorCard({
  label,
  icon,
  description,
  status,
  href,
  kpis,
  className,
}: SectorCardProps) {
  const Icon = getIcon(icon) || Construction;
  const isComingSoon = status === "coming-soon";

  return (
    <Link
      href={href}
      className={cn(
        "block no-underline bg-white border border-border-light rounded-lg p-5 shadow-card transition-all duration-200 group/sector",
        isComingSoon
          ? "opacity-80 hover:opacity-100"
          : "card-hover",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isComingSoon ? "bg-amber-50" : "bg-primary/10"
            )}
          >
            <Icon
              size={20}
              className={isComingSoon ? "text-amber-500" : "text-primary"}
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary leading-tight">
              {label}
            </h3>
            {isComingSoon && (
              <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                Coming Soon
              </span>
            )}
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-subtext-light/40 group-hover/sector:text-primary group-hover/sector:translate-x-0.5 transition-all mt-1"
        />
      </div>

      {/* Description */}
      <p className="text-xs text-subtext-light leading-relaxed mb-4 line-clamp-2">
        {description}
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-slate-50 rounded-md px-2 py-2 text-center"
          >
            <div
              className={cn(
                "text-sm font-bold leading-tight",
                isComingSoon ? "text-subtext-light" : "text-primary"
              )}
            >
              {kpi.value}
            </div>
            <div className="text-[9px] text-subtext-light mt-0.5 truncate">
              {kpi.label}
            </div>
            <div
              className={cn(
                "text-[9px] font-medium mt-0.5",
                isComingSoon
                  ? "text-subtext-light/60"
                  : "text-emerald-600"
              )}
            >
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}
