"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { COLORS, WATERFALL_COLORS, WATERFALL_DETAILED_COLORS } from "@/lib/constants";

export interface WaterfallItem {
  category: string;
  base: number;
  value: number;
  type: "total" | "expense" | "balance";
}

interface WaterfallChartProps {
  data: WaterfallItem[];
  height?: number;
  detailed?: boolean;
  showLabels?: boolean;
}

function getBarColor(type: string, detailed: boolean): string {
  const palette = detailed ? WATERFALL_DETAILED_COLORS : WATERFALL_COLORS;
  if (type === "total") return palette.total;
  if (type === "balance") return palette.balance;
  return palette.expense;
}

export function WaterfallChart({
  data,
  height = 350,
  detailed = false,
  showLabels = false,
}: WaterfallChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.slateLight} vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 10, fill: COLORS.subtextLight }}
          axisLine={{ stroke: COLORS.borderLight }}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fontSize: 11, fill: COLORS.subtextLight }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${v}`}
        />
        <Tooltip
          formatter={(value: number) => [`₹${value} Cr`, "Amount"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e5ea",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        />
        {/* Invisible base bar */}
        <Bar dataKey="base" stackId="stack" fill="transparent" barSize={40} radius={0} />
        {/* Visible value bar */}
        <Bar dataKey="value" stackId="stack" barSize={40} radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.type, detailed)} />
          ))}
          {showLabels && (
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v: number) => {
                const item = data.find((d) => d.value === v);
                if (!item) return `₹${v}`;
                if (item.type === "total") return `₹${v} Cr`;
                if (item.type === "balance") return `₹${v} Cr`;
                return `-₹${v}`;
              }}
              style={{ fontSize: "10px", fill: COLORS.subtextLight, fontWeight: 500 }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
