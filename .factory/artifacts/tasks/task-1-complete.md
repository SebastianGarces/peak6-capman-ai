# Task 1: Phase 1: Layout Shell — Sidebar, TopBar, PageHeader, Dashboard Layout — COMPLETE

## Files Created/Modified
- src/components/layout/app-sidebar.tsx (modified: gradient bg, TrendingUp icon, text-gradient-primary branding, rounded-lg nav items, active border-l-2 + layoutId animated indicator, AnimatePresence mobile overlay/sidebar)
- src/components/layout/top-bar.tsx (modified: server-side DB queries for XP/level/streak, GamificationBar component, Avatar + DropdownMenu user menu, glass effect header)
- src/components/layout/gamification-bar.tsx (created: client component wrapping XpBar, LevelBadge, StreakCounter)
- src/components/layout/page-header.tsx (modified: text-3xl font-bold, optional icon + action props, fadeInUp motion, gradient accent line)
- src/app/(dashboard)/layout.tsx (modified: max-w-7xl wrapper, p-6 lg:p-8 padding)
- src/components/game/xp-bar.tsx (modified: gradient shimmer fill)
- src/components/game/level-badge.tsx (modified: tier color system — bronze/silver/gold/diamond)
- src/components/game/streak-counter.tsx (modified: flame intensity levels by streak count)
- src/lib/motion.ts (fixed: easeOut typed as [number,number,number,number] to resolve pre-existing TS error blocking build)

## Tests
- No unit tests written — layout/visual components; verified by successful `npm run build` with zero TS errors in modified files

## Acceptance Criteria
- [x] AppSidebar: gradient bg, CapMan AI with TrendingUp icon (text-xl, text-gradient-primary), rounded-lg nav, active border-l-2/bg-primary/10, layoutId animated indicator, AnimatePresence mobile with slideInLeft + overlayFade
- [x] TopBar: server component, DB queries for XP/level/streak, GamificationBar client component, Avatar + DropdownMenu with Profile + Logout, glass bg-card/80 backdrop-blur-sm
- [x] GamificationBar: new client component with XpBar + LevelBadge + StreakCounter in flex row gap-4
- [x] PageHeader: text-3xl, optional icon left, optional action right, fadeInUp motion, gradient accent line
- [x] Dashboard layout: max-w-7xl wrapper, p-6 lg:p-8
- [x] XpBar: gradient shimmer fill
- [x] LevelBadge: tier colors (bronze 1-3, silver 4-6, gold 7-9, diamond 10)
- [x] StreakCounter: flame intensity (normal 1-2, orange-500 3-6, amber-400+scale 7-13, amber-300+glow-gold 14+)

## Notes
- DropdownMenuItem/DropdownMenuTrigger in this codebase use base-ui (not Radix), so `asChild` prop is not supported — used className directly on trigger and children inside items
- Fixed pre-existing `src/lib/motion.ts` TS error that was blocking `npm run build`
