# Implementation Plan: CapMan AI — Gamified Scenario Training & MTSS Agent

---

## Overview

53 tasks across 7 phases. Each task is independently testable and follows TDD (Red-Green-Refactor). Tasks within a phase are ordered by dependency. Cross-phase dependencies are noted explicitly.

**Conventions**:
- `[Depends: T#]` — must complete before starting this task
- `AC` — Acceptance Criteria (all must pass for task completion)
- `TDD` — Tests to write first (Red), then implement (Green)
- File paths use the architecture's directory structure (`src/` prefix for Next.js, `python-service/` for Python)

---

## Phase 1 — Foundation (Tasks 1–8)

### Task 1: Initialize Next.js 16 Project

**Depends:** None

**Description:** Scaffold the Next.js 16 project with TypeScript strict mode, Tailwind CSS 4, shadcn/ui, and Motion. Configure ESLint, tsconfig, and project structure.

**Files to create/modify:**
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts` (if needed for v4)
- `src/app/layout.tsx` (minimal root layout)
- `src/app/page.tsx` (minimal landing page)
- `src/app/globals.css` (dark theme CSS variables)
- `components.json` (shadcn config)

**AC:**
1. `npm run dev` starts without errors on port 3000
2. `npm run build` completes without errors
3. TypeScript strict mode enabled in tsconfig (`strict: true`)
4. shadcn/ui initialized — `npx shadcn@latest add button` works
5. Tailwind CSS renders correctly (test with a utility class)
6. Motion package installed and importable
7. Dark theme CSS variables set in `globals.css` per architecture §4.5
8. `src/app/` directory structure matches architecture §4.1

**TDD:**
```
- Test: Landing page renders without crashing (React Testing Library)
- Test: Root layout includes html lang attribute and body
- Test: globals.css contains dark theme CSS custom properties
```

---

### Task 2: Docker Compose for PostgreSQL + pgvector

**Depends:** None (can run in parallel with Task 1)

**Description:** Create docker-compose.yml with `pgvector/pgvector:pg17` image. Include healthcheck. Create `.env.local` template.

**Files to create/modify:**
- `docker-compose.yml`
- `.env.local` (template with DATABASE_URL)
- `.env.example`
- `.gitignore` (ensure .env.local excluded)

**AC:**
1. `docker compose up -d` starts PostgreSQL container
2. `pg_isready` healthcheck passes
3. pgvector extension available: `CREATE EXTENSION IF NOT EXISTS vector;` succeeds
4. DATABASE_URL connects: `psql $DATABASE_URL -c "SELECT 1"` returns 1
5. Container uses `pgvector/pgvector:pg17` image (not plain postgres)
6. Data persists across container restarts (named volume)

**TDD:**
```
- Test: docker compose config validates without errors
- Test: After compose up, psql connection succeeds
- Test: pgvector extension can be created
```

---

### Task 3: Drizzle Schema — Complete Database Schema

**Depends:** T1, T2

**Description:** Define the complete Drizzle ORM schema in `src/lib/db/schema.ts` with all 14 tables from architecture §2.2. Define relations. Configure drizzle-kit.

**Files to create/modify:**
- `src/lib/db/schema.ts` (all tables + relations)
- `src/lib/db/index.ts` (DB connection singleton)
- `drizzle.config.ts`

**AC:**
1. All 14 tables defined: `users`, `curriculum_levels`, `skill_objectives`, `scenarios`, `scenario_attempts`, `attempt_objectives`, `xp_events`, `user_streaks`, `challenges`, `challenge_participants`, `peer_reviews`, `mtss_classifications`, `leaderboard_snapshots`, `document_chunks`
2. All columns match architecture §2.2 types and constraints
3. All enums defined: user role, challenge status, leaderboard period type
4. All indexes defined per architecture
5. Relations declared for all foreign keys
6. `document_chunks` includes `vector(1536)` column
7. `drizzle-kit generate` produces valid migration SQL
8. TypeScript types exported and usable (e.g., `typeof users.$inferSelect`)

**TDD:**
```
- Test: Schema file exports all 14 table definitions
- Test: Each table has id, created_at columns (except junction tables where specified)
- Test: users table has correct column types (uuid PK, text email unique, enum role)
- Test: Foreign key references are valid (e.g., scenario_attempts.user_id → users.id)
- Test: drizzle-kit generate succeeds without errors
```

---

### Task 4: Apply Database Migration

**Depends:** T3

**Description:** Generate initial migration from Drizzle schema and apply it. Create a migration script in package.json. Verify all tables exist with correct structure.

**Files to create/modify:**
- `src/lib/db/migrations/` (generated)
- `package.json` (add `db:generate`, `db:migrate`, `db:push` scripts)

**AC:**
1. `npm run db:generate` creates migration files in `src/lib/db/migrations/`
2. `npm run db:migrate` applies migration to local PostgreSQL
3. All 14 tables exist in database with correct columns
4. pgvector extension created (for `document_chunks.embedding`)
5. All indexes created (verify with `\di` in psql)
6. HNSW index on `document_chunks.embedding` exists
7. All enum types created in PostgreSQL

**TDD:**
```
- Test: Migration applies cleanly to a fresh database
- Test: All tables exist after migration (query pg_tables)
- Test: vector column type on document_chunks.embedding
- Test: Unique constraints exist on users.email, skill_objectives.code
- Test: Migration is idempotent (running twice doesn't error)
```

---

### Task 5: Auth.js v5 with Credentials Provider

**Depends:** T3, T4

**Description:** Set up Auth.js v5 with credentials provider (email/password), JWT session strategy, Drizzle adapter. Include role in JWT token and session. Create auth utility functions.

**Files to create/modify:**
- `src/lib/auth/config.ts` (Auth.js configuration)
- `src/lib/auth/index.ts` (auth helper exports: `auth()`, `signIn()`, `signOut()`)
- `src/app/api/auth/[...nextauth]/route.ts` (Auth.js API route)
- `src/lib/auth/utils.ts` (password hashing with bcrypt, `requireAuth()`, `requireRole()`)

**AC:**
1. Registration creates a user with bcrypt-hashed password
2. Login with valid credentials returns JWT with `id`, `role`, `name`, `email`
3. Login with invalid credentials returns error
4. `auth()` returns session with `user.id`, `user.role` on authenticated requests
5. JWT callback injects `role` and `id` into token
6. Session callback exposes `role` and `id` on `session.user`
7. `requireAuth()` helper throws/redirects if not authenticated
8. `requireRole('educator')` helper throws if role doesn't match

**TDD:**
```
- Test: hashPassword produces a bcrypt hash that verifyPassword validates
- Test: hashPassword with wrong password fails verifyPassword
- Test: JWT callback adds role and id to token when user object present
- Test: Session callback adds role and id to session.user from token
- Test: requireAuth throws when session is null
- Test: requireRole('educator') throws for learner role
- Test: requireRole('educator') passes for educator role
```

---

### Task 6: Root Layout with Theme Provider

**Depends:** T1

**Description:** Build root layout with dark-first theme (next-themes), global providers, and metadata.

**Files to create/modify:**
- `src/app/layout.tsx` (root layout with ThemeProvider, SessionProvider)
- `src/components/providers.tsx` (client component wrapping all providers)
- `src/app/globals.css` (finalize dark theme variables per architecture §4.5)

**AC:**
1. Root layout renders `<html>` with `suppressHydrationWarning` and dark class
2. ThemeProvider wraps children with `defaultTheme="dark"`
3. CSS variables for dark theme match architecture §4.5 color values
4. Card surface, primary accent (green), destructive (red), warning (amber) defined
5. `next-themes` installed and functional (can toggle theme programmatically)
6. No flash of unstyled content (FOUC) on page load

**TDD:**
```
- Test: Root layout renders children within html > body
- Test: Providers component wraps children without error
- Test: Dark theme CSS variables are defined in globals.css
- Test: ThemeProvider defaults to dark
```

---

### Task 7: Auth Pages — Login & Register

**Depends:** T5, T6

**Description:** Build `(auth)` route group with centered card layout, login page, and register page. Wire to Auth.js server actions.

**Files to create/modify:**
- `src/app/(auth)/layout.tsx` (centered card layout)
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/actions/auth.ts` (register, login, logout server actions)
- Install shadcn components: `card`, `input`, `button`, `label`

**AC:**
1. `/login` renders email and password inputs with submit button
2. `/register` renders name, email, password inputs with submit button
3. Successful registration creates user in DB, redirects to login
4. Successful login redirects to `/` (dashboard)
5. Invalid login shows error message
6. Register with existing email shows error message
7. Auth layout centers content vertically and horizontally
8. Forms use shadcn/ui Card, Input, Button components
9. Server actions validate input (non-empty fields, valid email format)
10. Password stored as bcrypt hash (never plaintext)

**TDD:**
```
- Test: register action creates user in DB with hashed password
- Test: register action rejects duplicate email
- Test: register action rejects empty name/email/password
- Test: login action succeeds with correct credentials
- Test: login action fails with wrong password
- Test: login action fails with non-existent email
- Test: Login page renders form with email and password fields
- Test: Register page renders form with name, email, and password fields
```

---

### Task 8: Dashboard Layout Shell — Sidebar, Top Bar, Navigation

**Depends:** T5, T6, T7

**Description:** Build `(dashboard)` layout with sidebar navigation (shadcn Sidebar), top bar (XP bar placeholder, level badge placeholder, user menu), and route protection.

**Files to create/modify:**
- `src/app/(dashboard)/layout.tsx` (sidebar + top bar + auth check)
- `src/components/layout/app-sidebar.tsx` (Home, Learn, Compete, Review, Board, Profile links)
- `src/components/layout/top-bar.tsx` (XP bar placeholder, level badge placeholder, streak placeholder, user dropdown)
- `src/components/layout/page-header.tsx` (reusable page title + breadcrumbs)
- `src/app/(dashboard)/page.tsx` (dashboard home placeholder)
- `src/app/proxy.ts` (route protection — redirect unauthenticated users)
- Install shadcn components: `sidebar`, `avatar`, `dropdown-menu`, `separator`, `tooltip`, `skeleton`

**AC:**
1. Unauthenticated users redirected to `/login` when accessing any `(dashboard)` route
2. Sidebar renders with navigation links: Home, Learn, Compete, Review, Leaderboard, Profile
3. Sidebar highlights active route
4. Top bar shows user name/avatar and a dropdown with logout option
5. Top bar has placeholder slots for XP bar, level badge, and streak counter
6. Dashboard home page (`/`) renders welcome message with user's name
7. Sidebar collapses on mobile (responsive)
8. Logout action signs out and redirects to `/login`
9. `proxy.ts` protects `(dashboard)` routes and `(educator)` routes

**TDD:**
```
- Test: Dashboard layout renders sidebar and top bar
- Test: Sidebar contains all 6 navigation links with correct hrefs
- Test: Top bar renders user name from session
- Test: proxy.ts redirects unauthenticated requests to /login
- Test: proxy.ts allows authenticated requests through
- Test: proxy.ts redirects educator routes for non-educator roles
- Test: Dashboard home page renders welcome message
```

---

## Phase 2 — Curriculum & Static Scenarios (Tasks 9–14)

### Task 9: Seed Curriculum Levels & Skill Objectives

**Depends:** T4

**Description:** Create seed script that inserts 10 curriculum levels and 12 skill objectives into the database. Run as part of setup.

**Files to create/modify:**
- `src/lib/db/seed.ts` (seed function)
- `package.json` (add `db:seed` script)

**AC:**
1. `npm run db:seed` inserts 10 curriculum levels matching architecture §10.1
2. Each level has correct `level_number`, `name`, `description`, `prerequisite_level`, `mastery_threshold` (80), `min_attempts_required` (10)
3. 12 skill objectives inserted matching architecture §10.2 with correct `code`, `name`, `description`, `curriculum_level_id`
4. Seed is idempotent (running twice doesn't duplicate data)
5. Level prerequisites form correct chain: Level 2 requires Level 1, etc.

**TDD:**
```
- Test: After seeding, 10 curriculum_levels exist in DB
- Test: After seeding, 12 skill_objectives exist in DB
- Test: Level 1 has no prerequisite, Level 2 has prerequisite Level 1
- Test: OBJ-001 maps to Level 1, OBJ-003 maps to Level 2, etc.
- Test: Running seed twice results in exactly 10 levels and 12 objectives (idempotent)
```

---

### Task 10: Curriculum Map Page (`/learn`)

**Depends:** T8, T9

**Description:** Build the curriculum map page showing all 10 levels as cards with locked/unlocked/mastered state based on user's `current_curriculum_level`.

**Files to create/modify:**
- `src/app/(dashboard)/learn/page.tsx` (server component — fetch levels + user progress)
- `src/components/game/curriculum-map.tsx` (visual level progression component)

**AC:**
1. Page fetches all curriculum levels and user's `current_curriculum_level`
2. Levels at or below user's current level show as unlocked (clickable)
3. Levels above user's current level show as locked (grayed out, not clickable)
4. Each level card shows: level number, name, description, objective count
5. Unlocked levels link to `/learn/[levelId]`
6. Current level is visually highlighted
7. Server component — no client-side data fetching

**TDD:**
```
- Test: Page renders 10 level cards
- Test: For user at level 3, levels 1-3 are unlocked, 4-10 are locked
- Test: Unlocked level cards have links to /learn/[levelId]
- Test: Locked level cards do not have clickable links
- Test: Current level card has distinct visual treatment
```

---

### Task 11: Level Detail Page (`/learn/[levelId]`)

**Depends:** T10

**Description:** Build level detail page showing level info, skill objectives for the level, and a list of available scenarios (initially empty/placeholder).

**Files to create/modify:**
- `src/app/(dashboard)/learn/[levelId]/page.tsx` (server component)
- `src/components/trading/scenario-card.tsx` (scenario preview card)

**AC:**
1. Page shows level name, description, and mastery threshold
2. Lists skill objectives for this level with codes and descriptions
3. Shows available scenarios as cards (empty state if no scenarios exist yet)
4. Scenario cards show: difficulty, market regime, target objectives
5. Redirects to `/learn` if user hasn't unlocked this level
6. `params` is awaited (Next.js 16 async params)
7. Breadcrumb: Learn > Level {n}: {name}

**TDD:**
```
- Test: Page renders level name and description for valid levelId
- Test: Page shows skill objectives belonging to this level
- Test: Page shows "No scenarios available" when none exist
- Test: Page redirects unauthorized users (level not unlocked)
- Test: Scenario card renders difficulty, regime, and objectives
```

---

### Task 12: Scenario Attempt Page (Mock Grading)

**Depends:** T11

**Description:** Build the multi-phase scenario attempt page: Read → Respond → Grading → Feedback. Use mock grading (random score + static feedback) until Python service is ready.

**Files to create/modify:**
- `src/app/(dashboard)/learn/[levelId]/scenario/[scenarioId]/page.tsx` (client component — multi-phase UI)
- `src/components/trading/scenario-reader.tsx` (scenario text + market data display)
- `src/components/trading/response-editor.tsx` (textarea for response)
- `src/components/trading/grading-result.tsx` (score breakdown + feedback display)
- `src/actions/scenario.ts` (startScenario, submitResponse server actions — mock grading)

**AC:**
1. Phase 1 (Read): Displays scenario text and market data, "Start Response" button
2. Phase 2 (Respond): Shows textarea editor, "Submit" button, character count
3. Phase 3 (Grading): Shows loading spinner, then score and rubric breakdown
4. Phase 4 (Summary): Shows final score, "Next Scenario" and "Back to Level" buttons
5. `startScenario` server action creates a `scenario_attempts` row
6. `submitResponse` server action updates attempt with response text and mock score
7. Mock grading returns a random score 50-100 with static feedback text
8. Time spent tracked (start time to submit time → `time_spent_seconds`)
9. Cannot submit empty response

**TDD:**
```
- Test: startScenario creates scenario_attempts row with user_id and scenario_id
- Test: submitResponse updates attempt with response_text and score
- Test: submitResponse rejects empty response
- Test: Scenario reader renders scenario_text and market_data
- Test: Response editor renders textarea and submit button
- Test: Grading result displays score and feedback
- Test: Phase transitions work: Read → Respond → Grading → Summary
```

---

### Task 13: Market Data Panel Component

**Depends:** T12

**Description:** Build a structured display component for scenario market data (underlying, price, IV, VIX, Greeks, option chain snippet).

**Files to create/modify:**
- `src/components/trading/market-data-panel.tsx`

**AC:**
1. Renders structured market data from scenario's `market_data` JSON
2. Displays: underlying ticker, price, IV rank, VIX level
3. Handles optional fields gracefully (not all scenarios have all fields)
4. Dark-themed with trading-platform aesthetic (monospace numbers, green/red for up/down)
5. Responsive — stacks on mobile

**TDD:**
```
- Test: Renders underlying ticker and price
- Test: Renders IV rank and VIX when present
- Test: Handles missing optional fields without error
- Test: Numbers use monospace styling
```

---

### Task 14: Profile Page

**Depends:** T8

**Description:** Build user profile page showing basic stats: XP, level, streak, attempt history summary, and account settings.

**Files to create/modify:**
- `src/app/(dashboard)/profile/page.tsx` (server component)

**AC:**
1. Displays user name, email, role, avatar placeholder
2. Shows current XP, level (with badge name from LEVEL_THRESHOLDS), and streak
3. Shows total scenario attempts count and average score
4. Shows curriculum progress (current level / 10)
5. Shows member since date

**TDD:**
```
- Test: Profile page renders user name and email
- Test: Profile page shows XP and level from user record
- Test: Profile page shows attempt count (0 for new user)
- Test: Profile page shows curriculum level progress
```

---

## Phase 3 — Python AI Service (Tasks 15–22)

### Task 15: Scaffold Python FastAPI Project

**Depends:** T2

**Description:** Create the Python FastAPI project structure with Pydantic v2 models, router stubs, config, health endpoint, and Dockerfile.

**Files to create/modify:**
- `python-service/main.py` (FastAPI app with CORS, lifespan)
- `python-service/config.py` (pydantic-settings: DATABASE_URL, LLM keys, ports)
- `python-service/routers/__init__.py`
- `python-service/routers/scenarios.py` (stub)
- `python-service/routers/grading.py` (stub)
- `python-service/routers/rag.py` (stub)
- `python-service/services/__init__.py`
- `python-service/models/schemas.py` (all Pydantic v2 request/response models from §3.3)
- `python-service/requirements.txt`
- `python-service/Dockerfile`

**AC:**
1. `uvicorn main:app --reload` starts on port 8000
2. `GET /api/health` returns `{ "status": "ok", "model": "...", "db": "connected" }`
3. All Pydantic models from architecture §3.3 defined (ScenarioGenerateRequest, GradingEvaluateRequest, etc.)
4. CORS configured for `localhost:3000`
5. Routers mounted at `/api/scenarios`, `/api/grading`, `/api/rag`
6. Config loaded from environment variables via pydantic-settings
7. Dockerfile builds and runs successfully
8. All async endpoints (`async def`)

**TDD:**
```python
# test_health.py
- Test: GET /api/health returns 200 with status "ok"
- Test: POST /api/scenarios/generate returns 501 (stub)
- Test: POST /api/grading/evaluate returns 501 (stub)
- Test: ScenarioGenerateRequest validates required fields
- Test: GradingEvaluateRequest validates required fields
- Test: Config loads from environment variables
```

---

### Task 16: LLM Service Abstraction

**Depends:** T15

**Description:** Implement provider-agnostic LLM client supporting OpenAI (primary) with structured JSON output. Model selection via config.

**Files to create/modify:**
- `python-service/services/llm_service.py`

**AC:**
1. `LLMService` class with `generate()` and `generate_json()` methods
2. OpenAI provider implemented (uses `openai` SDK)
3. Model configurable per use case: `LLM_SCENARIO_MODEL`, `LLM_GRADING_MODEL`
4. `generate_json()` returns parsed dict matching provided Pydantic schema
5. Temperature, system prompt, and user prompt configurable per call
6. Handles API errors gracefully (retries with backoff for rate limits)
7. Async throughout

**TDD:**
```python
- Test: LLMService initializes with config (mock OpenAI client)
- Test: generate() calls OpenAI with correct system/user prompts
- Test: generate_json() returns parsed dict matching schema
- Test: generate() retries on rate limit error (mock 429 response)
- Test: generate() raises after max retries exceeded
- Test: Model selection uses config values
```

---

### Task 17: Scenario Generation Engine

**Depends:** T16

**Description:** Build scenario generation service with Jinja2 prompt templates. Generates a single scenario for a given curriculum level, difficulty, and market regime. Includes self-critique quality scoring.

**Files to create/modify:**
- `python-service/services/scenario_generator.py`
- `python-service/prompts/scenario_generation.j2`

**AC:**
1. Generates a complete scenario given: `curriculum_level`, `difficulty`, `market_regime`, `target_objectives`
2. Jinja2 template produces well-structured prompt with all required fields
3. Output includes: `scenario_text`, `market_data`, `question_prompt`, `target_objectives`, `rubric`
4. Self-critique pass: generated scenario is evaluated for quality (coherence, difficulty calibration)
5. `quality_score` (0-1) attached to generated scenario
6. Scenario stored in `scenarios` table via asyncpg
7. Validates output structure before storage

**TDD:**
```python
- Test: Jinja2 template renders with all required variables
- Test: generate_scenario returns valid ScenarioResponse (mock LLM)
- Test: quality_score is between 0 and 1
- Test: Generated scenario includes all required fields
- Test: Scenario is stored in DB after generation
- Test: Invalid LLM output raises validation error
```

---

### Task 18: Grading Engine

**Depends:** T16

**Description:** Build rubric-based grading service. Takes scenario + rubric + student response, returns per-criterion scores, total score, skill objectives demonstrated, feedback, and probing questions.

**Files to create/modify:**
- `python-service/services/grading_engine.py`
- `python-service/prompts/grading.j2`

**AC:**
1. Grades a response against scenario rubric criteria
2. Returns per-criterion evaluation with: criterion name, weight, score, max_score, evidence quote, feedback
3. Calculates weighted total_score (0-100)
4. Identifies skill objectives demonstrated vs. failed
5. Generates 1-3 probing follow-up questions targeting gaps
6. Provides overall feedback_summary
7. Jinja2 template includes rubric, scenario, and student response

**TDD:**
```python
- Test: grade_response returns valid GradingResponse (mock LLM)
- Test: total_score is 0-100
- Test: criteria_evaluation has correct number of items matching rubric
- Test: skill_objectives_demonstrated is subset of target_objectives
- Test: probing_questions contains 1-3 items
- Test: Grading Jinja2 template renders correctly
```

---

### Task 19: Probing Question Evaluation

**Depends:** T18

**Description:** Build probing question grading — evaluates a student's response to a follow-up probing question in context of the original scenario and response.

**Files to create/modify:**
- `python-service/services/grading_engine.py` (add `evaluate_probing()` method)
- `python-service/prompts/probing.j2`
- `python-service/routers/grading.py` (add `/api/grading/evaluate-probing` endpoint)

**AC:**
1. `POST /api/grading/evaluate-probing` accepts original scenario, original response, probing question, probing response
2. Returns score (0-100) and feedback
3. Evaluates depth of understanding, not just correctness
4. Jinja2 template provides full context for evaluation

**TDD:**
```python
- Test: evaluate_probing returns score and feedback (mock LLM)
- Test: POST /api/grading/evaluate-probing returns 200 with score and feedback
- Test: Rejects request missing required fields
- Test: Score is 0-100
```

---

### Task 20: RAG Service — Document Ingestion & Retrieval

**Depends:** T15

**Description:** Implement RAG service with pgvector for document ingestion (chunking + embedding) and similarity search retrieval.

**Files to create/modify:**
- `python-service/services/rag_service.py`
- `python-service/routers/rag.py` (implement `/api/rag/query` and `/api/rag/ingest`)

**AC:**
1. `POST /api/rag/ingest` accepts file upload, chunks document, generates embeddings, stores in `document_chunks`
2. Chunking uses RecursiveCharacterTextSplitter (1000 chars, 200 overlap)
3. Embeddings generated via OpenAI `text-embedding-3-small` (1536 dimensions)
4. `POST /api/rag/query` performs cosine similarity search, returns top-k chunks
5. Supports filtering by `document_type`
6. Returns chunks with `content`, `document_name`, `relevance_score`
7. HNSW index used for fast retrieval

**TDD:**
```python
- Test: ingest_document creates chunks in DB (mock embeddings)
- Test: Chunking produces correct number of chunks for known input
- Test: query returns top-k results sorted by relevance
- Test: query with document_type filter only returns matching types
- Test: POST /api/rag/ingest returns chunk count
- Test: POST /api/rag/query returns chunks array
```

---

### Task 21: Scenario Batch Pre-Generation

**Depends:** T17

**Description:** Implement batch scenario generation endpoint for nightly pre-generation. Generates N scenarios per curriculum level across varied market regimes. Filters by quality score.

**Files to create/modify:**
- `python-service/routers/scenarios.py` (implement `/api/scenarios/generate-batch`)
- `python-service/services/scenario_generator.py` (add `generate_batch()`)

**AC:**
1. `POST /api/scenarios/generate-batch` accepts `curriculum_level`, `count`, `market_regimes`
2. Generates requested count of scenarios across specified regimes
3. Only stores scenarios with `quality_score >= 0.7`
4. Returns counts: `generated`, `passed_quality`, `failed_quality`
5. Handles partial failures gracefully (one bad scenario doesn't abort batch)
6. Sets `is_active = true` on quality-passing scenarios

**TDD:**
```python
- Test: generate_batch creates scenarios in DB (mock LLM)
- Test: Scenarios with quality_score < 0.7 are not stored as active
- Test: Response includes correct generated/passed/failed counts
- Test: Batch handles individual generation failures gracefully
- Test: Scenarios distributed across provided market_regimes
```

---

### Task 22: Wire Next.js Server Actions to Python Service

**Depends:** T12, T18, T19

**Description:** Replace mock grading in Next.js server actions with real calls to the Python AI service. Create an API client helper.

**Files to create/modify:**
- `src/lib/ai/client.ts` (typed HTTP client for Python service)
- `src/actions/scenario.ts` (update `submitResponse` to call Python grading)
- `src/actions/scenario.ts` (add `submitProbingResponse` action)

**AC:**
1. `src/lib/ai/client.ts` provides typed functions: `gradeResponse()`, `evaluateProbing()`, `generateScenario()`, `queryRag()`
2. API client sends `x-internal-token` header for auth
3. `submitResponse` calls Python `/api/grading/evaluate` and stores result
4. `submitProbingResponse` calls Python `/api/grading/evaluate-probing`
5. Attempt's `ai_feedback`, `score`, `probing_questions` fields populated from grading response
6. `attempt_objectives` rows created from grading response's `skill_objectives_demonstrated`
7. Graceful error handling if Python service is unreachable (returns error to client)
8. Scenario attempt page shows real AI grading feedback

**TDD:**
```
- Test: AI client sends correct request to grading endpoint (mock HTTP)
- Test: AI client includes x-internal-token header
- Test: submitResponse stores grading result in scenario_attempts
- Test: submitResponse creates attempt_objectives rows
- Test: submitProbingResponse stores probing score and feedback
- Test: AI client returns error object when service unreachable
```

---

## Phase 4 — Gamification (Tasks 23–30)

### Task 23: XP Award Logic

**Depends:** T22

**Description:** Implement XP calculation and award logic as described in architecture §7.1. Insert xp_events, update user XP, check level-up, update streak.

**Files to create/modify:**
- `src/lib/game/levels.ts` (LEVEL_THRESHOLDS constant and `calculateLevel()`)
- `src/lib/game/xp.ts` (XP calculation: base + bonus from score)
- `src/actions/gamification.ts` (awardXp server action, getLeaderboard)
- `src/actions/scenario.ts` (call awardXp after grading)

**AC:**
1. `LEVEL_THRESHOLDS` matches architecture §7.2 (10 levels, 0 to 10000)
2. XP calculated: base 10 + bonus (25 if score>=90, 10 if score>=80, else 0)
3. `xp_events` row inserted for each award
4. `users.xp` atomically incremented
5. Level-up detected: if `users.xp >= LEVEL_THRESHOLDS[users.level + 1]`, increment `users.level`
6. `awardXp` returns `{ newXp, newLevel, leveledUp }`
7. Streak updated: same day = skip, yesterday = increment, else reset to 1
8. `user_streaks.longest_streak` updated if current exceeds longest

**TDD:**
```
- Test: calculateLevel(0) = 1, calculateLevel(100) = 2, calculateLevel(10000) = 10
- Test: XP bonus for score 95 = 25, score 85 = 10, score 70 = 0
- Test: awardXp inserts xp_event row
- Test: awardXp increments users.xp atomically
- Test: awardXp detects level-up when crossing threshold
- Test: Streak increments when last_activity_date is yesterday
- Test: Streak resets to 1 when last_activity_date is >1 day ago
- Test: Streak unchanged when last_activity_date is today
- Test: longest_streak updated when current > longest
```

---

### Task 24: XP Bar Component

**Depends:** T23

**Description:** Build animated XP progress bar showing current XP, next level threshold, and fill animation using Motion.

**Files to create/modify:**
- `src/components/game/xp-bar.tsx` (client component with Motion animation)
- Install shadcn: `progress`

**AC:**
1. Shows current XP / next level threshold (e.g., "350 / 600 XP")
2. Bar fills proportionally to progress within current level
3. Fill animation uses Motion (smooth transition on XP change)
4. Green accent color for fill
5. Displays current level name badge next to bar

**TDD:**
```
- Test: XP bar renders current XP and threshold
- Test: Bar fill percentage calculated correctly (e.g., 250/300 = 83% for level 2→3)
- Test: Component accepts currentXp and currentLevel props
- Test: Level name displayed (e.g., "Analyst I" for level 2)
```

---

### Task 25: Level Badge Component

**Depends:** T23

**Description:** Build level badge component displaying current level number and badge name.

**Files to create/modify:**
- `src/components/game/level-badge.tsx`

**AC:**
1. Displays level number in a styled badge
2. Shows badge name (e.g., "Trader I" for level 4)
3. Uses architecture's level names from LEVEL_THRESHOLDS
4. Visually distinct — stands out in top bar

**TDD:**
```
- Test: Renders level number and badge name
- Test: Level 1 shows "Recruit", Level 10 shows "CapMan Pro"
```

---

### Task 26: Level-Up Modal

**Depends:** T24, T25

**Description:** Build a celebratory level-up modal with Motion animations. Triggered when `awardXp` returns `leveledUp: true`.

**Files to create/modify:**
- `src/components/game/level-up-modal.tsx` (client component)
- Install shadcn: `dialog`

**AC:**
1. Modal appears with spring animation (scale from 0 → 1)
2. Shows "LEVEL UP!" message with new level number and badge name
3. Shows what content is now unlocked (new curriculum level hint)
4. Dismiss button closes modal with exit animation
5. Confetti or particle effect (simple CSS/Motion based)
6. Sound effect optional but considered

**TDD:**
```
- Test: Modal renders with new level and badge name
- Test: Modal shows "Level Up" heading
- Test: Close button triggers onClose callback
- Test: Modal renders AnimatePresence wrapper
```

---

### Task 27: Streak Counter

**Depends:** T23

**Description:** Build daily streak counter component with fire icon and streak logic.

**Files to create/modify:**
- `src/components/game/streak-counter.tsx`

**AC:**
1. Displays current streak count with fire/flame icon
2. Shows "0" if no streak
3. Visual intensity increases with streak length (subtle color/size change)
4. Tooltip shows last activity date and longest streak

**TDD:**
```
- Test: Renders streak count
- Test: Shows 0 streak for new user
- Test: Fire icon rendered
- Test: Tooltip shows longest streak
```

---

### Task 28: XP Popup Animation

**Depends:** T23

**Description:** Build floating "+50 XP!" animation that appears when XP is awarded, floats upward, and fades out.

**Files to create/modify:**
- `src/components/game/xp-popup.tsx` (client component with Motion)

**AC:**
1. Renders "+{amount} XP!" text
2. Animates: fade in → float upward → fade out (total ~1.5s)
3. Positioned near the XP bar
4. Uses green accent color
5. Auto-removes from DOM after animation completes

**TDD:**
```
- Test: Renders XP amount text
- Test: Component accepts amount prop
- Test: AnimatePresence wraps for exit animation
```

---

### Task 29: Leaderboard Page

**Depends:** T23

**Description:** Build leaderboard page with three tabs: All-Time, Weekly, and Skill-Level. Fetch data via server actions.

**Files to create/modify:**
- `src/app/(dashboard)/leaderboard/page.tsx`
- `src/components/game/leaderboard-table.tsx` (Motion layout animations for rank changes)
- `src/components/game/leaderboard-tabs.tsx` (tab switcher)
- `src/actions/gamification.ts` (add `getLeaderboard` action)
- Install shadcn: `tabs`, `table`

**AC:**
1. Three tabs: All-Time, Weekly, Skill-Level
2. All-Time: top 50 by total XP
3. Weekly: top 50 by XP earned this week (since Monday 00:00 UTC)
4. Skill-Level: filter by curriculum level, top 50
5. Each row: rank, avatar, name, XP, level badge
6. Current user's row highlighted
7. Motion layout animations for smooth rank transitions
8. Empty state for no data

**TDD:**
```
- Test: getLeaderboard('alltime') returns users ordered by XP desc
- Test: getLeaderboard('weekly') sums xp_events for current week
- Test: Leaderboard table renders rows with rank, name, XP
- Test: Current user row has highlight styling
- Test: Tabs switch between all-time, weekly, skill views
```

---

### Task 30: Leaderboard SSE Stream

**Depends:** T29

**Description:** Implement SSE endpoint for real-time leaderboard updates. Client connects and receives updated leaderboard data every 5 seconds.

**Files to create/modify:**
- `src/app/api/leaderboard/stream/route.ts` (SSE endpoint)
- `src/components/game/leaderboard-table.tsx` (add SSE client connection)

**AC:**
1. `GET /api/leaderboard/stream` returns SSE stream (`text/event-stream`)
2. Pushes top 50 leaderboard data every 5 seconds
3. Client connects via `EventSource` and updates leaderboard in real-time
4. Stream cleans up on client disconnect
5. Leaderboard table uses Motion layout animations when positions change

**TDD:**
```
- Test: SSE endpoint returns correct content-type headers
- Test: SSE stream sends data events
- Test: Client component updates when receiving SSE data
- Test: Stream cleanup on disconnect (no memory leak)
```

---

## Phase 5 — MTSS Dashboard (Tasks 31–37)

### Task 31: MTSS Classification Algorithm

**Depends:** T22

**Description:** Implement MTSS tier classification that runs after every scenario grading. Classifies user per skill objective into Tier 1/2/3.

**Files to create/modify:**
- `src/lib/mtss/classifier.ts` (classification algorithm)
- `src/actions/scenario.ts` (call classifier after grading + XP award)

**AC:**
1. After each grading, classify user for each skill objective tested
2. Uses last 10 attempts for user+objective pair
3. `< 3 attempts` → default Tier 1
4. `avg_score < 50 OR inactive >= 5 days` → Tier 3
5. `avg_score < 70 OR inactive >= 3 days` → Tier 2
6. Otherwise → Tier 1
7. Insert `mtss_classifications` row (new row when tier changes, update otherwise)
8. `classified_at` timestamp tracks when tier was computed

**TDD:**
```
- Test: < 3 attempts returns Tier 1
- Test: avg_score 40 returns Tier 3
- Test: avg_score 60 returns Tier 2
- Test: avg_score 80 returns Tier 1
- Test: 5+ days inactive returns Tier 3 regardless of score
- Test: 3-4 days inactive returns Tier 2 regardless of score
- Test: Classification row inserted in mtss_classifications
- Test: Tier change creates new row
```

---

### Task 32: Educator Layout & Route Protection

**Depends:** T8

**Description:** Build `(educator)` route group with its own layout and navigation. Only accessible to educator/admin roles.

**Files to create/modify:**
- `src/app/(educator)/layout.tsx` (educator nav shell)
- `src/app/(educator)/page.tsx` (MTSS overview placeholder)
- `src/app/proxy.ts` (update to protect educator routes)

**AC:**
1. `(educator)` routes only accessible to `role === 'educator'` or `role === 'admin'`
2. Non-educator users redirected to dashboard
3. Layout has educator-specific navigation: Overview, Students, Interventions, Analytics
4. Layout visually distinct from learner dashboard (e.g., different accent color or header)

**TDD:**
```
- Test: Educator layout renders for educator role
- Test: proxy.ts redirects learner from /educator routes
- Test: proxy.ts allows educator through to /educator routes
- Test: proxy.ts allows admin through to /educator routes
- Test: Educator nav shows Overview, Students, Interventions, Analytics links
```

---

### Task 33: Tier Heatmap Component

**Depends:** T31, T32

**Description:** Build cohort heatmap showing Learner × Skill Objective grid, color-coded by MTSS tier (green=T1, yellow=T2, red=T3).

**Files to create/modify:**
- `src/components/mtss/tier-heatmap.tsx`
- `src/actions/educator.ts` (add `getMtssOverview` server action)

**AC:**
1. Grid rows = learners, columns = skill objectives
2. Each cell color-coded: green (Tier 1), amber (Tier 2), red (Tier 3), gray (no data)
3. Cell shows tier number on hover (tooltip)
4. Sortable by learner name or by worst tier
5. Filterable by curriculum level
6. Clicking a cell navigates to learner detail
7. Uses latest classification per user+objective

**TDD:**
```
- Test: getMtssOverview returns matrix of user × objective × tier
- Test: Heatmap renders correct number of rows (learners) and columns (objectives)
- Test: Tier 1 cells have green color class
- Test: Tier 3 cells have red color class
- Test: No-data cells have gray color class
- Test: Filtering by level shows only relevant objectives
```

---

### Task 34: Tier Distribution Chart

**Depends:** T31, T32

**Description:** Build bar chart showing T1/T2/T3 learner counts. Uses shadcn Chart (Recharts).

**Files to create/modify:**
- `src/components/mtss/tier-distribution.tsx`
- Install shadcn: `chart`

**AC:**
1. Bar chart with 3 bars: Tier 1, Tier 2, Tier 3
2. Each bar shows count of unique learners in that tier
3. Color-coded: green, amber, red
4. Percentage labels on bars
5. Chart rendered via shadcn Chart (Recharts wrapper)

**TDD:**
```
- Test: Chart renders 3 bars
- Test: Correct counts for each tier
- Test: Percentages sum to ~100%
```

---

### Task 35: Intervention Queue

**Depends:** T31, T32

**Description:** Build Tier 3 intervention queue showing priority list of learners needing immediate attention, with "Send Nudge" action.

**Files to create/modify:**
- `src/components/mtss/intervention-queue.tsx`
- `src/actions/educator.ts` (add `getInterventionQueue`, `sendNudge` server actions)
- `src/app/(educator)/interventions/page.tsx`

**AC:**
1. Lists all Tier 3 classified learners sorted by days since last activity (descending)
2. Each item shows: learner name, failing objectives, avg score, days since last activity
3. "Send Nudge" button sends notification to learner (stored in DB or via WebSocket)
4. "View Detail" links to learner detail page
5. Empty state when no Tier 3 learners

**TDD:**
```
- Test: getInterventionQueue returns Tier 3 learners sorted by inactivity
- Test: Each item includes learner name, objectives, avg_score, days_inactive
- Test: sendNudge creates notification record
- Test: Queue shows empty state when no Tier 3 learners
```

---

### Task 36: Learner Detail Page

**Depends:** T33

**Description:** Build individual learner drill-down page showing their skill objective history, recent attempts, XP trend, and engagement metrics.

**Files to create/modify:**
- `src/app/(educator)/students/[userId]/page.tsx`
- `src/components/mtss/learner-detail-card.tsx`
- `src/actions/educator.ts` (add `getLearnerDetail` server action)

**AC:**
1. Shows learner name, level, XP, current streak
2. Skill objective breakdown: each objective with current tier, avg score, attempt count
3. Recent 10 attempts list with scenario name, score, date
4. MTSS tier history timeline per objective
5. Engagement: sessions this week, last active date
6. Breadcrumb: Students > {Learner Name}

**TDD:**
```
- Test: getLearnerDetail returns user info + objective scores + attempts
- Test: Page renders learner name and level
- Test: Page shows skill objective breakdown with tiers
- Test: Page shows recent attempts
- Test: 404 for non-existent userId
```

---

### Task 37: Engagement Metrics Panel & Educator Dashboard Assembly

**Depends:** T33, T34, T35

**Description:** Build engagement metrics panel (DAU/WAU, sessions, challenge rate) and assemble the full educator MTSS dashboard.

**Files to create/modify:**
- `src/components/mtss/engagement-panel.tsx`
- `src/components/mtss/cohort-progress-chart.tsx`
- `src/components/mtss/scenario-analytics.tsx`
- `src/app/(educator)/page.tsx` (assemble all components)
- `src/app/(educator)/analytics/page.tsx`

**AC:**
1. Engagement panel shows: DAU, WAU, avg sessions/week, challenge participation rate
2. Cohort progress chart: line chart of average mastery per curriculum level over time
3. Scenario analytics: pass/fail rates per scenario, identifying outlier scenarios
4. MTSS overview page assembles: tier distribution, heatmap, intervention queue, engagement panel
5. Analytics page shows: cohort progress chart, scenario analytics
6. All data fetched server-side

**TDD:**
```
- Test: Engagement panel renders DAU and WAU counts
- Test: Cohort progress chart renders with mock data
- Test: Scenario analytics shows pass/fail rates
- Test: MTSS overview page renders all 4 sections
```

---

## Phase 6 — Real-Time Challenges (Tasks 38–45)

### Task 38: Custom server.ts with Socket.io

**Depends:** T1

**Description:** Create custom Node.js HTTP server wrapping Next.js with Socket.io for WebSocket support. Required for Railway deployment.

**Files to create/modify:**
- `server.ts` (custom server at project root)
- `package.json` (update start script to use `server.ts`)
- `tsconfig.server.json` (server-specific tsconfig)

**AC:**
1. Custom server starts Next.js app + Socket.io on same port (3000)
2. HTTP requests handled by Next.js
3. WebSocket connections handled by Socket.io
4. Socket.io namespaces: `/challenges`, `/notifications`
5. CORS configured for client origin
6. `npm run dev` still works (custom server in dev mode with hot reload)
7. `npm run build && npm start` works for production

**TDD:**
```
- Test: Server starts and listens on port 3000
- Test: HTTP GET / returns Next.js page
- Test: Socket.io client can connect to /challenges namespace
- Test: Socket.io client can connect to /notifications namespace
```

---

### Task 39: Socket.io Client Provider

**Depends:** T38

**Description:** Create Socket.io client context provider that wraps the dashboard layout. Provides socket instances to child components.

**Files to create/modify:**
- `src/components/providers/socket-provider.tsx` (client component)
- `src/app/(dashboard)/layout.tsx` (wrap with SocketProvider)

**AC:**
1. `SocketProvider` creates and manages Socket.io client connection
2. Connects to `/challenges` and `/notifications` namespaces
3. Exposes socket instances via React context
4. `useSocket()` hook for components to access sockets
5. Auto-reconnect on disconnect
6. Cleans up connections on unmount
7. Only connects when user is authenticated (reads session)

**TDD:**
```
- Test: SocketProvider renders children
- Test: useSocket returns socket instances
- Test: Socket connects on mount
- Test: Socket disconnects on unmount
```

---

### Task 40: Matchmaking Queue Logic (Server-Side)

**Depends:** T38

**Description:** Implement matchmaking queue on Socket.io server. Matches players by curriculum level with XP-based compatibility, widening criteria over time.

**Files to create/modify:**
- `server.ts` (add matchmaking logic in `/challenges` namespace)
- `src/lib/challenge/matchmaking.ts` (matchmaking algorithm — can be imported by server)

**AC:**
1. Player sends `challenge:request` with `curriculumLevelId` → enters queue
2. Queue grouped by curriculum level
3. Match criteria: same level, XP within ±400
4. After 30s: relax to ±800 XP
5. After 60s: match any same-level player
6. On match: create `challenges` row in DB, emit `challenge:matched` to both
7. `challenge:cancel` removes player from queue
8. Handle disconnects (remove from queue)

**TDD:**
```
- Test: isCompatible returns true for same level, XP within 400
- Test: isCompatible returns false for different levels
- Test: Relaxed matching at 30s allows ±800 XP
- Test: After 60s, any same-level player matches
- Test: Cancel removes player from queue
- Test: Disconnect removes player from queue
- Test: Successful match creates challenges DB row
```

---

### Task 41: Challenge Lobby Page

**Depends:** T39, T40

**Description:** Build challenge lobby page where users can request a match, see waiting animation, and get notified when matched.

**Files to create/modify:**
- `src/app/(dashboard)/compete/page.tsx`
- `src/components/challenge/challenge-lobby.tsx`
- `src/components/challenge/matchmaking-spinner.tsx`

**AC:**
1. "Find Match" button sends `challenge:request` via socket
2. Shows animated matchmaking spinner while searching
3. Cancel button available during search
4. On `challenge:matched` event, navigates to challenge room
5. Shows opponent info (name, level) on match
6. Shows 5-second countdown before navigating to challenge room
7. Past challenges history shown below lobby

**TDD:**
```
- Test: Lobby page renders "Find Match" button
- Test: Clicking "Find Match" shows spinner
- Test: Cancel button hides spinner
- Test: Navigation triggered on challenge:matched event
- Test: Countdown displays after match
```

---

### Task 42: Challenge Room Page

**Depends:** T41

**Description:** Build live challenge room with timer, scenario display, response editor, and opponent status.

**Files to create/modify:**
- `src/app/(dashboard)/compete/[challengeId]/page.tsx` (client component)
- `src/components/challenge/challenge-room.tsx`
- `src/components/challenge/challenge-timer.tsx`

**AC:**
1. Shows scenario text and market data (same for both players)
2. 5-minute countdown timer with urgency color changes (green → amber → red at <60s)
3. Textarea for response submission
4. Shows opponent status: "Writing...", "Submitted", "Waiting for results"
5. `challenge:submit` sends response via socket
6. Auto-submits on timer expiry (`challenge:timeout`)
7. Submit button disabled after submission
8. Timer tracked server-side (not just client)

**TDD:**
```
- Test: Challenge room renders scenario text
- Test: Timer starts at 5:00 and counts down
- Test: Submit button sends response via socket
- Test: Submit button disabled after submission
- Test: Opponent status updates on challenge:opponent_submitted event
- Test: Auto-submit triggered at timer expiry
```

---

### Task 43: Challenge Grading Flow

**Depends:** T42, T22

**Description:** Implement server-side challenge grading: when both responses received (or timeout), grade both via Python service, determine winner, award XP.

**Files to create/modify:**
- `server.ts` (add grading flow in challenge handler)
- `src/actions/challenge.ts` (server action helpers for DB operations)

**AC:**
1. When both participants submit (or timeout forces submission), trigger grading
2. Both responses graded in parallel via Python service
3. Higher score wins; tiebreaker = faster submission time
4. Winner gets 50 XP, loser gets 10 XP
5. Results stored in `challenge_participants` (response_text, score, submitted_at)
6. Challenge status → `complete`, `winner_id` set
7. `challenge:results` emitted to both with scores and winner

**TDD:**
```
- Test: Grading triggered when both responses received
- Test: Higher score wins
- Test: Tiebreaker: faster submission wins
- Test: Winner gets 50 XP, loser gets 10 XP
- Test: Challenge status set to complete
- Test: Results emitted to both players
```

---

### Task 44: Challenge Results Page

**Depends:** T43

**Description:** Build challenge results display showing side-by-side comparison of both responses, scores, winner, and XP awarded.

**Files to create/modify:**
- `src/components/challenge/challenge-results.tsx`

**AC:**
1. Shows "You Win!" or "You Lose" with appropriate styling
2. Side-by-side score comparison (your score vs opponent score)
3. XP awarded display with popup animation
4. "View Opponent's Response" expandable section
5. "Rematch" button and "Back to Lobby" button
6. "Review Peer Response" option (links to peer review)

**TDD:**
```
- Test: Results show winner/loser status correctly
- Test: Both scores displayed
- Test: XP amount shown
- Test: Rematch button present
- Test: Opponent response expandable
```

---

### Task 45: Peer Review Module

**Depends:** T22

**Description:** Build peer review page where learners review anonymized scenario responses. Rate on 3 criteria (1-5 each). Award 5 XP per review.

**Files to create/modify:**
- `src/app/(dashboard)/review/page.tsx`
- `src/components/review/review-card.tsx` (anonymized attempt display)
- `src/components/review/review-rubric-form.tsx` (1-5 rating form)
- `src/actions/peer-review.ts` (getReviewableAttempt, submitPeerReview)

**AC:**
1. `getReviewableAttempt` returns a random attempt not by the current user, not already reviewed by them
2. Displays anonymized scenario text and student response (no name shown)
3. Rating form: Correctness (1-5), Reasoning (1-5), Risk Awareness (1-5), optional comment
4. `submitPeerReview` stores review in `peer_reviews` table
5. Awards 5 XP to reviewer after submission
6. One review per reviewer per attempt (unique constraint)
7. "No responses available for review" empty state

**TDD:**
```
- Test: getReviewableAttempt excludes own attempts
- Test: getReviewableAttempt excludes already-reviewed attempts
- Test: submitPeerReview creates peer_reviews row
- Test: submitPeerReview awards 5 XP to reviewer
- Test: Duplicate review rejected (unique constraint)
- Test: Review form renders 3 rating criteria
- Test: Review form validates all scores 1-5
```

---

## Phase 7 — UI Polish (Tasks 46–53)

### Task 46: Motion Page Transitions

**Depends:** T8

**Description:** Add smooth page transitions using Motion + React View Transitions API.

**Files to create/modify:**
- `src/components/providers/page-transition.tsx`
- `src/app/(dashboard)/layout.tsx` (wrap children with transition)

**AC:**
1. Page transitions animate on route change (fade + subtle slide)
2. Uses React 19 View Transitions API where supported
3. Fallback to Motion AnimatePresence where not
4. Transition duration ~200ms — fast enough to not feel sluggish
5. No layout shift during transition

**TDD:**
```
- Test: Transition wrapper renders children
- Test: No layout shift during transition (snapshot test)
```

---

### Task 47: Staggered List Animations

**Depends:** T29, T33

**Description:** Add staggered entrance animations to leaderboard rows, scenario list, and heatmap cells.

**Files to create/modify:**
- `src/components/game/leaderboard-table.tsx` (add stagger)
- `src/components/trading/scenario-card.tsx` (add stagger in lists)
- `src/components/mtss/tier-heatmap.tsx` (add stagger)

**AC:**
1. Leaderboard rows animate in with 0.05s stagger
2. Scenario cards animate in with 0.1s stagger
3. Heatmap cells animate in row-by-row
4. Animation: fade in + translate Y (20px → 0)
5. Animations only play on initial load, not on every re-render

**TDD:**
```
- Test: Leaderboard rows have motion variants defined
- Test: Stagger children variants configured
```

---

### Task 48: Scenario Attempt Flow Polish

**Depends:** T12

**Description:** Polish the scenario attempt multi-phase flow with smooth transitions, loading states, and micro-interactions.

**Files to create/modify:**
- `src/app/(dashboard)/learn/[levelId]/scenario/[scenarioId]/page.tsx`
- `src/components/trading/grading-result.tsx`

**AC:**
1. Phase transitions use AnimatePresence (exit old phase, enter new)
2. Score reveal: number counts up from 0 to final score (Motion useSpring)
3. Rubric criteria reveal one-by-one with stagger
4. Loading state during grading shows pulsing animation
5. Probing question appears with expand animation
6. XP popup appears after summary phase

**TDD:**
```
- Test: Phase transitions use AnimatePresence
- Test: Score animation starts at 0
- Test: Loading state shows during grading
```

---

### Task 49: Skeleton Loading States

**Depends:** T8

**Description:** Add skeleton loading states to all data-dependent components.

**Files to create/modify:**
- `src/app/(dashboard)/page.tsx` (loading.tsx)
- `src/app/(dashboard)/learn/page.tsx` (loading.tsx)
- `src/app/(dashboard)/leaderboard/page.tsx` (loading.tsx)
- `src/app/(educator)/page.tsx` (loading.tsx)
- Create `loading.tsx` files in each route segment

**AC:**
1. Every data-dependent page has a `loading.tsx` with skeleton UI
2. Skeletons match the shape of the actual content
3. Skeleton pulse animation using shadcn Skeleton component
4. No layout shift when real content loads (skeletons same dimensions)

**TDD:**
```
- Test: Loading component renders skeleton elements
- Test: Skeleton elements use shadcn Skeleton component
```

---

### Task 50: Responsive Design

**Depends:** T8

**Description:** Responsive design audit and fixes. Sidebar collapses on mobile, touch targets adequate, tables scroll horizontally.

**Files to create/modify:**
- `src/components/layout/app-sidebar.tsx` (mobile collapse/drawer)
- `src/components/game/leaderboard-table.tsx` (horizontal scroll)
- `src/components/mtss/tier-heatmap.tsx` (horizontal scroll)
- Various component tweaks

**AC:**
1. Sidebar collapses to hamburger menu on screens < 768px
2. All interactive elements have minimum 44x44px touch targets
3. Tables wrap in horizontal scroll container on mobile
4. Forms are usable on mobile (no overlapping elements)
5. Dashboard cards stack vertically on mobile
6. No horizontal overflow on any page at 320px width

**TDD:**
```
- Test: Sidebar hidden at mobile viewport (render test with mock viewport)
- Test: Hamburger menu visible at mobile viewport
- Test: Tables wrapped in scroll container
```

---

### Task 51: Dark Theme Refinement

**Depends:** T6

**Description:** Audit and refine dark theme: contrast ratios, focus indicators, hover states, consistent surface colors.

**Files to create/modify:**
- `src/app/globals.css` (adjust CSS variables)
- Various components (focus ring, hover states)

**AC:**
1. All text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large)
2. Focus rings visible on all interactive elements (2px solid primary)
3. Hover states on all clickable elements (subtle background change)
4. Card surfaces use consistent `hsl(222, 30%, 10%)` per architecture
5. No pure white text on dark background (use near-white per spec)
6. Green/red colors distinguishable for colorblind users (use shapes + labels too)

**TDD:**
```
- Test: CSS variables define all required theme colors
- Test: Focus ring class applied to interactive elements
```

---

### Task 52: Error Boundaries & Graceful Degradation

**Depends:** T22

**Description:** Add error boundaries to major sections. Graceful degradation when Python AI service is down (serve cached scenarios, show friendly error for grading).

**Files to create/modify:**
- `src/app/(dashboard)/error.tsx` (dashboard error boundary)
- `src/app/(educator)/error.tsx` (educator error boundary)
- `src/app/global-error.tsx` (root error boundary)
- `src/lib/ai/client.ts` (add circuit breaker / fallback logic)

**AC:**
1. Error boundaries catch rendering errors and show friendly message + retry button
2. When Python service unreachable, scenario page shows "Grading temporarily unavailable"
3. Cached scenarios served from DB even if generation service is down
4. Error boundaries log errors (console in dev, could be observability in prod)
5. No white screen of death — always show something useful

**TDD:**
```
- Test: Error boundary renders fallback UI on child error
- Test: Retry button re-renders children
- Test: AI client returns fallback when service unreachable
- Test: Global error boundary renders for root-level errors
```

---

### Task 53: Accessibility Pass

**Depends:** T50

**Description:** Comprehensive accessibility audit: keyboard navigation, screen reader labels, ARIA attributes, skip navigation, and semantic HTML.

**Files to create/modify:**
- Various components (add aria-label, role, tabIndex)
- `src/app/layout.tsx` (skip navigation link)

**AC:**
1. All pages navigable via keyboard only (Tab, Enter, Escape, Arrow keys)
2. Skip navigation link at top of page (visible on focus)
3. All images and icons have alt text or aria-label
4. Form inputs associated with labels
5. Modal focus trap (focus stays in modal when open)
6. Leaderboard table has proper `<thead>`, `<th>` with scope
7. Color is not the only indicator (heatmap uses labels + colors)
8. `aria-live` regions for dynamic content (XP popup, timer)

**TDD:**
```
- Test: Skip navigation link present and keyboard-accessible
- Test: All form inputs have associated labels
- Test: Dialog components trap focus
- Test: Timer has aria-live attribute
- Test: Heatmap cells have accessible labels
```

---

## Dependency Graph Summary

```
Phase 1 (Foundation):
  T1 ─┬─ T3 ── T4 ─┬─ T5 ─┬─ T7 ── T8
  T2 ─┘             │      │
                     │      └─ T8
                     └─ T9
  T1 ── T6 ─── T7

Phase 2 (Curriculum):
  T9 ── T10 ── T11 ── T12 ── T13
  T8 ── T10
  T8 ── T14

Phase 3 (Python AI):
  T2 ── T15 ─┬─ T16 ─┬─ T17 ── T21
             │       └─ T18 ── T19
             └─ T20
  T12, T18, T19 ── T22

Phase 4 (Gamification):
  T22 ── T23 ─┬─ T24 ─┬─ T26
              ├─ T25 ─┘
              ├─ T27
              ├─ T28
              └─ T29 ── T30

Phase 5 (MTSS):
  T22 ── T31 ─┬─ T33 ── T36
  T8 ── T32 ──┼─ T34
              └─ T35
  T33, T34, T35 ── T37

Phase 6 (Challenges):
  T1 ── T38 ── T39 ── T41 ── T42 ── T43 ── T44
  T38 ── T40 ── T41
  T22 ── T43
  T22 ── T45

Phase 7 (Polish):
  T8 ── T46, T49, T50
  T29, T33 ── T47
  T12 ── T48
  T6 ── T51
  T22 ── T52
  T50 ── T53
```

---

## Critical Path

The longest dependency chain that determines minimum completion time:

```
T1 → T3 → T4 → T5 → T7 → T8 → T10 → T11 → T12 → T22 → T23 → T29 → T30
```

**Parallelism opportunities:**
- T1 and T2 in parallel (no dependency)
- T15-T21 (Python service) in parallel with T9-T14 (curriculum/frontend)
- T31-T37 (MTSS) in parallel with T38-T45 (challenges) — both depend on T22
- T46-T53 (polish) partially parallelizable

---

## Implementation Notes

1. **TDD Cycle**: For each task, write tests first (Red), implement minimally to pass (Green), then refactor. Tests from earlier tasks form the regression suite.
2. **Database**: Tasks 3-4 create the full schema upfront. Later tasks add seed data but don't modify schema.
3. **Mock → Real**: Task 12 uses mock grading. Task 22 replaces with real AI grading. This allows frontend development without Python service dependency.
4. **Python service independence**: Tasks 15-21 can proceed independently of frontend tasks after T2 (docker-compose).
5. **Each task creates a working increment**: After any task, the app should build and tests should pass.
