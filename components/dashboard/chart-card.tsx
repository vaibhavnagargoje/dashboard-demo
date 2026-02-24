"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title?: string;
  description?: string;
  href?: string;
  source?: string;
  sourceNote?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  legends?: { label: string; color: string }[];
}

export function ChartCard({
  title,
  description,
  href,
  source,
  sourceNote,
  children,
  className,
  actions,
  headerRight,
  footer,
  legends,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "bg-white p-5 rounded-lg border border-border-light shadow-card relative card-hover overflow-hidden group",
        className
      )}
    >
      {/* Expand button (shows on hover) */}
      {href && (
        <Link
          href={href}
          className="expand-btn absolute top-4 right-4 text-subtext-light hover:text-primary transition-all btn-press z-10"
          title="Open Detail View"
        >
          <ExternalLink size={20} />
        </Link>
      )}

      {/* Header */}
      {(title || headerRight) && (
        <div className={cn("flex justify-between items-start mb-4", href && "pr-8")}>
          <div>
            {title &&
              (href ? (
                <Link
                  href={href}
                  className="font-display text-lg text-primary mb-1 hover:underline block"
                >
                  {title}
                </Link>
              ) : (
                <h3 className="font-display text-lg text-primary mb-0.5">{title}</h3>
              ))}
            {description && (
              <p className="text-xs text-subtext-light font-light">{description}</p>
            )}
          </div>
          {headerRight}
        </div>
      )}

      {/* Actions bar */}
      {actions && <div className="mb-4">{actions}</div>}

      {/* Chart content */}
      {children}

      {/* Source footer */}
      {(source || footer || legends) && (
        <div className="mt-4 pt-3 border-t border-border-light flex flex-col sm:flex-row justify-between items-center text-xs text-subtext-light gap-3">
          <div>
            {source && <span>{source}</span>}
            {sourceNote && <span className="italic block text-[11px] mt-0.5">{sourceNote}</span>}
          </div>
          {legends && (
            <div className="flex flex-wrap gap-4">
              {legends.map((l) => (
                <span key={l.label} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: l.color }}
                  />
                  {l.label}
                </span>
              ))}
            </div>
          )}
          {footer}
        </div>
      )}
    </div>
  );
}
