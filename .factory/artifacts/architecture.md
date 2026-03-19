# Architecture: CapMan AI — Gamified Scenario Training & MTSS Agent

---

## 1. System Overview

CapMan AI is a two-service architecture: a Next.js 16 frontend/API gateway and a Python FastAPI AI service, sharing a single PostgreSQL 17 database with pgvector.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Client                       │
│  Next.js 16 App (React 19, shadcn/ui, Motion, Socket.io)│
└──────────┬──────────────────┬───────────────────┬───────┘
           │ HTTP             │ WebSocket          │ SSE
           ▼                  ▼                    ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│ Next.js API      │  │ Socket.io    │  │ SSE Endpoint     │
│ Routes + Server  │  │ Server       │  │ (leaderboard     │
│ Actions          │  │ (custom      │  │  stream)         │
│                  │  │  server.ts)  │  │                  │
└────────┬─────────┘  └──────┬───────┘  └────────┬─────────┘
         │                   │                    │
         │  HTTP/JSON        │                    │
         ▼                   │                    │
┌──────────────────┐         │                    │
│ Python FastAPI   │         │                    │
│ AI Service       │         │                    │
│ (port 8000)      │         │                    │
│  • Scenarios     │         │                    │
│  • Grading       │         │                    │
│  • RAG           │         │                    │
└────────┬─────────┘         │                    │
         │                   │                    │
         ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL 17 + pgvector                     │
│  Drizzle ORM (schema owner)  |  asyncpg (Python reads)   │
└─────────────────────────────────────────────────────────┘
```

---

## Data Model

All tables use UUID primary keys, `created_at`/`updated_at` timestamps. Drizzle ORM in `src/lib/db/schema.ts` is the single source of truth for schema. Python service accesses via asyncpg (read/write) but never runs migrations.

### 2.1 Entity Relationship Diagram

```
users 1──∞ scenario_attempts ∞──1 scenarios
  │              │
  │              └──∞ attempt_objectives ∞──1 skill_objectives
  │
  ├──∞ xp_events
  ├──∞ mtss_classifications ∞──1 skill_objectives
  ├──∞ challenge_participants ∞──1 challenges
  ├──∞ peer_reviews
  └──∞ user_streaks

scenarios ∞──1 curriculum_levels
skill_objectives ∞──1 curriculum_levels
challenges 1──∞ challenge_participants

