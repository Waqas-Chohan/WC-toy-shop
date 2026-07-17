"use client";

import { cn } from "@/lib/utils";
import type { Section } from "./sidebar";
import { Bell, Search, Calendar, Store } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";

interface HeaderProps {
  activeSection: Section;
}

const sectionTitles: Record<Section, string> = {
  overview: "Overview Dashboard",
  pipeline: "Deals Pipeline",
  deals: "Deals Management",
  customers: "Customers Database",
  orders: "Order Management",
  team: "Team Performance",
  forecasting: "Revenue Forecasting",
  reports: "Reports & Analytics",
  settings: "Settings",
  toys: "Manage Toys / Products",
  sliders: "Manage Main Slides",
};

export function Header({ activeSection }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const { user } = useAuthStore();
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'A';

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-semibold text-foreground">
          {sectionTitles[activeSection]}
        </h1>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last 30 days</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div
          className={cn(
            "relative flex items-center transition-all duration-300",
            searchFocused ? "w-64" : "w-48"
          )}
        >
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </button>

        {/* Back to Store */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 h-9 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-all duration-200"
        >
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Store</span>
        </Link>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary ring-2 ring-accent/30" title={user?.name}>
          <div className="w-full h-full bg-gradient-to-br from-accent/80 to-chart-1 flex items-center justify-center text-xs font-semibold text-accent-foreground">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
