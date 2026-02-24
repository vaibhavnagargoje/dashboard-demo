"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useMemo } from "react";

export interface DataTableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  mono?: boolean;
  badge?: boolean;
  badgeColorKey?: string;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: Record<string, any>[];
  className?: string;
  compact?: boolean;
  striped?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

export function DataTable({
  columns,
  data,
  className,
  compact = false,
  striped = true,
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className={cn("rounded-md border border-border-light overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-xs font-semibold text-subtext-light uppercase tracking-wider",
                  compact ? "py-2 px-3" : "py-3 px-4",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.sortable && "cursor-pointer select-none hover:text-text-light transition-colors"
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )
                  )}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, rowIdx) => (
            <TableRow
              key={rowIdx}
              className={cn(
                "transition-colors",
                striped && rowIdx % 2 === 1 && "bg-slate-50/50"
              )}
            >
              {columns.map((col) => {
                const value = row[col.key];
                return (
                  <TableCell
                    key={col.key}
                    className={cn(
                      compact ? "py-2 px-3" : "py-3 px-4",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.mono && "font-mono text-sm tabular-nums",
                      "text-sm"
                    )}
                  >
                    {col.render ? (
                      col.render(value, row)
                    ) : col.badge ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium px-2 py-0.5",
                          STATUS_COLORS[row[col.badgeColorKey || "statusColor"] || "gray"]
                        )}
                      >
                        {value}
                      </Badge>
                    ) : (
                      <span>{value}</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
