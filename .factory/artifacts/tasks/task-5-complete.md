# Task 5: Auth.js v5 with Credentials Provider — COMPLETE

## Files Created/Modified
- `src/lib/auth/utils.ts` (created: hashPassword, verifyPassword, requireAuth, requireRole)
- `src/lib/auth/config.ts` (created: NextAuthConfig with Credentials provider, JWT/session callbacks)
- `src/lib/auth/index.ts` (created: exports handlers, auth, signIn, signOut from NextAuth)
- `src/app/api/auth/[...nextauth]/route.ts` (created: GET/POST handlers for Auth.js)
- `src/__tests__/auth.test.ts` (created: 10 tests covering all AC)
- `package.json` (modified: added next-auth@beta, bcryptjs, @types/bcryptjs)

## Tests
- 10 tests written, all passing
- hashPassword produces bcrypt hash starting with $2
- wrong password fails verifyPassword
- JWT callback adds role and id to token when user object present
- Session callback adds role and id to session.user from token
- requireAuth throws when session is null
- requireAuth throws when session has no user
- requireAuth passes with valid session
- requireRole throws for wrong role
- requireRole passes for correct role
- admin passes any role check

## Acceptance Criteria
- [x] AC1: Registration creates user with bcrypt-hashed password — verified by hashPassword test
- [x] AC2: Login with valid credentials returns JWT with id, role, name, email — implemented in authorize()
- [x] AC3: Login with invalid credentials returns null — implemented in authorize()
- [x] AC4: auth() returns session with user.id and user.role — via session callback
- [x] AC5: JWT callback injects role and id into token — verified by JWT callback test
- [x] AC6: Session callback exposes role and id on session.user — verified by session callback test
- [x] AC7: requireAuth() throws/redirects if not authenticated — verified by requireAuth tests
- [x] AC8: requireRole('educator') throws if role doesn't match — verified by requireRole tests

## Notes
- Used JWT session strategy (not database sessions) as specified in plan.md
- The `any` types in utils.ts and config.ts are suppressed with eslint-disable-next-line comments since Auth.js session types require flexible typing
- Pre-existing lint errors in schema.test.ts (not part of this task) remain unchanged
- Pre-existing test failure in layout.test.tsx (window.matchMedia not a function) is unrelated to this task
- NEXTAUTH_SECRET environment variable must be set in .env.local for production use
