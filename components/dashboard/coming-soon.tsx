"use client";

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { ArrowLeft, Construction } from "lucide-react";

function getIcon(name: string): React.ElementType | null {
  return ((LucideIcons as unknown) as Record<string, React.ElementType>)[name] || null;
}

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: string;
  backHref?: string;
  backLabel?: string;
}

export function ComingSoon({
  title,
  description,
  icon = "Construction",
  backHref = "/",
  backLabel = "Back to Overview",
}: ComingSoonProps) {
  const Icon = getIcon(icon) || Construction;

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-bg-light min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
          <Icon size={36} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
        <p className="text-subtext-light text-sm leading-relaxed mb-6">
          {description ||
            "This section is currently under development. Data collection and visualization tools are being set up. Check back soon for updates."}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold mb-8">
          <Construction size={14} />
          Coming Soon
        </div>
        <div className="block">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
