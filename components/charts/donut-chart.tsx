"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  centerLabel?: string;
  centerValue?: string;
  innerRadius?: string | number;
  outerRadius?: string | number;
  height?: number;
  onSegmentHover?: (index: number | null) => void;
  activeIndex?: number | null;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  innerRadius = "72%",
  outerRadius = "100%",
  height = 240,
  onSegmentHover,
  activeIndex,
}: DonutChartProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  return (
    <div className="relative flex justify-center items-center" style={{ minHeight: height, maxHeight: height + 20 }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
            animationBegin={0}
            animationDuration={1200}
            onMouseEnter={(_, index) => onSegmentHover?.(index)}
            onMouseLeave={() => onSegmentHover?.(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{
                  transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                  transformOrigin: "center",
                  transition: "transform 0.2s ease",
                }}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
              name,
            ]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e5ea",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center overlay */}
      {(centerValue || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="font-display text-2xl font-bold text-primary">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-subtext-light">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface DonutLegendProps {
  data: { name: string; value: number; color: string }[];
  onHover?: (index: number | null) => void;
  columns?: number;
  className?: string;
}

export function DonutLegend({ data, onHover, columns = 2, className }: DonutLegendProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  return (
    <div
      className={cn(
        "mt-4 pt-3 border-t border-border-light gap-3 text-xs",
        columns === 2 ? "grid grid-cols-2" : "grid grid-cols-3",
        className
      )}
    >
      {data.map((item, i) => (
        <button
          key={item.name}
          className="flex items-center gap-2 py-1 hover:bg-slate-50 rounded px-1 transition-colors text-left"
          onMouseEnter={() => onHover?.(i)}
          onMouseLeave={() => onHover?.(null)}
        >
          <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
          <div>
            <span className="text-text-light font-medium block">{item.name}</span>
            <span className="text-subtext-light">
              {item.value.toLocaleString()} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
