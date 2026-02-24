"use client";

import { Menu, Search, Bell, Maximize, SlidersHorizontal, ArrowLeft, ChevronDown, Check, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FISCAL_YEARS } from "@/lib/constants";
import notificationsData from "@/data/notifications.json";
import { cn } from "@/lib/utils";
import { useFilterContext } from "@/lib/filter-context";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppHeaderProps {
  variant?: "overview" | "detail";
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backLink?: { label: string; href: string };
  showSearch?: boolean;
  onMenuClick?: () => void;
  onFilterClick?: () => void;
}

export function AppHeader({
  variant = "overview",
  title,
  subtitle,
  description,
  breadcrumbs,
  backLink,
  showSearch = true,
  onMenuClick,
  onFilterClick,
}: AppHeaderProps) {
  const { districtInfo } = useFilterContext();
  const [selectedFY, setSelectedFY] = useState(FISCAL_YEARS[0]);
  const [fyOpen, setFyOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationsData);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const hasUnread = notifications.some((n) => !n.read);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="bg-surface-light border-b border-border-light px-4 md:px-8 py-4 flex-shrink-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="md:hidden text-subtext-light hover:text-primary transition-colors btn-press p-1"
            onClick={onMenuClick}
          >
            <Menu size={22} />
          </button>

          <div>
            {/* Breadcrumbs (detail pages) */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb className="mb-1">
                <BreadcrumbList className="text-xs">
                  {breadcrumbs.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink asChild>
                            <Link href={item.href} className="text-subtext-light hover:text-primary transition-colors">
                              {item.label}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <span className="text-primary font-medium">{item.label}</span>
                        )}
                      </BreadcrumbItem>
                      {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </span>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}

            {/* Back link */}
            {backLink && (
              <Link
                href={backLink.href}
                className="flex items-center gap-1 text-xs text-subtext-light hover:text-primary transition-colors mb-1"
              >
                <ArrowLeft size={14} />
                {backLink.label}
              </Link>
            )}

            {/* Subtitle (overview) */}
            {variant === "overview" && subtitle && (
              <p className="text-xs text-primary/70 uppercase tracking-wider font-medium">{subtitle}</p>
            )}

            {/* Title + district badge */}
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-xl md:text-2xl font-bold text-primary leading-tight">
                {title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <MapPin size={10} />
                {districtInfo.name}
              </span>
            </div>

            {/* Description (detail pages) */}
            {description && (
              <p className="text-sm text-subtext-light font-light leading-relaxed mt-1 max-w-2xl hidden sm:block">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          {showSearch && (
            <div className="hidden md:flex items-center relative">
              <Search
                size={16}
                className="absolute left-3 text-subtext-light pointer-events-none"
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                className={cn(
                  "pl-9 pr-4 py-2 text-sm border border-border-light rounded-lg bg-slate-50 text-text-light focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white placeholder:text-subtext-light/60 transition-all",
                  searchExpanded ? "w-64" : "w-48"
                )}
                onFocus={() => setSearchExpanded(true)}
                onBlur={() => setSearchExpanded(false)}
              />
            </div>
          )}

          {/* Notifications */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <button className="relative text-subtext-light hover:text-primary transition-colors btn-press p-2 rounded-lg hover:bg-slate-50">
                <Bell size={20} />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-dot" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b border-border-light flex justify-between items-center">
                <h4 className="font-semibold text-sm text-primary">Notifications</h4>
                <button
                  className="text-xs text-primary hover:underline btn-press"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => {
                  const dotColor =
                    n.type === "info"
                      ? "bg-primary"
                      : n.type === "success"
                      ? "bg-emerald-500"
                      : "bg-orange-400";
                  return (
                    <div
                      key={n.id}
                      className="p-3 border-b border-border-light last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                            dotColor,
                            n.read && "opacity-30"
                          )}
                        />
                        <div>
                          <p
                            className="text-sm text-text-light"
                            dangerouslySetInnerHTML={{ __html: n.message }}
                          />
                          <p className="text-xs text-subtext-light mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-border-light text-center">
                <button className="text-xs text-primary font-medium hover:underline">
                  View all notifications
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* FY Dropdown */}
          <Popover open={fyOpen} onOpenChange={setFyOpen}>
            <PopoverTrigger asChild>
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-border-light text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors btn-press">
                <span className="text-primary">{selectedFY}</span>
                <ChevronDown size={14} className="text-subtext-light" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end">
              {FISCAL_YEARS.map((fy) => (
                <button
                  key={fy}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between transition-colors",
                    fy === selectedFY
                      ? "text-primary bg-slate-50 font-medium"
                      : "text-subtext-light hover:bg-slate-50 hover:text-primary"
                  )}
                  onClick={() => {
                    setSelectedFY(fy);
                    setFyOpen(false);
                  }}
                >
                  {fy}
                  {fy === selectedFY && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Filter button */}
          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm transition-colors shadow-sm btn-press"
            onClick={onFilterClick}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Data Points</span>
          </button>

          {/* Fullscreen */}
          <button
            className="hidden sm:flex text-subtext-light hover:text-primary transition-colors btn-press p-2 rounded-lg hover:bg-slate-50"
            onClick={toggleFullscreen}
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
