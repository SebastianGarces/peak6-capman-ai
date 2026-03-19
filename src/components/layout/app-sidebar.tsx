"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, BookOpen, Swords, MessageSquare, Trophy, User, Menu, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { slideInLeft, overlayFade } from "@/lib/motion";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/compete", label: "Compete", icon: Swords },
  { href: "/review", label: "Review", icon: MessageSquare },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="text-xl font-bold text-gradient-primary">CapMan AI</span>
        </div>
        {onClose && (
          <button
            className="md:hidden p-1"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-2" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                isActive
                  ? "border-l-2 border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/[0.04]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="relative h-5 w-5" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-3 left-3 z-50 rounded-md bg-card p-2 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay + sidebar with AnimatePresence */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              variants={overlayFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="sidebar"
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] md:hidden"
              style={{
                background: "linear-gradient(to bottom, hsl(222,30%,9%), hsl(222,30%,7%))",
              }}
            >
              <NavContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex h-full w-64 flex-col border-r border-white/[0.06]"
        style={{
          background: "linear-gradient(to bottom, hsl(222,30%,9%), hsl(222,30%,7%))",
        }}
      >
        <NavContent />
      </aside>
    </>
  );
}
