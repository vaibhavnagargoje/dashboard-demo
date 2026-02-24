"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { KpiCardData } from "@/lib/types";

function getIcon(name: string): React.ElementType | null {
  return ((LucideIcons as unknown) as Record<string, React.ElementType>)[name] || null;
}

interface KpiCardProps {
  data: KpiCardData;
  index?: number;
}

export function KpiCard({ data, index = 0 }: KpiCardProps) {
  const Icon = getIcon(data.icon);
  const TrendIcon = data.trend?.direction === "up" ? TrendingUp : data.trend?.direction === "down" ? TrendingDown : null;

  const content = (
    <div className={cn(
      "bg-white border border-border-light rounded-lg p-4 shadow-card card-hover",
      data.href && "cursor-pointer group/kpi"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-subtext-light font-medium">{data.label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", data.iconBg)}>
          {Icon && <Icon size={16} className="text-primary" />}
        </div>
      </div>
      <div
        className="text-2xl font-display font-bold text-primary kpi-animate"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {data.value}
      </div>
      {data.trend && data.trend.value && (
        <div className="flex items-center gap-1 mt-1">
          {TrendIcon && (
            <TrendIcon
              size={14}
              className={data.trend.direction === "up" ? "text-emerald-500" : "text-red-500"}
            />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              data.trend.direction === "up" ? "text-emerald-600" : data.trend.direction === "down" ? "text-red-600" : "text-subtext-light"
            )}
          >
            {data.trend.value}
          </span>
          <span className="text-xs text-subtext-light">{data.trend.context}</span>
        </div>
      )}
      {data.trend && !data.trend.value && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-subtext-light">{data.trend.context}</span>
        </div>
      )}
      {data.progress && (
        <div className="mt-2">
          <Progress value={data.progress.value} className="h-1.5" />
          <span className="text-xs text-subtext-light mt-1 block">{data.progress.label}</span>
        </div>
      )}
      {data.href && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-primary font-medium opacity-0 group-hover/kpi:opacity-100 transition-opacity">
          View Details <ExternalLink size={10} />
        </div>
      )}
    </div>
  );

  if (data.href) {
    return (
      <Link href={data.href} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}

interface KpiGridProps {
  items?: KpiCardData[];
  children?: React.ReactNode;
}

export function KpiGrid({ items, children }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items
        ? items.map((item, i) => (
            <KpiCard key={item.label} data={item} index={i} />
          ))
        : children}
    </div>
  );
}
