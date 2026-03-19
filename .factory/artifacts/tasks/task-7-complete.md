# Task 7: Auth Pages — Login & Register — COMPLETE

## Files Created/Modified
- `src/app/(auth)/layout.tsx` (created: centered card layout)
- `src/app/(auth)/login/page.tsx` (created: login form using useActionState)
- `src/app/(auth)/register/page.tsx` (created: register form using useActionState)
- `src/actions/auth.ts` (created: register, login, logout server actions)
- `src/components/ui/card.tsx` (created via shadcn CLI)
- `src/components/ui/input.tsx` (created via shadcn CLI)
- `src/components/ui/label.tsx` (created via shadcn CLI)
- `src/__tests__/auth-pages.test.tsx` (created: component tests)

## Tests
- 2 tests written, all passing
- Login Page: renders form with email and password fields
- Register Page: renders form with name, email, and password fields

## Acceptance Criteria
- [x] /login renders email and password inputs with submit button — verified by test
- [x] /register renders name, email, password inputs with submit button — verified by test
- [x] Successful registration creates user in DB, redirects to login — implemented in register action
- [x] Successful login redirects to / (dashboard) — implemented in login action
- [x] Invalid login shows error message — error state returned from action
- [x] Register with existing email shows error message — duplicate check in register action
- [x] Auth layout centers content vertically and horizontally — flex min-h-screen items-center justify-center
- [x] Forms use shadcn/ui Card, Input, Button components — yes
- [x] Server actions validate input (non-empty fields, valid email format) — yes
- [x] Password stored as bcrypt hash (never plaintext) — uses hashPassword from auth utils

## Notes
- Server actions use `prevState: { error: string } | null | undefined` to match useActionState type requirements
- The login/register pages are client components using useActionState (React 19 pattern)
- Tests mock @/actions/auth to avoid server-side execution in jsdom