document_chunks (pgvector, standalone)
```

### 2.2 Table Definitions

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default random |
| email | text | NOT NULL, UNIQUE |
| name | text | NOT NULL |
| password_hash | text | NOT NULL |
| role | enum('learner','educator','admin') | NOT NULL, default 'learner' |
| xp | integer | NOT NULL, default 0 |
| level | integer | NOT NULL, default 1 |
| avatar_url | text | nullable |
| current_curriculum_level | integer | NOT NULL, default 1, FK→curriculum_levels |
| last_active_at | timestamp | nullable |
| created_at | timestamp | NOT NULL, default now() |
| updated_at | timestamp | NOT NULL, default now() |

#### `curriculum_levels`
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PK |
| level_number | integer | NOT NULL, UNIQUE (1-10) |
| name | text | NOT NULL (e.g. "Foundation", "Greeks Basics") |
| description | text | NOT NULL |
| prerequisite_level | integer | nullable, FK→curriculum_levels |
| mastery_threshold | integer | NOT NULL, default 80 (percent) |
| min_attempts_required | integer | NOT NULL, default 10 |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

#### `skill_objectives`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| code | text | NOT NULL, UNIQUE (e.g. "OBJ-001") |
| name | text | NOT NULL |
| description | text | NOT NULL |
| curriculum_level_id | integer | NOT NULL, FK→curriculum_levels |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

#### `scenarios`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| curriculum_level_id | integer | NOT NULL, FK→curriculum_levels |
| scenario_text | text | NOT NULL |
| market_data | jsonb | NOT NULL |
| question_prompt | text | NOT NULL |
| target_objectives | jsonb | NOT NULL (array of objective codes) |
| rubric | jsonb | NOT NULL (criteria with weights) |
| difficulty | integer | NOT NULL (1-10) |
| market_regime | text | NOT NULL |
| quality_score | real | nullable |
| is_active | boolean | NOT NULL, default true |
| generated_by | text | NOT NULL (model identifier) |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

Index: `(curriculum_level_id, is_active, quality_score)` for fast scenario serving.

#### `scenario_attempts`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | NOT NULL, FK→users |
| scenario_id | uuid | NOT NULL, FK→scenarios |
| response_text | text | NOT NULL |
| score | integer | nullable (0-100, null until graded) |
| ai_feedback | jsonb | nullable (full grading output) |
| probing_questions | jsonb | nullable |
| probing_response | text | nullable |
| probing_score | integer | nullable |
| final_score | integer | nullable (weighted combo) |
| time_spent_seconds | integer | nullable |
| challenge_id | uuid | nullable, FK→challenges |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

Index: `(user_id, created_at DESC)` for user history.

#### `attempt_objectives`
Junction table linking attempts to skill objectives with per-objective scores.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| attempt_id | uuid | NOT NULL, FK→scenario_attempts |
| objective_id | uuid | NOT NULL, FK→skill_objectives |
| score | integer | NOT NULL (0-100) |
| demonstrated | boolean | NOT NULL |
| created_at | timestamp | NOT NULL |

Index: `(objective_id, score)` for MTSS aggregation.

#### `xp_events`
Append-only log. Never updated or deleted.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | NOT NULL, FK→users |
| amount | integer | NOT NULL |
| reason | text | NOT NULL (e.g. "scenario_complete", "challenge_win", "peer_review") |
| reference_id | uuid | nullable (attempt_id, challenge_id, etc.) |
| created_at | timestamp | NOT NULL |

Index: `(user_id, created_at)` for weekly leaderboard aggregation.

#### `user_streaks`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | NOT NULL, UNIQUE, FK→users |
| current_streak | integer | NOT NULL, default 0 |
| longest_streak | integer | NOT NULL, default 0 |
| last_activity_date | date | nullable |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

#### `challenges`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| scenario_id | uuid | NOT NULL, FK→scenarios |
| status | enum('waiting','active','grading','complete','cancelled') | NOT NULL |
| time_limit_seconds | integer | NOT NULL, default 300 |
| started_at | timestamp | nullable |
| completed_at | timestamp | nullable |
| winner_id | uuid | nullable, FK→users |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

#### `challenge_participants`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| challenge_id | uuid | NOT NULL, FK→challenges |
| user_id | uuid | NOT NULL, FK→users |
| response_text | text | nullable |
| score | integer | nullable |
| submitted_at | timestamp | nullable |
| created_at | timestamp | NOT NULL |

UNIQUE constraint: `(challenge_id, user_id)`.

#### `peer_reviews`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| reviewer_id | uuid | NOT NULL, FK→users |
| attempt_id | uuid | NOT NULL, FK→scenario_attempts |
| correctness_score | integer | NOT NULL (1-5) |
| reasoning_score | integer | NOT NULL (1-5) |
| risk_awareness_score | integer | NOT NULL (1-5) |
| comment | text | nullable |
| created_at | timestamp | NOT NULL |

UNIQUE constraint: `(reviewer_id, attempt_id)`.

#### `mtss_classifications`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | NOT NULL, FK→users |
| objective_id | uuid | NOT NULL, FK→skill_objectives |
| tier | integer | NOT NULL (1, 2, or 3) |
| avg_score | real | NOT NULL |
| attempt_count | integer | NOT NULL |
| classified_at | timestamp | NOT NULL |
| created_at | timestamp | NOT NULL |

Index: `(user_id, objective_id, classified_at DESC)` for latest tier lookup.
Index: `(tier, classified_at)` for educator dashboard queries.

#### `leaderboard_snapshots`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | NOT NULL, FK→users |
| period_type | enum('weekly','monthly') | NOT NULL |
| period_start | date | NOT NULL |
| xp_earned | integer | NOT NULL |
| rank | integer | NOT NULL |
| created_at | timestamp | NOT NULL |

Index: `(period_type, period_start, rank)`.

#### `document_chunks` (pgvector)
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| document_name | text | NOT NULL |
| document_type | text | NOT NULL |
| chunk_index | integer | NOT NULL |
| content | text | NOT NULL |
| embedding | vector(1536) | NOT NULL |
| metadata | jsonb | nullable |
| created_at | timestamp | NOT NULL |

Index: `USING hnsw (embedding vector_cosine_ops)` for similarity search.

---

## API Contract

### 3.1 Next.js Server Actions (Frontend Mutations)

Server Actions handle all user-facing mutations. They validate auth, call DB or proxy to Python service, and revalidate cache.

```typescript
// src/actions/scenario.ts
"use server"

// Start a new scenario attempt
async function startScenario(levelId: number): Promise<{ scenario: Scenario }>
// Submit a response for grading (proxies to Python service)
async function submitResponse(attemptId: string, response: string): Promise<{ grading: GradingResult }>
// Submit probing question response
async function submitProbingResponse(attemptId: string, questionIndex: number, response: string): Promise<{ score: number; feedback: string }>

// src/actions/gamification.ts
"use server"

// Award XP (called internally after grading)
async function awardXp(userId: string, amount: number, reason: string, referenceId?: string): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }>
// Get leaderboard
async function getLeaderboard(type: 'alltime' | 'weekly', limit?: number): Promise<LeaderboardEntry[]>

// src/actions/challenge.ts
"use server"

// Request a head-to-head challenge
async function requestChallenge(curriculumLevelId: number): Promise<{ challengeId: string; status: 'waiting' | 'matched' }>
// Submit challenge response
async function submitChallengeResponse(challengeId: string, response: string): Promise<void>

// src/actions/auth.ts
"use server"

async function register(data: { email: string; password: string; name: string }): Promise<{ success: boolean }>
async function login(data: { email: string; password: string }): Promise<{ success: boolean }>
async function logout(): Promise<void>

