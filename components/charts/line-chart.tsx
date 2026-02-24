"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { COLORS } from "@/lib/constants";

interface SeriesConfig {
  dataKey: string;
  name: string;
  color: string;
  dashed?: boolean;
  fill?: boolean;
  pointRadius?: number;
  hidden?: boolean;
  yAxisId?: string;
  strokeWidth?: number;
}

interface LineChartProps {
  data: Record<string, string | number>[];
  series: SeriesConfig[];
  xDataKey?: string;
  height?: number;
  yAxisRight?: boolean;
  yTickFormatter?: (value: number) => string;
  gradient?: { id: string; color: string; startOpacity: number; endOpacity: number };
  showLegend?: boolean;
  legendPosition?: "top" | "bottom";
}

export function DashboardLineChart({
  data,
  series,
  xDataKey = "year",
  height = 280,
  yAxisRight = false,
  yTickFormatter,
  gradient,
  showLegend = true,
  legendPosition = "bottom",
}: LineChartProps) {
  const visibleSeries = series.filter((s) => !s.hidden);
  const hasFill = visibleSeries.some((s) => s.fill);

  const ChartComponent = hasFill ? AreaChart : RechartsLineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          {gradient && (
            <linearGradient id={gradient.id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradient.color} stopOpacity={gradient.startOpacity} />
              <stop offset="100%" stopColor={gradient.color} stopOpacity={gradient.endOpacity} />
            </linearGradient>
          )}
          {/* Additional gradients for series with fill */}
          {visibleSeries
            .filter((s) => s.fill)
            .map((s) => (
              <linearGradient key={`grad-${s.dataKey}`} id={`grad-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
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
          orientation={yAxisRight ? "right" : "left"}
          tick={{ fontSize: 11, fill: COLORS.subtextLight }}
          axisLine={false}
          tickLine={false}
          tickFormatter={yTickFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e5ea",
            borderRadius: "6px",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          }}
          formatter={(value: number, name: string) => {
            if (yTickFormatter) return [yTickFormatter(value), name];
            return [value.toLocaleString(), name];
          }}
        />
        {showLegend && (
          <Legend
            verticalAlign={legendPosition}
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
          />
        )}
        {visibleSeries.map((s) =>
          s.fill ? (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2}
              strokeDasharray={s.dashed ? "5 5" : undefined}
              fill={`url(#grad-${s.dataKey})`}
              dot={
                s.pointRadius !== undefined && s.pointRadius > 0
                  ? { r: s.pointRadius, fill: "#fff", stroke: s.color, strokeWidth: 2 }
                  : false
              }
              activeDot={s.pointRadius ? { r: s.pointRadius + 3, stroke: s.color, strokeWidth: 2 } : undefined}
              yAxisId={s.yAxisId || undefined}
            />
          ) : (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2}
              strokeDasharray={s.dashed ? "5 5" : undefined}
              dot={
                s.pointRadius !== undefined && s.pointRadius > 0
                  ? { r: s.pointRadius, fill: "#fff", stroke: s.color, strokeWidth: 2 }
                  : false
              }
              activeDot={s.pointRadius ? { r: s.pointRadius + 3, stroke: s.color, strokeWidth: 2 } : undefined}
              yAxisId={s.yAxisId || undefined}
            />
          )
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
