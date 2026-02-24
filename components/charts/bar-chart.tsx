"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "@/lib/constants";

interface SimpleBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function SimpleBarChart({
  data,
  color = COLORS.primary,
  height = 100,
}: SimpleBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: COLORS.subtextLight }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e5ea",
            borderRadius: "4px",
            fontSize: "11px",
          }}
        />
        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
