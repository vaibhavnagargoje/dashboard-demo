"use client";

import * as LucideIcons from "lucide-react";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { SimpleAreaChart } from "@/components/charts/area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import type { RelatedMetricCard as MetricData } from "@/lib/types";

function getIcon(name: string): React.ElementType | null {
  return ((LucideIcons as unknown) as Record<string, React.ElementType>)[name] || null;
}

interface MiniChartCardProps {
  data: MetricData;
}

export function MiniChartCard({ data }: MiniChartCardProps) {
  const Icon = getIcon(data.icon);

  return (
    <div className="bg-white border border-border-light rounded-lg p-4 shadow-card card-hover">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          {Icon && <Icon size={14} className="text-primary" />}
        </div>
        <div>
          <h4 className="text-sm font-medium text-primary leading-tight">{data.title}</h4>
          <p className="text-[10px] text-subtext-light">{data.subtitle}</p>
        </div>
      </div>
      <div className="w-full">
        {data.chartType === "bar" && (
          <SimpleBarChart
            data={data.data}
            color={data.colors?.[0] || "#3c4e6a"}
            height={80}
          />
        )}
        {data.chartType === "area" && (
          <SimpleAreaChart
            data={data.data}
            color={data.colors?.[0] || "#d4af37"}
            height={80}
          />
        )}
        {data.chartType === "donut" && (
          <DonutChart
            data={data.data.map((d, i) => ({
              name: d.label,
              value: d.value,
              color: data.colors?.[i] || "#3c4e6a",
            }))}
            innerRadius="70%"
            outerRadius="100%"
            height={90}
          />
        )}
      </div>
    </div>
  );
}

interface RelatedMetricsGridProps {
  metrics: MetricData[];
}

export function RelatedMetricsGrid({ metrics }: RelatedMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="md:col-span-3">
        <h3 className="text-sm font-medium text-subtext-light mb-3">Related Metrics</h3>
      </div>
      {metrics.map((metric) => (
        <MiniChartCard key={metric.title} data={metric} />
      ))}
    </div>
  );
}
