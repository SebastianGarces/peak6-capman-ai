"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, AlertTriangle, BarChart3, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/educator", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/educator/students", label: "Students", icon: Users },
  { href: "/educator/interventions", label: "Interventions", icon: AlertTriangle },
  { href: "/educator/analytics", label: "Analytics", icon: BarChart3 },
];

export function EducatorNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex md:w-[220px] md:flex-col md:fixed md:inset-y-0 md:left-0 bg-bg-deep border-r border-surface-border py-5 z-40">
      {/* Header */}
      <div className="mb-6 px-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-muted">
            <span className="text-sm font-bold text-amber">E</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Educator<span className="text-amber"> View</span>
          </span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-text-dim hover:text-text-muted transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to dashboard
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-amber-muted text-amber"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-amber" : "text-text-dim")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