// src/actions/peer-review.ts
"use server"

async function getReviewableAttempt(): Promise<{ attempt: AnonymizedAttempt } | null>
async function submitPeerReview(attemptId: string, scores: PeerReviewScores): Promise<void>

// src/actions/educator.ts (role-gated: educator/admin only)
"use server"

async function getMtssOverview(): Promise<MtssOverview>
async function getLearnerDetail(userId: string): Promise<LearnerDetail>
async function getInterventionQueue(): Promise<InterventionItem[]>
async function sendNudge(userId: string, message: string): Promise<void>
```

### 3.2 Next.js API Routes (Thin Proxies + SSE)

Minimal API routes — only used for SSE streams and webhook-style callbacks from the Python service.

```
GET  /api/leaderboard/stream     → SSE stream of leaderboard updates
GET  /api/notifications/stream   → SSE stream of user notifications (challenge invites, nudges)
POST /api/webhooks/grading       → Callback from Python service when async grading completes
```

### 3.3 Python FastAPI Endpoints

The Python AI service is internal-only (not exposed to browser). Next.js server actions call it via HTTP.

```
Base URL: http://localhost:8000 (dev) / http://ai-service.railway.internal:8000 (prod)

POST /api/scenarios/generate
  Request:
    {
      "curriculum_level": 3,
      "difficulty": 5,
      "market_regime": "bull_quiet",
      "target_objectives": ["OBJ-003", "OBJ-006"],
      "exclude_scenario_ids": ["uuid1", "uuid2"]  // avoid repeats
    }
  Response:
    {
      "scenario_id": "uuid",
      "scenario_text": "...",
      "market_data": { "underlying": "SPY", "underlying_price": 500, ... },
      "question_prompt": "...",
      "target_objectives": ["OBJ-003", "OBJ-006"],
      "rubric": { "criteria": [...] }
    }

POST /api/scenarios/generate-batch
  Request:
    {
      "curriculum_level": 3,
      "count": 50,
      "market_regimes": ["bull_quiet", "bear_volatile", "sideways"]
    }
  Response:
    { "generated": 50, "passed_quality": 43, "failed_quality": 7 }

POST /api/grading/evaluate
  Request:
    {
      "scenario_id": "uuid",
      "scenario_text": "...",
      "rubric": { "criteria": [...] },
      "student_response": "...",
      "rag_context": "..."  // optional, pre-fetched
    }
  Response:
    {
      "criteria_evaluation": [
        {
          "criterion": "Correctly identifies market regime",
          "weight": 0.2,
          "score": 18,
          "max_score": 20,
          "evidence": "Student wrote: 'The low VIX and uptrend suggest a bull quiet regime'",
          "feedback": "Correct identification..."
        }
      ],
      "total_score": 82,
      "skill_objectives_demonstrated": ["OBJ-003"],
      "skill_objectives_failed": ["OBJ-006"],
      "feedback_summary": "Strong regime analysis but missed...",
      "probing_questions": [
        "Why did you choose a 30-delta strike rather than ATM?",
        "How would your strategy change if IV doubled?"
      ]
    }

POST /api/grading/evaluate-probing
  Request:
    {
      "original_scenario": "...",
      "original_response": "...",
      "probing_question": "...",
      "probing_response": "..."
    }
  Response:
    {
      "score": 75,
      "feedback": "..."
    }

POST /api/rag/query
  Request:
    {
      "query": "CapMan approach to iron condor adjustments",
      "k": 5,
      "filter_document_type": "playbook"
    }
  Response:
    {
      "chunks": [
        { "content": "...", "document_name": "...", "relevance_score": 0.92 }
      ]
    }

POST /api/rag/ingest
  Request: multipart/form-data with file upload
  Response:
    { "document_name": "...", "chunks_created": 45 }

GET /api/health
  Response: { "status": "ok", "model": "gpt-4o-mini", "db": "connected" }
```

### 3.4 WebSocket Events (Socket.io)

```
Namespace: /challenges

Client → Server:
  "challenge:request"    { curriculumLevelId: number }
  "challenge:join"       { challengeId: string }
  "challenge:submit"     { challengeId: string, response: string }
  "challenge:cancel"     { challengeId: string }

Server → Client:
  "challenge:matched"    { challengeId: string, opponent: { name: string, level: number } }
  "challenge:countdown"  { challengeId: string, scenario: Scenario, startsIn: number }
  "challenge:start"      { challengeId: string }
  "challenge:opponent_submitted"  { challengeId: string }
  "challenge:results"    { challengeId: string, yourScore: number, opponentScore: number, winner: string, xpAwarded: number }
  "challenge:timeout"    { challengeId: string }

Namespace: /notifications
Server → Client:
  "notification:challenge_invite"  { challengeId: string, from: string }
  "notification:nudge"             { message: string, from: string }
  "notification:level_up"          { newLevel: number, badgeName: string }
  "leaderboard:update"             { entries: LeaderboardEntry[] }
