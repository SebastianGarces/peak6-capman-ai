# Verification Review: CapMan AI — Gamified Scenario Training & MTSS Agent

**Reviewer:** Automated Verification Agent
**Date:** 2026-03-19
**Branch:** `factory/capman-ai-gamified-scenario-training-mtss-agent`

---

## Verdict: FAIL

---

## Summary

The implementation covers a substantial portion of the 53-task plan across all 7 phases. The codebase demonstrates strong architectural alignment with the plan: 14-table Drizzle schema, Auth.js integration, AI client abstraction, gamification engine, MTSS classifier, matchmaking, peer review, and a Python FastAPI AI service. However, **the Next.js build fails**, which is a blocking issue for deployment. There are also TypeScript errors, a missing `proxy.ts` route protection file, and the Python service lacks internal authentication verification.

---

## Test Results

| Suite | Status | Details |
|-------|--------|---------|
| Vitest (Frontend) | **PASS** | 45 test files, 161 tests, all passing |
| Python pytest | **PASS** | 18 tests, all passing |
| TypeScript (`tsc --noEmit`) | **FAIL** | 10 errors (see below) |
| Next.js Build | **FAIL** | Route conflict: `/(dashboard)` and `/(educator)` both resolve to `/` |

---

## Blocking Issues (Must Fix)

### B1: Next.js Build Failure — Route Conflict
**Severity:** Critical (deployment blocker)

```
Error: Turbopack build failed with 1 errors:
./src/app/(educator)
You cannot have two parallel pages that resolve to the same path.
Please check /(dashboard) and /(educator).
```

Both `src/app/(dashboard)/page.tsx` and `src/app/(educator)/page.tsx` resolve to the root path `/`. In Next.js 16, route groups in parentheses share the URL namespace. Since both groups define `page.tsx` at their root, they conflict.

**Fix:** Move the educator routes under a URL segment (e.g., rename `(educator)` to `(educator)/educator` or add a `src/app/educator/` prefix so the educator pages live at `/educator/*` instead of `/`). The architecture document already specifies educator links as `/educator`, `/educator/students`, etc. — the implementation should use `src/app/educator/` (without parentheses) or `src/app/(educator-group)/educator/page.tsx`.

### B2: TypeScript Errors — Missing `vi` Import in Test Files
**Severity:** Medium (type-checking broken)

Three test files use `vi` (Vitest mock API) without importing it:
- `src/__tests__/loading.test.tsx` (line 9)
- `src/__tests__/page-transition.test.tsx` (line 6)
- `src/__tests__/phase-transition.test.tsx` (lines 5, 15, 17, 21-23)

While `vitest.config.ts` sets `globals: true` (which makes `vi` available at runtime, so tests pass), the TypeScript compiler doesn't see the global types. Either add `import { vi } from 'vitest'` to these files or add `"types": ["vitest/globals"]` to `tsconfig.json`.

### B3: TypeScript Error — Scenario Page Type Mismatch
**Severity:** Medium

`src/app/(dashboard)/learn/[levelId]/scenario/[scenarioId]/page.tsx` line 81:
```
error TS2345: Argument of type 'string | undefined' is not assignable to
parameter of type 'SetStateAction<string | null>'.
Type 'undefined' is not assignable to type 'SetStateAction<string | null>'.
```

The `result.error` from `submitResponse` can be `undefined` when there's no error, but `setError` expects `string | null`. Fix: `setError(result.error ?? null)`.

---

## Security Issues

### S1: Python AI Service — No Internal Token Validation
**Severity:** High

The Next.js `src/lib/ai/client.ts` sends an `x-internal-token` header with every request to the Python service, but the Python service (`python-service/main.py`, routers) **never validates this token**. Any client that can reach the Python service port (8000) can call grading and scenario generation endpoints without authentication.

**Fix:** Add a FastAPI middleware or dependency that validates the `x-internal-token` header against `settings.internal_api_token`.

### S2: Educator Server Actions — No Role Check
**Severity:** High

`src/actions/educator.ts` functions (`getMtssOverview`, `getInterventionQueue`, `getLearnerDetail`) check for authentication (`session?.user`) but do **not verify the user's role is `educator` or `admin`**. Any authenticated learner can call these server actions directly and access all MTSS data.

**Fix:** Add `requireRole(session, 'educator')` checks (the utility already exists in `src/lib/auth/utils.ts`).

### S3: Missing `proxy.ts` — No Middleware Route Protection
**Severity:** Medium

