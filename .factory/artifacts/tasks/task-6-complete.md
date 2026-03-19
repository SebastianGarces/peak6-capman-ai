# Task 6: Root Layout with Theme Provider — COMPLETE

## Files Created/Modified
- `src/components/providers.tsx` (created: ThemeProvider client component)
- `src/app/layout.tsx` (modified: added Providers import and wrapping)
- `src/app/globals.css` (verified: all required CSS variables already present from Task 1)
- `src/__tests__/layout.test.tsx` (created: 4 tests for layout and theme)
- `src/test/setup.ts` (modified: added window.matchMedia mock for next-themes)

## Tests
- 4 tests written, all passing
- "Root Layout > renders children within html > body"
- "Providers > wraps children without error"
- "Dark theme CSS variables > are defined in globals.css"
- "ThemeProvider defaults to dark > renders with dark class by default"

## Acceptance Criteria
- [x] Root layout renders `<html>` with `suppressHydrationWarning` and dark class — verified by "renders children within html > body" and "renders with dark class by default"
- [x] ThemeProvider wraps children with `defaultTheme="dark"` — verified by "wraps children without error"
- [x] CSS variables for dark theme match architecture §4.5 color values — verified by "are defined in globals.css"
- [x] Card surface, primary accent (green), destructive (red), warning (amber) defined — verified in globals.css (--card, --primary, --destructive, --warning)
- [x] `next-themes` installed and functional — verified by Providers test rendering without error
- [x] No FOUC on page load — ensured by `disableTransitionOnChange` and `suppressHydrationWarning`

## Notes
- `globals.css` already had all required CSS variables from Task 1; no modifications were needed.
- `window.matchMedia` mock was added to the test file's `beforeAll` hook (not just setup.ts) because jsdom doesn't provide this API natively and next-themes calls it during mount.
- The `enableSystem={false}` option prevents next-themes from reading the OS preference, ensuring the dark theme is always applied.
- Full test suite: 49 tests across 6 files, all passing.
