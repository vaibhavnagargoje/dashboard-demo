"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { COLORS } from "@/lib/constants";

interface DualAxisSeriesConfig {
  dataKey: string;
  name: string;
  color: string;
  yAxisId: "left" | "right";
  dashed?: boolean;
  fill?: boolean;
  pointRadius?: number;
  hidden?: boolean;
  strokeWidth?: number;
}

interface DualAxisLineChartProps {
  data: Record<string, string | number>[];
  series: DualAxisSeriesConfig[];
  xDataKey?: string;
  height?: number;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  leftTickFormatter?: (value: number) => string;
  rightTickFormatter?: (value: number) => string;
}

export function DualAxisLineChart({
  data,
  series,
  xDataKey = "year",
  height = 350,
  leftAxisLabel,
  rightAxisLabel,
  leftTickFormatter,
  rightTickFormatter,
}: DualAxisLineChartProps) {
  const visibleSeries = series.filter((s) => !s.hidden);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
        <defs>
          {visibleSeries
            .filter((s) => s.fill)
            .map((s) => (
              <linearGradient key={`grad-${s.dataKey}`} id={`grad-dual-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.12} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.slateLight} vertical={false} />
        <XAxis
          dataKey={xDataKey}
          tick={{ fontSize: 11, fill: COLORS.subtextLight }}
          axisLine={{ stroke: COLORS.borderLight }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          tick={{ fontSize: 11, fill: COLORS.subtextLight }}
          axisLine={false}
          tickLine={false}
          tickFormatter={leftTickFormatter}
          label={
            leftAxisLabel
              ? { value: leftAxisLabel, angle: -90, position: "insideLeft", offset: -5, style: { fontSize: 10, fill: COLORS.subtextLight } }
              : undefined
          }
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: COLORS.subtextLight }}
          axisLine={false}
          tickLine={false}
          tickFormatter={rightTickFormatter}
          label={
            rightAxisLabel
              ? { value: rightAxisLabel, angle: 90, position: "insideRight", offset: -5, style: { fontSize: 10, fill: COLORS.subtextLight } }
              : undefined
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e5ea",
            borderRadius: "6px",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={6}
          wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
        />
        {visibleSeries.map((s) =>
          s.fill ? (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2.5}
              strokeDasharray={s.dashed ? "5 5" : undefined}
              fill={`url(#grad-dual-${s.dataKey})`}
              yAxisId={s.yAxisId}
              dot={
                s.pointRadius
                  ? { r: s.pointRadius, fill: "#fff", stroke: s.color, strokeWidth: 2 }
                  : false
              }
              activeDot={s.pointRadius ? { r: s.pointRadius + 3 } : undefined}
            />
          ) : (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2.5}
              strokeDasharray={s.dashed ? "5 5" : undefined}
              yAxisId={s.yAxisId}
              dot={
                s.pointRadius
                  ? { r: s.pointRadius, fill: "#fff", stroke: s.color, strokeWidth: 2 }
                  : false
              }
              activeDot={s.pointRadius ? { r: s.pointRadius + 3 } : undefined}
            />
          )
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