```

---

## 4. Frontend Architecture

### 4.1 Route Structure (Next.js 16 App Router)

```
src/app/
├── layout.tsx                    # Root: providers (auth, theme, socket), global styles
├── page.tsx                      # Landing page (redirect to /dashboard if authed)
├── globals.css                   # Tailwind + shadcn CSS variables (dark-first)
│
├── (auth)/                       # Unauthenticated route group
│   ├── layout.tsx                # Centered card layout
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (dashboard)/                  # Authenticated learner routes
│   ├── layout.tsx                # Sidebar nav + top bar (XP, level, streak)
│   ├── page.tsx                  # Dashboard home: progress overview, daily challenge CTA
│   ├── learn/
│   │   ├── page.tsx              # Curriculum map (levels 1-10, locked/unlocked)
│   │   └── [levelId]/
│   │       ├── page.tsx          # Level detail: objectives, scenario list
│   │       └── scenario/
│   │           └── [scenarioId]/
│   │               └── page.tsx  # Scenario attempt: read → respond → grading → feedback
│   ├── compete/
│   │   ├── page.tsx              # Challenge lobby: request match, active challenges
│   │   └── [challengeId]/
│   │       └── page.tsx          # Live challenge room
│   ├── review/
│   │   └── page.tsx              # Peer review queue
│   ├── leaderboard/
│   │   └── page.tsx              # Global/weekly/skill leaderboards
│   └── profile/
│       └── page.tsx              # User profile, stats, streak history
│
├── (educator)/                   # Educator role route group
│   ├── layout.tsx                # Educator nav shell
│   ├── page.tsx                  # MTSS overview dashboard
│   ├── students/
│   │   └── [userId]/
│   │       └── page.tsx          # Individual learner drill-down
│   ├── interventions/
│   │   └── page.tsx              # Tier 3 intervention queue
│   └── analytics/
│       └── page.tsx              # Scenario performance, engagement metrics
│
└── api/
    ├── leaderboard/
    │   └── stream/route.ts       # SSE leaderboard
    └── notifications/
        └── stream/route.ts       # SSE notifications
```

### 4.2 Component Hierarchy

```
src/components/
├── ui/                           # shadcn/ui (installed via CLI)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── progress.tsx
│   ├── table.tsx
│   ├── dialog.tsx
│   ├── tabs.tsx
│   ├── chart.tsx
│   ├── toast.tsx (sonner)
│   ├── sidebar.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── select.tsx
│   ├── avatar.tsx
│   ├── skeleton.tsx
│   ├── separator.tsx
│   ├── scroll-area.tsx
│   ├── tooltip.tsx
│   └── dropdown-menu.tsx
│
├── layout/
│   ├── app-sidebar.tsx           # Main sidebar navigation
│   ├── top-bar.tsx               # XP bar, level badge, streak counter, user menu
│   └── page-header.tsx           # Reusable page title + breadcrumbs
│
├── trading/                      # Scenario & trading components
│   ├── scenario-card.tsx         # Scenario preview card (level, regime, objectives)
│   ├── scenario-reader.tsx       # Full scenario text + market data display
│   ├── response-editor.tsx       # Textarea with formatting for scenario response
│   ├── grading-result.tsx        # Score breakdown, rubric evaluation, feedback
│   ├── probing-question.tsx      # Follow-up question prompt + response area
│   ├── market-data-panel.tsx     # Structured display of scenario market data
│   ├── payoff-diagram.tsx        # P&L chart for strategy visualization
│   └── greeks-display.tsx        # Greek values visualization
│
├── game/                         # Gamification components
│   ├── xp-bar.tsx                # Animated XP progress bar (Motion)
│   ├── level-badge.tsx           # Current level badge with name
│   ├── level-up-modal.tsx        # Level up celebration animation (Motion)
│   ├── streak-counter.tsx        # Daily streak display with fire icon
│   ├── xp-popup.tsx              # "+50 XP!" floating animation on award
│   ├── leaderboard-table.tsx     # Ranked list with Motion layout animations
│   ├── leaderboard-tabs.tsx      # Tab switcher: All-time / Weekly / Skill
│   └── curriculum-map.tsx        # Visual level progression (locked/unlocked/mastered)
│
├── challenge/                    # Head-to-head challenge components
│   ├── challenge-lobby.tsx       # Matchmaking UI, waiting state
│   ├── challenge-room.tsx        # Live challenge: timer, scenario, response
│   ├── challenge-timer.tsx       # Countdown timer with urgency animation
│   ├── challenge-results.tsx     # Side-by-side results comparison
│   └── matchmaking-spinner.tsx   # Animated matchmaking waiting state
│
├── review/                       # Peer review components
│   ├── review-card.tsx           # Anonymized attempt to review
│   ├── review-rubric-form.tsx    # 1-5 rating form for each criterion
│   └── review-history.tsx        # Past reviews given/received
│
└── mtss/                         # Educator dashboard components
    ├── tier-heatmap.tsx           # Learner × Objective heatmap (Chart)
    ├── tier-distribution.tsx      # Bar chart of T1/T2/T3 counts
    ├── intervention-queue.tsx     # Priority list of Tier 3 learners
    ├── learner-detail-card.tsx    # Individual skill objective history
    ├── engagement-panel.tsx       # DAU/WAU, sessions/week metrics
    ├── cohort-progress-chart.tsx  # Line chart of mastery over time
    └── scenario-analytics.tsx     # Pass/fail rates per scenario