The architecture specifies `src/app/proxy.ts` (Next.js 16's replacement for `middleware.ts`) for route protection. The auth config has an `authorized` callback which functions as middleware if Next.js calls it, but no `proxy.ts` file exists. The `(educator)/layout.tsx` has a server-side role check (redirect if not educator/admin), which provides a fallback, but it's not as robust as middleware-level protection.

### S4: `sendNudge` — No Real Implementation
**Severity:** Low

`src/actions/educator.ts:sendNudge()` just logs to console. This is acceptable for the current implementation phase but should be flagged.

---

## Convention Issues

### C1: `useEffect` + `fetch` Pattern in Scenario Page
The scenario attempt page (`src/app/(dashboard)/learn/[levelId]/scenario/[scenarioId]/page.tsx` line 49) uses `useEffect` + `fetch` to load scenario data. The research/architecture explicitly states: "All data fetching via server components or server actions — no `useEffect` + `fetch` patterns." The scenario data should be fetched server-side and passed as props, or loaded via a server action.

### C2: `as any` Casts Throughout Auth Code
Multiple files use `(session.user as any).role` and `(session.user as any).id` to access user properties. This is a TypeScript convention violation. The proper fix is to extend the NextAuth types via module augmentation in a `types/next-auth.d.ts` file.

### C3: N+1 Query in `getInterventionQueue`
`src/actions/educator.ts:getInterventionQueue()` loops through user IDs and makes individual DB queries per user (lines 66-73), plus re-fetches all objectives inside the loop. This is an N+1 query problem that will degrade with scale.

### C4: N+1 Query in Weekly Leaderboard
`src/actions/gamification.ts:getLeaderboard('weekly')` enriches results by querying users one at a time in a loop (lines 133-144). Should use a JOIN or batch query.

### C5: `server.ts` Socket.io Handlers Are Stubs
The custom `server.ts` has stub event handlers for `challenge:request`, `challenge:cancel`, and `challenge:submit` (lines 29-38) with no actual implementation. The matchmaking module (`src/lib/challenge/matchmaking.ts`) exists but is not wired into the server.

---

## Implementation Coverage vs Plan

### Phases Implemented

| Phase | Tasks | Status | Notes |
|-------|-------|--------|-------|
| 1: Foundation (T1-T8) | 8/8 | Mostly Complete | No `proxy.ts` (T8 AC#9) |
| 2: Curriculum (T9-T14) | 6/6 | Complete | All pages exist |
| 3: Python AI (T15-T22) | 8/8 | Complete | All endpoints, templates, services |
| 4: Gamification (T23-T30) | 8/8 | Complete | XP, levels, streaks, leaderboard, SSE |
| 5: MTSS (T31-T37) | 7/7 | Complete | Classifier, heatmap, distribution, queue |
| 6: Challenges (T38-T45) | 8/8 | Partial | Socket stubs, UI components exist |
| 7: Polish (T46-T53) | 8/8 | Complete | Transitions, loading, accessibility |

### Notable Completions
- Full 14-table Drizzle schema with relations, indexes, and enums
- Auth.js v5 with credentials provider, JWT callbacks, role injection
- Dark-first theme matching architecture spec colors exactly
- AI client with timeout, error handling, and typed functions
- MTSS classification algorithm matching spec (3-attempt threshold, score + inactivity rules)
- Matchmaking algorithm with time-based relaxation (400 → 800 → Infinity XP range)
- Level thresholds matching spec exactly (0 → 10,000 XP)
- XP calculation matching spec (base 10, +10 at 80%, +25 at 90%)
- Skip navigation link and focus-visible styles for accessibility
- Skeleton loading states for dashboard, learn, leaderboard, educator pages
- Motion page transitions with AnimatePresence
- All Python AI service endpoints with Jinja2 prompt templates
- Pre-generation batch endpoint
- RAG service with chunking and query

---

## Test Coverage Assessment

**Strengths:**
- 45 test files covering all major subsystems
- Schema validation tests
- Auth utility tests
- XP calculation and level threshold tests
- Matchmaking compatibility tests
- MTSS classifier logic tests
- Component render tests for game, challenge, MTSS components
- Python service: LLM, grading, RAG, scenario generation, batch, health endpoint

**Gaps:**
- No integration tests (DB-dependent server actions are not tested against a real DB)
- Scenario page `submitResponse` error path (the `as any` cast in line 81 causes TS error)
- Challenge grading flow not tested end-to-end
- SSE leaderboard stream not tested with real EventSource
- Socket.io server event handlers have no tests (and are stubs)

---

## Required Fixes for PASS

1. **Fix route conflict** — Move educator pages under `/educator` URL segment so build succeeds
2. **Fix TypeScript errors** — Add vitest globals type or imports; fix `setError` type in scenario page
3. **Add internal token validation** to Python service middleware
4. **Add role checks** to educator server actions

---

## Recommended Improvements (Non-Blocking)

- Wire matchmaking module into `server.ts` socket handlers
- Replace `as any` auth casts with proper NextAuth type augmentation
- Fix N+1 queries in `getInterventionQueue` and weekly leaderboard
- Replace `useEffect` + `fetch` in scenario page with server action or server component data passing
- Add `proxy.ts` for middleware-level route protection
- Use Pydantic v2 `model_config` instead of deprecated class-based `Config` in Python `config.py`
