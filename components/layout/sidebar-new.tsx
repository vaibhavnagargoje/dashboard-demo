"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  HeartPulse,
  GraduationCap,
  Landmark,
  Truck,
  MapPinned,
  ChevronDown,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useFilterContext } from "@/lib/filter-context";
import sectorsData from "@/data/sectors.json";

/* ── Icon registry ─────────────────────────────── */
const icons: Record<string, React.ElementType> = {
  LayoutDashboard,
  PawPrint,
  HeartPulse,
  GraduationCap,
  Landmark,
  Truck,
  MapPinned,
  Download,
  Settings,
  LogOut,
};

function getIcon(name: string) {
  return icons[name] ?? LayoutDashboard;
}

/* ── Types ──────────────────────────────────────── */
interface SectorChild {
  label: string;
  path: string;
  page: string;
}

interface Sector {
  id: string;
  label: string;
  icon: string;
  status: string;
  href: string;
  children: SectorChild[];
}

/* ── Sidebar inner content ─────────────────────── */
function SidebarContent({ pathname }: { pathname: string }) {
  const sectors = sectorsData.sectors as Sector[];
  const { districtInfo } = useFilterContext();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-border-light">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {districtInfo.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-base leading-tight text-primary block">
              {districtInfo.name}
            </span>
            <span className="text-[11px] font-normal text-subtext-light">
              District Govt.
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 scrollbar-hide">
        {/* Overview — always top-level */}
        <Link
          href="/"
          className={cn(
            "nav-link flex items-center gap-3 px-3 py-2.5 rounded-md text-sm btn-press transition-all",
            pathname === "/"
              ? "active text-primary bg-slate-50 font-medium"
              : "text-subtext-light hover:bg-slate-50 hover:text-primary"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </Link>

        {/* Sector label */}
        <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-subtext-light/60">
          Sectors
        </p>

        {/* Sector groups */}
        {sectors.map((sector) => {
          const Icon = getIcon(sector.icon);
          const isComingSoon = sector.status === "coming-soon";

          // Check if any child route is active
          const isChildActive = sector.children.some(
            (c) => c.path !== "#" && pathname.startsWith(c.path)
          );
          // Or if the top-level sector href is active
          const isSectorActive =
            isChildActive || (sector.href !== "#" && pathname === sector.href);

          // Sectors without children — render as direct link
          if (sector.children.length === 0) {
            return (
              <Link
                key={sector.id}
                href={sector.href}
                className={cn(
                  "nav-link flex items-center gap-3 px-3 py-2.5 rounded-md text-sm btn-press transition-all",
                  isSectorActive
                    ? "active text-primary bg-slate-50 font-medium"
                    : "text-subtext-light hover:bg-slate-50 hover:text-primary"
                )}
              >
                <Icon size={18} />
                {sector.label}
                {isComingSoon && (
                  <span className="ml-auto text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                    Soon
                  </span>
                )}
              </Link>
            );
          }

          // Sectors with children — render as collapsible group
          return (
            <Collapsible
              key={sector.id}
              defaultOpen={isSectorActive}
            >
              <CollapsibleTrigger className="w-full">
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all cursor-pointer select-none group/trigger",
                    isSectorActive
                      ? "text-primary font-medium bg-slate-50/60"
                      : "text-subtext-light hover:bg-slate-50 hover:text-primary"
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="flex-1 text-left">{sector.label}</span>
                  {isComingSoon && (
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold mr-1">
                      Soon
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    className="flex-shrink-0 text-subtext-light/60 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180"
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="ml-5 pl-3 border-l border-border-light space-y-0.5 py-1">
                  {sector.children.map((child) => {
                    const isActive = pathname === child.path || pathname.startsWith(child.path + "/");
                    return (
                      <Link
                        key={child.page}
                        href={child.path}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-[13px] btn-press transition-all",
                          isActive
                            ? "text-primary bg-primary/5 font-medium"
                            : "text-subtext-light hover:bg-slate-50 hover:text-primary"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            isActive ? "bg-primary" : "bg-border-light"
                          )}
                        />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      {/* Quick actions + profile */}
      <div className="p-4 border-t border-border-light space-y-3">
        <div className="bg-slate-50 rounded-lg p-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-subtext-light/60 mb-1.5">
            Quick Actions
          </p>
          <button className="flex items-center gap-2 px-2 py-1.5 text-xs text-subtext-light hover:text-primary rounded transition-colors w-full text-left btn-press">
            <Download size={14} /> Export Report
          </button>
          <button className="flex items-center gap-2 px-2 py-1.5 text-xs text-subtext-light hover:text-primary rounded transition-colors w-full text-left btn-press">
            <Settings size={14} /> Settings
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            AU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-light truncate">Admin User</p>
            <p className="text-[11px] text-subtext-light hover:text-primary cursor-pointer transition-colors">
              View Profile
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-subtext-light hover:text-primary transition-colors btn-press">
                  <LogOut size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Logout</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

/* ── Exported Sidebar ─────────────────────────── */
interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-64 bg-surface-light border-r border-border-light flex-shrink-0 flex-col z-40 h-full">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>
    </>
  );
}