```

### 4.3 Key Page Compositions

#### Dashboard Home (`(dashboard)/page.tsx`) — Server Component
```
┌─────────────────────────────────────────────────┐
│ [TopBar: XP Bar | Level Badge | Streak | User]  │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │  Welcome back, {name}!               │
│          │                                      │
│ □ Home   │  ┌─ Daily Challenge ──────────────┐  │
│ □ Learn  │  │ "Complete today's scenario to   │  │
│ □ Compete│  │  keep your streak alive!"       │  │
│ □ Review │  │  [Start Challenge →]            │  │
│ □ Board  │  └────────────────────────────────┘  │
│ □ Profile│                                      │
│          │  ┌─ Your Progress ────────────────┐  │
│          │  │ Level 3: Greeks Basics          │  │
│          │  │ ████████░░ 72% mastery          │  │
│          │  │ Next: Level 4 (Vertical Spreads)│  │
│          │  └────────────────────────────────┘  │
│          │                                      │
│          │  ┌─ Leaderboard (Top 5) ──────────┐  │
│          │  │ 1. Alice      2,340 XP          │  │
│          │  │ 2. Bob        1,890 XP          │  │
│          │  │ ...                             │  │
│          │  └────────────────────────────────┘  │
└──────────┴──────────────────────────────────────┘
```

#### Scenario Attempt Page (`learn/[levelId]/scenario/[scenarioId]/page.tsx`) — Client Component
```
Phase 1 (Read):     Scenario text + market data → "Submit Your Analysis" button
Phase 2 (Respond):  Textarea editor → Submit → Loading animation
Phase 3 (Grading):  Score reveal animation → Rubric breakdown → Feedback
Phase 4 (Probing):  Follow-up question → Response → Secondary score
Phase 5 (Summary):  Final score + XP awarded popup + "Next Scenario" / "Back to Level"
```

#### Challenge Room (`compete/[challengeId]/page.tsx`) — Client Component
```
┌───────────────────────────────────────────┐
│        ⏱ 4:32 remaining                  │
├───────────────┬───────────────────────────┤
│ Your Response │ Opponent: ████████ (L5)   │
│               │ Status: Writing...         │
│ [Scenario     │                           │
│  Text &       │                           │
│  Market Data] │                           │
│               │                           │
│ [Textarea]    │                           │
│               │                           │
│ [Submit]      │                           │
└───────────────┴───────────────────────────┘

