"use client";

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "@/lib/constants";

interface SimpleAreaChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function SimpleAreaChart({
  data,
  color = COLORS.stateAvg,
  height = 100,
}: SimpleAreaChartProps) {
  const gradId = `area-grad-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: COLORS.subtextLight }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e5ea",
            borderRadius: "4px",
            fontSize: "11px",
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
