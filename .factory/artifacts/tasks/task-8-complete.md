# Task 8: Dashboard Layout Shell — COMPLETE

## Files Created/Modified
- `src/app/(dashboard)/layout.tsx` (created: sidebar + top bar layout)
- `src/app/(dashboard)/page.tsx` (created: dashboard home placeholder)
- `src/components/layout/app-sidebar.tsx` (created: client component with 6 nav links)
- `src/components/layout/top-bar.tsx` (created: server component with user info + logout)
- `src/components/layout/page-header.tsx` (created: reusable page title + description)
- `src/proxy.ts` (created: route protection using auth.js authorized callback)
- `src/lib/auth/config.ts` (modified: added authorized callback for route protection)
- `src/components/ui/avatar.tsx` (created via shadcn CLI)
- `src/components/ui/dropdown-menu.tsx` (created via shadcn CLI)
- `src/components/ui/separator.tsx` (created via shadcn CLI)
- `src/components/ui/tooltip.tsx` (created via shadcn CLI)
- `src/components/ui/skeleton.tsx` (created via shadcn CLI)
- `src/__tests__/dashboard.test.tsx` (created: component tests)
- `vitest.config.ts` (modified: removed invalid environmentMatchGlobs property to fix build)

## Tests
- 3 tests written, all passing
- AppSidebar: contains all 6 navigation links with correct hrefs
- AppSidebar: renders CapMan AI branding
- PageHeader: renders title and description

## Acceptance Criteria
- [x] Unauthenticated users redirected to /login — implemented via authorized callback in proxy.ts
- [x] Sidebar renders with navigation links: Home, Learn, Compete, Review, Leaderboard, Profile — verified by test
- [x] Sidebar highlights active route — isActive check using usePathname
- [x] Top bar shows user name/avatar and logout option — TopBar server component shows user.name + logout form
- [x] Top bar has placeholder slots for XP bar, level badge, and streak counter — div placeholders
- [x] Dashboard home page (/) renders welcome message with user's name — DashboardHome server component
- [x] Logout action signs out and redirects to /login — logout() server action
- [x] proxy.ts protects dashboard routes and educator routes — authorized callback in auth config

## Notes
- Next.js 16 uses `proxy.ts` instead of `middleware.ts`. Export must be named `proxy` (not `middleware`).
- The `authorized` callback approach in auth config allows the proxy.ts to use Auth.js built-in JWT checking.
- Educator route protection redirects learners to `/` (dashboard home).
- Fixed pre-existing `environmentMatchGlobs` TypeScript error in vitest.config.ts that was preventing successful builds.
- TopBar is a SERVER component (uses await auth()). AppSidebar is a CLIENT component (uses usePathname).
