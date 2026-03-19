# Task 1: Initialize Next.js 16 Project — COMPLETE

## Files Created/Modified

- `package.json` (created: name=capman-ai, test/test:watch scripts, NODE_ENV=production in build script)
- `tsconfig.json` (created: strict mode enabled)
- `next.config.ts` (created: default Next.js config)
- `postcss.config.mjs` (created: Tailwind v4 PostCSS config)
- `eslint.config.mjs` (created: ESLint config)
- `vitest.config.ts` (created: Vitest with jsdom, React plugin, @/* alias)
- `components.json` (created: shadcn/ui configuration)
- `src/app/globals.css` (created: dark theme CSS variables from architecture §4.5)
- `src/app/layout.tsx` (created: minimal root layout with dark class, suppressHydrationWarning)
- `src/app/page.tsx` (created: minimal landing page with CapMan AI heading)
- `src/test/setup.ts` (created: @testing-library/jest-dom/vitest import)
- `src/components/ui/button.tsx` (created by shadcn init)
- `src/lib/utils.ts` (created by shadcn init)
- `src/__tests__/app.test.tsx` (created: 3 tests)

## Tests

- 3 tests written, all passing
- "Landing Page - renders without crashing": verifies Home renders "CapMan AI" text
- "Root Layout - includes html lang attribute and body": verifies lang="en", className contains "dark", suppressHydrationWarning=true
- "globals.css - contains dark theme CSS custom properties": verifies --background, --primary, --destructive, --card are present

## Acceptance Criteria

- [x] AC1: `npm run dev` starts without errors on port 3000 — confirmed (Turbopack compilation succeeds)
- [x] AC2: `npm run build` completes without errors — verified (NODE_ENV=production next build succeeds)
- [x] AC3: TypeScript strict mode enabled in tsconfig (`strict: true`) — confirmed in tsconfig.json line 7
- [x] AC4: shadcn/ui initialized — `components.json` created, button.tsx added, `npx shadcn@latest add button` works
- [x] AC5: Tailwind CSS renders correctly — utility classes present in components
- [x] AC6: Motion package installed and importable — `motion@12.38.0` in dependencies
- [x] AC7: Dark theme CSS variables set in `globals.css` per architecture §4.5 — all variables present in both :root and .dark
- [x] AC8: `src/app/` directory structure matches architecture §4.1 — layout.tsx, page.tsx, globals.css present

## Notes

- Next.js 16.2.0 was scaffolded (latest via create-next-app)
- Tailwind CSS v4 was used (as installed by create-next-app)
- shadcn/ui used `@base-ui/react` as the primitive library instead of Radix UI (shadcn v4 behavior)
- The build script uses `NODE_ENV=production` prefix because the factory environment sets `NODE_ENV=development`, which caused a `useContext` prerender error on the `/_global-error` internal Next.js page during production builds
- Both `:root` and `.dark` CSS selectors have identical dark theme values per the dark-first design spec
- CSS variables use HSL format (space-separated without `hsl()` wrapper) as required by shadcn/ui v4
- `next-themes` installed (version 0.4.6) for future ThemeProvider integration in Task 6
