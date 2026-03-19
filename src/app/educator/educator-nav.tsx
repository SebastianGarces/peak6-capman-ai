"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const educatorNav = [
  { href: "/educator", label: "Overview" },
  { href: "/educator/students", label: "Students" },
  { href: "/educator/interventions", label: "Interventions" },
  { href: "/educator/analytics", label: "Analytics" },
];

export function EducatorNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex-1 space-y-1 p-2">
        {educatorNav.map((item) => {
          const isActive =
            item.href === "/educator"
              ? pathname === "/educator"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-l-2 border-amber-500 bg-amber-500/20 text-amber-400"
                  : "text-muted-foreground hover:bg-white/[0.07] hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[hsl(220,30%,20%)] p-4">
        <Link
          href="/"
          className="inline-link flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to Dashboard
        </Link>
      </div>
    </>
  );
}
