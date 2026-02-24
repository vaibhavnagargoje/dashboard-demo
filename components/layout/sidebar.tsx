"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  Droplets,
  Truck,
  Stethoscope,
  Landmark,
  Map,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const iconComponents: Record<string, React.ElementType> = {
  LayoutDashboard,
  PawPrint,
  Droplets,
  Truck,
  Stethoscope,
  Landmark,
  Map,
  Download,
  Settings,
  LogOut,
};

const navItems = [
  { icon: "LayoutDashboard", label: "Overview", path: "/", page: "overview" },
  { icon: "PawPrint", label: "Census", path: "/infrastructure", page: "census" },
  { icon: "Droplets", label: "Milk Production", path: "/milk-production", page: "milk" },
  { icon: "Truck", label: "Export Data", path: "#", page: "export" },
  { icon: "Stethoscope", label: "Vet Services", path: "/infrastructure", page: "vet" },
  { icon: "Landmark", label: "Funding", path: "/funding", page: "funding" },
  { icon: "Map", label: "Geographic View", path: "/geographic", page: "geo" },
];

const quickActions = [
  { icon: "Download", label: "Export Report" },
  { icon: "Settings", label: "Settings" },
];

function SidebarContent({ activePage }: { activePage: string }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className="p-5 border-b border-border-light">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg font-display shadow-sm">
            A
          </div>
          <div>
            <span className="font-display font-bold text-base leading-tight text-primary block">
              Ahilyanagar
            </span>
            <span className="text-xs font-sans font-normal text-subtext-light">
              District Govt.
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = iconComponents[item.icon];
          const isActive = activePage === item.page || (item.path !== "#" && item.path !== "/" && activePage === item.page);
          const isOverviewActive = item.page === "overview" && activePage === "overview";
          const active = isActive || isOverviewActive;

          return (
            <Link
              key={item.page}
              href={item.path}
              className={cn(
                "nav-link flex items-center gap-3 px-3 py-2.5 rounded-md text-sm btn-press transition-all",
                active
                  ? "active text-primary bg-slate-50 font-medium"
                  : "text-subtext-light hover:bg-slate-50 hover:text-primary"
              )}
            >
              {Icon && <Icon size={20} />}
              {item.label}
            </Link>
          );
        })}

        {/* Quick Actions */}
        <div className="pt-4 mt-4 border-t border-border-light">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-subtext-light/60">
            Quick Actions
          </p>
          {quickActions.map((action) => {
            const Icon = iconComponents[action.icon];
            return (
              <button
                key={action.label}
                className="nav-link flex items-center gap-3 px-3 py-2.5 text-subtext-light hover:bg-slate-50 hover:text-primary rounded-md transition-all text-sm btn-press w-full text-left"
              >
                {Icon && <Icon size={20} />}
                {action.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-border-light">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            AU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-light truncate">Admin User</p>
            <p className="text-xs text-subtext-light hover:text-primary cursor-pointer transition-colors">
              View Profile
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-subtext-light hover:text-primary transition-colors btn-press">
                  <LogOut size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  activePage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ activePage, open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();

  // Determine active page from pathname if not provided
  const currentPage =
    activePage ||
    (() => {
      if (pathname === "/") return "overview";
      if (pathname === "/milk-production") return "milk";
      if (pathname === "/infrastructure") return "census";
      if (pathname === "/funding") return "funding";
      if (pathname === "/geographic") return "geo";
      return "overview";
    })();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-surface-light border-r border-border-light flex-shrink-0 flex-col z-40 h-full">
        <SidebarContent activePage={currentPage} />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent activePage={currentPage} />
        </SheetContent>
      </Sheet>
    </>
  );
}