→ After both submit or timer expires:
┌───────────────────────────────────────────┐
│         Results                           │
│  You: 85/100    vs    Opponent: 72/100    │
│  🏆 You Win! +50 XP                      │
│                                           │
│  [View Opponent's Response]               │
│  [Review Peer Response]  [Rematch]        │
└───────────────────────────────────────────┘
```

#### Educator MTSS Dashboard (`(educator)/page.tsx`) — Server Component
```
┌─────────────────────────────────────────────────┐
│ MTSS Overview                                    │
├─────────────────────────────────────────────────┤
│ ┌─ Tier Distribution ─┐  ┌─ Engagement ────────┐│
│ │ T1: ████████ 82%    │  │ DAU: 34 / WAU: 45  ││
│ │ T2: ████ 13%        │  │ Avg sessions: 4.2/wk││
│ │ T3: ██ 5%           │  │ Challenge rate: 67% ││
│ └─────────────────────┘  └─────────────────────┘│
│                                                  │
│ ┌─ Cohort Heatmap (Learner × Skill Objective) ─┐│
│ │         OBJ-1 OBJ-2 OBJ-3 OBJ-4 OBJ-5 ...  ││
│ │ Alice   🟢    🟢    🟡    🟢    🟢          ││
│ │ Bob     🟢    🔴    🟡    🟢    🟡          ││
│ │ Carol   🟡    🟢    🟢    🟢    🟢          ││
│ │ ...                                          ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ ┌─ Intervention Queue (Tier 3) ────────────────┐│
│ │ ⚠ Dave — OBJ-002 (avg 38%) — 6 days idle    ││
│ │ ⚠ Eve  — OBJ-005 (avg 44%) — 3 days idle    ││
│ │ [Send Nudge] [View Detail]                    ││
│ └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### 4.4 State Management

- **Server State**: All data fetching via Server Components and Server Actions. No client-side fetch/useEffect patterns.
- **Client State**: Minimal — only for interactive UI state (textarea content, timer, modal open/close).
- **Real-time State**: Socket.io client context provider wraps `(dashboard)` layout. Challenge room state managed via socket events + `useReducer`.
- **Optimistic Updates**: XP awards use optimistic updates via Server Actions for instant UI feedback.

### 4.5 Theme

Dark-first trading platform aesthetic:
- Background: `hsl(222, 47%, 6%)` — near-black with blue tint
- Card surfaces: `hsl(222, 30%, 10%)`
- Primary accent: `hsl(142, 71%, 45%)` — green (profit/success)
- Destructive: `hsl(0, 72%, 51%)` — red (loss/danger)
- Warning: `hsl(48, 96%, 53%)` — amber (Tier 2 / caution)
- Text: `hsl(210, 40%, 96%)` — near-white

---

## 5. Python AI Service Architecture

### 5.1 Directory Structure

```
python-service/
├── main.py                    # FastAPI app, CORS, lifespan
├── config.py                  # Settings via pydantic-settings
├── routers/
│   ├── scenarios.py           # /api/scenarios/* endpoints
│   ├── grading.py             # /api/grading/* endpoints
│   └── rag.py                 # /api/rag/* endpoints
├── services/
│   ├── llm_service.py         # Provider-agnostic LLM client
│   ├── scenario_generator.py  # Scenario generation logic
│   ├── grading_engine.py      # Rubric-based grading logic
│   ├── rag_service.py         # RAG retrieval + ingestion
│   └── atlas_client.py        # Atlas integration abstraction (stub)
├── models/
│   └── schemas.py             # Pydantic v2 request/response models
├── prompts/
│   ├── scenario_generation.j2 # Jinja2 template for scenario prompts
│   ├── grading.j2             # Jinja2 template for grading prompts
│   └── probing.j2             # Jinja2 template for probing questions
├── requirements.txt
└── Dockerfile
```

### 5.2 LLM Abstraction

```python
# services/llm_service.py
class LLMService:
    """Provider-agnostic LLM client. Swap providers without changing callers."""

    async def generate(self, system_prompt: str, user_prompt: str,
                       model: str = "default", temperature: float = 0.7,
                       response_format: type | None = None) -> str: ...

    async def generate_json(self, system_prompt: str, user_prompt: str,
                            schema: type[BaseModel], model: str = "default") -> dict: ...
```

Models configured via environment: `LLM_PROVIDER=openai`, `LLM_SCENARIO_MODEL=gpt-4o-mini`, `LLM_GRADING_MODEL=gpt-4o`.

### 5.3 Scenario Pre-Generation Strategy

A background task (triggered via cron endpoint or Railway cron job) pre-generates scenarios nightly:

1. For each curriculum level (1-10), generate 20 scenarios across varied market regimes.
2. Each generated scenario is self-critiqued by the LLM for coherence and quality.
3. Scenarios with `quality_score >= 0.7` are stored as `is_active = true`.
4. User-facing scenario serving reads from DB — no LLM call at request time.
5. When pre-generated pool drops below 20 active scenarios per level, trigger replenishment.

---

## 6. Authentication & Authorization

### 6.1 Auth Strategy

Use Auth.js v5 with credentials provider (email/password) and database sessions via Drizzle adapter.

```typescript
// src/lib/auth/config.ts
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => { /* bcrypt verify */ }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.role = user.role; token.id = user.id; }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    }
  }
};
```

### 6.2 Route Protection

- `src/app/proxy.ts` (Next.js 16's replacement for middleware) checks JWT on every request:
  - `/educator/*` routes: require `role === 'educator' || role === 'admin'`
  - `/(dashboard)/*` routes: require authenticated session
  - `/(auth)/*` routes: redirect to dashboard if already authenticated
- Python service validates requests via an `x-internal-token` header set by Next.js server actions (shared secret, not user JWT).

---

## 7. Gamification Engine

### 7.1 XP Calculation Flow

```
User completes scenario attempt
  → Server Action: submitResponse()
    → Call Python grading service
    → Receive score
    → Calculate XP:
        base = 10
        if score >= 90: bonus = 25
        elif score >= 80: bonus = 10
        else: bonus = 0
    → Insert xp_event
    → Update users.xp (atomic increment)
    → Check level threshold:
        if users.xp >= LEVEL_THRESHOLDS[users.level + 1]:
          → Increment users.level
          → Return { leveledUp: true, newLevel, badgeName }
    → Update streak:
        if last_activity_date === today: skip
        elif last_activity_date === yesterday: current_streak++
        else: current_streak = 1
    → Return XP result to client
    → Client shows XP popup animation + optional level-up modal
```

### 7.2 Level Thresholds (Constant)

```typescript
// src/lib/game/levels.ts
export const LEVEL_THRESHOLDS = {
  1: 0,       // Recruit
  2: 100,     // Analyst I
  3: 300,     // Analyst II
  4: 600,     // Trader I
  5: 1000,    // Trader II
  6: 1500,    // Senior Trader
  7: 2500,    // Strategist I
  8: 4000,    // Strategist II
  9: 6000,    // Risk Manager
  10: 10000,  // CapMan Pro
} as const;
```

### 7.3 Leaderboard Computation

- **All-time**: `SELECT id, name, xp, level FROM users ORDER BY xp DESC LIMIT 50`
- **Weekly**: `SELECT user_id, SUM(amount) as weekly_xp FROM xp_events WHERE created_at >= {monday_00_utc} GROUP BY user_id ORDER BY weekly_xp DESC LIMIT 50`
- **Skill-level**: Filter by `current_curriculum_level`, same queries

Leaderboard SSE stream polls DB every 5 seconds and pushes to connected clients.

---

## 8. MTSS Classification Engine

### 8.1 Classification Algorithm

Runs after every `scenario_attempt` insert:

```python
async def classify_mtss(user_id: str, objective_id: str) -> int:
    # Last 10 attempts for this user+objective
    attempts = await db.fetch("""
        SELECT ao.score FROM attempt_objectives ao
        JOIN scenario_attempts sa ON sa.id = ao.attempt_id
        WHERE sa.user_id = $1 AND ao.objective_id = $2
        ORDER BY sa.created_at DESC LIMIT 10
    """, user_id, objective_id)

    if len(attempts) < 3:
        return 1  # Insufficient data

    avg_score = mean([a['score'] for a in attempts])
    days_inactive = (now() - user.last_active_at).days

    if avg_score < 50 or days_inactive >= 5:
        return 3  # Intensive
    elif avg_score < 70 or days_inactive >= 3:
        return 2  # Targeted
    else:
        return 1  # Universal
```

### 8.2 Classification Storage

After computing tier, upsert into `mtss_classifications`:
- One row per (user_id, objective_id) representing the latest classification.
- `classified_at` timestamp tracks when tier was last computed.
- Historical tracking: insert new row each time tier changes (keeping the old row).

### 8.3 Educator Dashboard Queries

- **Heatmap**: `SELECT u.name, so.code, mc.tier FROM mtss_classifications mc JOIN users u ... JOIN skill_objectives so ... WHERE mc.classified_at = (SELECT MAX(...) for each user+objective)`
- **Intervention Queue**: `SELECT * FROM mtss_classifications WHERE tier = 3 ORDER BY classified_at DESC`
- **Tier Distribution**: `SELECT tier, COUNT(DISTINCT user_id) FROM mtss_classifications WHERE ... GROUP BY tier`

---

## 9. Matchmaking & Challenge Flow

### 9.1 Matchmaking State Machine

```
IDLE → SEARCHING → MATCHED → COUNTDOWN → ACTIVE → GRADING → COMPLETE
                                                        ↑
                                                   TIMEOUT (auto-submit)
```

### 9.2 Implementation

- Matchmaking queue stored in-memory on the Socket.io server (Map of `curriculumLevel → waiting socket`).
- When two compatible players are in queue: create `challenges` row, assign both to a Socket.io room, emit `challenge:matched`.
- 5-second countdown → emit `challenge:start` with scenario.
- Timer tracked server-side. At 5:00, force-submit any pending responses.
- Both responses submitted → call Python grading for both → emit `challenge:results`.
- XP awarded: winner 50, loser 10.

### 9.3 Matchmaking Criteria

```typescript
function isCompatible(a: QueueEntry, b: QueueEntry): boolean {
  return a.curriculumLevel === b.curriculumLevel
    && Math.abs(a.xp - b.xp) <= 400;
}
```

After 30s wait, relax XP range to ±800. After 60s, match any same-level player.

---

## 10. Seed Data

### 10.1 Curriculum Levels

Pre-seed 10 curriculum levels matching the research curriculum:

| # | Name | Key Concepts |
|---|------|-------------|
| 1 | Foundation | Calls, puts, strike, expiration, premium, moneyness |
| 2 | Greeks Basics | Delta, theta, vega intuition |
| 3 | Single-Leg Strategies | Long/short calls/puts, covered call, cash-secured put |
| 4 | Vertical Spreads | Bull/bear call/put spreads, max P/L, breakeven |
| 5 | Market Regime Analysis | Trend ID, IV analysis, regime-strategy matching |
| 6 | Volatility Strategies | Straddles, strangles, calendars |
| 7 | Complex Strategies | Iron condors, butterflies, ratio spreads |
| 8 | Risk Management | Position sizing, portfolio Greeks, rolling |
| 9 | Advanced Greeks | Vanna, charm, volga |
| 10 | Professional Synthesis | Multi-regime portfolios, full trade plans |

### 10.2 Skill Objectives

Pre-seed 12 skill objectives as defined in the research:

```
OBJ-001: Identify option moneyness (ITM/ATM/OTM)           → Level 1
OBJ-002: Calculate intrinsic and extrinsic value            → Level 1
OBJ-003: Interpret delta for directional risk               → Level 2
OBJ-004: Interpret theta for time decay impact              → Level 2
OBJ-005: Interpret vega for volatility sensitivity          → Level 2
OBJ-006: Identify correct strategy for market regime        → Level 5
OBJ-007: Calculate max profit/loss for vertical spreads     → Level 4
OBJ-008: Calculate breakeven for a given strategy           → Level 4
OBJ-009: Articulate risk management rationale               → Level 8
OBJ-010: Construct multi-leg trade thesis                   → Level 7
OBJ-011: Identify adjustment triggers                       → Level 8
OBJ-012: Evaluate portfolio-level Greek exposure            → Level 9
```

---

## 11. Infrastructure

### 11.1 Docker Compose (Local Development)

```yaml
services:
  db:
    image: pgvector/pgvector:pg17
    environment:
      POSTGRES_DB: capman_dev
      POSTGRES_USER: capman
      POSTGRES_PASSWORD: capman_local
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U capman"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Note: Use `pgvector/pgvector:pg17` image which has pgvector pre-installed, not plain `postgres:17`.

### 11.2 Railway Services

| Service | Build | Port | Health Check |
|---------|-------|------|-------------|
| Next.js (custom server.ts) | Nixpacks | 3000 | GET / |
| Python FastAPI | Dockerfile | 8000 | GET /api/health |
| PostgreSQL + pgvector | Railway plugin | 5432 | auto |

### 11.3 Environment Variables

```
# Shared
DATABASE_URL=postgresql://capman:capman_local@localhost:5432/capman_dev

# Next.js
NEXTAUTH_SECRET=<random-32-chars>
NEXTAUTH_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:8000
INTERNAL_API_TOKEN=<shared-secret>

# Python
LLM_PROVIDER=openai
OPENAI_API_KEY=<key>
LLM_SCENARIO_MODEL=gpt-4o-mini
LLM_GRADING_MODEL=gpt-4o
```

---

## 12. Phased Implementation Plan

### Phase 1 — Foundation (Tasks 1-8)
Project scaffolding, database schema, auth, and basic navigation shell.

1. Initialize Next.js 16 project with TypeScript, Tailwind, shadcn/ui
2. Set up docker-compose with pgvector PostgreSQL
3. Define complete Drizzle schema (`src/lib/db/schema.ts`)
4. Generate and apply initial migration
5. Implement Auth.js with credentials provider + Drizzle adapter
6. Create root layout with theme provider (dark default)
7. Build `(auth)` route group: login + register pages
8. Build `(dashboard)` layout shell: sidebar, top bar, navigation

### Phase 2 — Curriculum & Static Scenarios (Tasks 9-14)
Curriculum navigation and scenario display (no AI yet).

9. Seed curriculum levels and skill objectives
10. Build curriculum map page (`/learn`) with level cards showing locked/unlocked state
11. Build level detail page (`/learn/[levelId]`) listing scenarios
12. Build scenario attempt page with read → respond flow (mock grading for now)
13. Create scenario card and market data panel components
14. Build profile page with basic stats

### Phase 3 — Python AI Service (Tasks 15-22)
Full AI backend: scenario generation, grading, RAG.

15. Scaffold Python FastAPI project with Pydantic models and routers
16. Implement LLM service abstraction (OpenAI + Anthropic providers)
17. Build scenario generation engine with Jinja2 prompt templates
18. Build grading engine with rubric-based evaluation
19. Build probing question generation
20. Implement RAG service with pgvector (document ingestion + retrieval)
21. Add scenario batch pre-generation endpoint
22. Wire Next.js server actions to Python service (replace mock grading)

### Phase 4 — Gamification (Tasks 23-30)
XP, levels, streaks, leaderboards.

23. Implement XP award logic in server actions
24. Build XP bar component with Motion fill animation
25. Build level badge component
26. Build level-up modal with celebration animation
27. Build streak counter with daily tracking logic
28. Build XP popup animation ("+50 XP!" on award)
29. Build leaderboard page with all-time/weekly/skill tabs
30. Implement leaderboard SSE stream for real-time updates

### Phase 5 — MTSS Dashboard (Tasks 31-37)
Educator "God View" with tier tracking.

31. Implement MTSS classification algorithm (runs after each grading)
32. Build educator layout and route protection
33. Build tier heatmap component (learner × objective grid)
34. Build tier distribution chart
35. Build intervention queue (Tier 3 learners)
36. Build individual learner drill-down page
37. Build engagement metrics panel (DAU/WAU, sessions, challenge rate)

### Phase 6 — Real-Time Challenges (Tasks 38-45)
WebSocket server, matchmaking, head-to-head.

38. Set up custom `server.ts` with Socket.io
39. Implement Socket.io client provider in dashboard layout
40. Build matchmaking queue logic (server-side)
41. Build challenge lobby page (request match, waiting animation)
42. Build challenge room page (timer, scenario, dual response)
43. Implement challenge grading flow (grade both, determine winner)
44. Build challenge results page with comparison view
45. Implement peer review module (queue + rubric form + XP award)

### Phase 7 — UI Polish (Tasks 46-53)
Animations, transitions, responsive design, accessibility.

46. Add Motion page transitions (View Transitions API integration)
47. Add staggered list animations to leaderboard, scenario list, heatmap
48. Polish scenario attempt flow: smooth phase transitions, loading states
49. Add skeleton loading states to all data-dependent components
50. Responsive design audit: mobile-friendly sidebar collapse, touch targets
51. Dark theme refinement: contrast ratios, focus indicators, hover states
52. Error boundaries and graceful degradation (AI service down → cached scenarios)
53. Accessibility pass: keyboard navigation, screen reader labels, ARIA attributes
