# CapMan AI

A gamified, web-based options trading education platform with AI-powered scenario generation, adaptive grading, and Multi-Tiered System of Support (MTSS) for educators. Learners progress through a 10-level curriculum, tackle AI-generated trading scenarios, compete in real-time challenges, and earn XP — while educators monitor skill mastery and intervene where needed.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | Required for Next.js 16 |
| npm | 10+ | Comes with Node.js |
| Python | 3.12 | For the AI service |
| Docker & Docker Compose | Latest | For PostgreSQL + pgvector |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://capman:capman_local@localhost:5433/capman_dev` |
| `NEXTAUTH_SECRET` | Yes | Random 32+ char string for JWT signing | `capman-dev-secret-change-in-production` |
| `NEXTAUTH_URL` | Yes | Base URL for NextAuth callbacks | `http://localhost:3000` |
| `AI_SERVICE_URL` | Yes | Python AI service URL | `http://localhost:8000` |
| `INTERNAL_API_TOKEN` | Yes | Shared secret between Next.js and Python service | `capman-internal-dev-token` |
| `OPENAI_API_KEY` | For AI features | OpenAI API key for scenario generation and grading | `sk-...` |

The Python service reads its own configuration from environment or a `.env` file in `python-service/`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://capman:capman_local@localhost:5433/capman_dev` | Same database |
| `LLM_PROVIDER` | `openai` | LLM provider |
| `OPENAI_API_KEY` | `""` | OpenAI API key |
| `LLM_SCENARIO_MODEL` | `gpt-4o-mini` | Model for scenario generation |
| `LLM_GRADING_MODEL` | `gpt-4o` | Model for grading responses |
| `INTERNAL_API_TOKEN` | `capman-internal-dev-token` | Must match the Next.js value |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |

Docker Compose sets these for PostgreSQL automatically:

| Variable | Value | Description |
|----------|-------|-------------|
| `POSTGRES_DB` | `capman_dev` | Database name |
| `POSTGRES_USER` | `capman` | Database user |
| `POSTGRES_PASSWORD` | `capman_local` | Database password |

## Setup

### 1. Start the database

```bash
docker-compose up -d
```

This starts PostgreSQL 17 with pgvector on port **5433**.

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Set up environment

```bash
cp .env.example .env.local
# Edit .env.local with your values (defaults work for local dev)
```

### 4. Run database migrations and seed

```bash
npm run db:migrate
npm run db:seed
```

This creates all tables and seeds the 10-level curriculum with 12 skill objectives.

### 5. Set up the Python AI service

```bash
cd python-service
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## How to Run

Open three terminals:

```bash
# Terminal 1 — Database (if not already running)
docker-compose up

# Terminal 2 — Python AI service
cd python-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 3 — Next.js frontend
npm run dev
```

The app is available at **http://localhost:3000**.

To run with the custom Socket.IO server (for real-time challenges):

```bash
npm run dev:server
```

## How to Run Tests

### Frontend (Vitest)

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
```

45 test files, 161 tests covering auth, XP logic, game mechanics, components, and pages.

### Python (pytest)

```bash
cd python-service
source venv/bin/activate
pytest
```

20 tests covering health checks, scenario generation, grading, LLM service, and RAG.

### Type checking and linting

```bash
npx tsc --noEmit      # TypeScript type check
npm run lint           # ESLint
```

## API Documentation

### Next.js API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET, POST | `/api/auth/[...nextauth]` | No | NextAuth authentication (login, session, callbacks) |
| GET | `/api/leaderboard/stream` | No | Server-Sent Events stream — top 50 users by XP, updates every 5s |

### Python AI Service (port 8000)

All endpoints except health require the `X-Internal-Token` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check — returns service status, model info, DB connectivity |
| POST | `/api/scenarios/generate` | Token | Generate a single AI trading scenario with rubric |
| POST | `/api/scenarios/generate-batch` | Token | Batch-generate scenarios for a curriculum level |
| POST | `/api/grading/evaluate` | Token | Grade a student response against a rubric |
| POST | `/api/grading/evaluate-probing` | Token | Evaluate a probing question follow-up response |
| POST | `/api/rag/query` | Token | Query the vector database for relevant document chunks |
| POST | `/api/rag/ingest` | Token | Ingest and chunk a document for RAG (file upload) |

### Server Actions (Next.js RSC)

These are called internally via React Server Components, not as REST endpoints:

- **Auth**: register, login, password management
- **Scenarios**: start scenario, submit response, handle probing questions
- **Challenges**: create, join, submit response, grade
- **Gamification**: award XP, manage streaks, update levels
- **Educator**: MTSS overview, intervention tracking, analytics
- **Peer Review**: submit and retrieve peer evaluations

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│            Next.js 16 Frontend (React 19)        │
│  Pages: Auth, Dashboard, Learn, Compete,         │
│         Leaderboard, Profile, Educator (MTSS)    │
│  Server Actions for data mutations               │
│  Socket.IO client for real-time challenges       │
└──────────────┬──────────────────┬────────────────┘
               │ HTTP             │ WebSocket
               │                  │
┌──────────────▼──────────────────▼────────────────┐
│          Node.js Custom Server (server.ts)        │
│  Socket.IO namespaces: /challenges, /notifications│
│  Matchmaking queue with time-based relaxation     │
└──────────────┬───────────────────────────────────┘
               │ HTTP (X-Internal-Token)
┌──────────────▼───────────────────────────────────┐
│          Python FastAPI Service (:8000)           │
│  Scenario Generator (Jinja2 + LLM)              │
│  Grading Engine (rubric-based AI evaluation)     │
│  RAG Service (pgvector embeddings + search)      │
└──────────────┬───────────────────────────────────┘
               │ asyncpg
┌──────────────▼───────────────────────────────────┐
│     PostgreSQL 17 + pgvector                     │
│  14 tables: users, scenarios, attempts,          │
│  challenges, peer_reviews, mtss_classifications, │
│  xp_events, leaderboard_snapshots, etc.          │
│  Vector embeddings (1536-dim) for RAG            │
└──────────────────────────────────────────────────┘
```

**Key design decisions:**

- **Auth**: NextAuth v5 with credentials provider, JWT sessions, role-based access (learner, educator, admin)
- **Gamification**: XP system (base 10 + performance bonus), 10-level progression, daily streaks, leaderboard with SSE
- **MTSS**: Automated tier classification (1–4) per learner per skill objective, educator dashboards with heatmaps and intervention queues
- **AI**: Prompt templates via Jinja2, separate models for generation (gpt-4o-mini) and grading (gpt-4o), fallback mock grading when LLM unavailable
- **Real-time**: Socket.IO for head-to-head challenges with matchmaking
- **Database**: Drizzle ORM for type-safe queries, pgvector for RAG embeddings
