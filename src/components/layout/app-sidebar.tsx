"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  BookOpen,
  Swords,
  MessageSquare,
  Trophy,
  User,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { slideInLeft, overlayFade } from "@/lib/motion";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/compete", label: "Compete", icon: Swords },
  { href: "/review", label: "Review", icon: MessageSquare },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

interface AppSidebarProps {
  userRole?: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      {/* Logo */}
      <div className="mb-8 px-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Cap<span className="text-primary">Man</span>
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-1 flex-col gap-1 px-2" role="navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-primary-muted text-primary"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  active ? "text-primary" : "text-text-dim group-hover:text-text-muted"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Educator Link */}
      {(userRole === "educator" || userRole === "admin") && (
        <div className="mt-auto border-t border-surface-border px-2 pt-3">
          <Link
            href="/educator"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              pathname.startsWith("/educator")
                ? "bg-amber-muted text-amber"
                : "text-text-muted hover:text-text hover:bg-surface-hover"
            )}
          >
            <GraduationCap className="h-[18px] w-[18px]" />
            Educator
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-[220px] md:flex-col md:fixed md:inset-y-0 md:left-0 bg-bg-deep border-r border-surface-border py-5 z-40">
        {navContent}
      </aside>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-surface-border md:hidden cursor-pointer"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5 text-text-muted" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
              variants={overlayFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[260px] bg-bg-deep border-r border-surface-border py-5 flex flex-col md:hidden"
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-text-dim hover:text-text cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
