# QA Manual Testing Checklist

## Prerequisites

- App running locally (Next.js on :3000, Python service on :8000, PostgreSQL on :5433)
- Database migrated and seeded (`npm run db:migrate && npm run db:seed`)
- An OpenAI API key configured (for AI-powered features; mock grading works without one)

---

## 1. Health & Infrastructure

- [ ] **Database**: `docker-compose up` starts PostgreSQL without errors
- [ ] **Migrations**: `npm run db:migrate` completes without errors
- [ ] **Seed**: `npm run db:seed` populates 10 curriculum levels and 12 skill objectives (idempotent — safe to run twice)
- [ ] **Python service**: `uvicorn main:app --port 8000` starts; `GET http://localhost:8000/api/health` returns `{"status": "ok", "db": "connected"}`
- [ ] **Next.js**: `npm run dev` starts; http://localhost:3000 loads without errors
- [ ] **Build**: `npm run build` succeeds with exit code 0

## 2. Authentication

- [ ] **Register**: Navigate to `/register`, create a new account with name, email, and password. Expected: redirected to dashboard.
- [ ] **Login**: Navigate to `/login`, sign in with the registered account. Expected: redirected to dashboard.
- [ ] **Invalid login**: Submit wrong password. Expected: error message displayed.
- [ ] **Protected routes**: Access `/learn` without logging in. Expected: redirected to `/login`.
- [ ] **Educator routes**: Access `/educator` as a learner. Expected: access denied or redirected.

## 3. Dashboard & Navigation

- [ ] **Dashboard**: After login, the main dashboard loads with sidebar navigation.
- [ ] **Sidebar links**: Learn, Compete, Leaderboard, Profile links all navigate to their respective pages.
- [ ] **Page transitions**: Navigation between pages shows smooth Motion animations.

## 4. Learning Path

- [ ] **Curriculum list**: `/learn` displays all 10 curriculum levels with names and descriptions.
- [ ] **Level detail**: Click a level to view its skill objectives and available scenarios.
- [ ] **Scenario attempt**: Start a scenario — the scenario text, market data, and question prompt display correctly.
- [ ] **Submit response**: Write a response and submit. Expected: AI grades the response (or mock grading if no API key), showing score, feedback, and probing questions.
- [ ] **Probing question**: Answer a probing question. Expected: follow-up evaluation returned.
- [ ] **XP award**: After completing a scenario, XP is awarded. Check that the XP bar updates.

## 5. Gamification

- [ ] **XP bar**: Visible in the UI, shows current XP and level progress.
- [ ] **Level up**: After earning enough XP, a level-up modal appears.
- [ ] **Streak counter**: Displays current streak (days of consecutive activity).
- [ ] **Leaderboard**: `/leaderboard` shows top users ranked by XP. Data updates via SSE (check Network tab for `event-stream`).

## 6. Challenges (Real-Time)

- [ ] **Challenge page**: `/compete` loads the challenge interface.
- [ ] **Create challenge**: Start a new challenge. Expected: enters lobby/waiting state.
- [ ] **Socket connection**: Check browser console — Socket.IO connects to the server.
- [ ] **Note**: Full matchmaking and head-to-head flow requires two concurrent users. Socket.IO handlers are stubs (see Known Limitations).

## 7. Educator Dashboard (requires educator role)

- [ ] **MTSS overview**: `/educator` shows tier distribution chart and heatmap.
- [ ] **Student list**: `/educator/students` lists learners with their current tier and skill status.
- [ ] **Student detail**: Click a student to see per-objective performance breakdown.
- [ ] **Intervention queue**: `/educator/interventions` shows at-risk students.
- [ ] **Analytics**: `/educator/analytics` displays engagement metrics.
- [ ] **Role protection**: All educator server actions reject requests from non-educator users.

## 8. Python AI Service

- [ ] **Health**: `GET /api/health` returns status, model name, and DB status.
- [ ] **Auth**: Requests without `X-Internal-Token` header return 401/403.
- [ ] **Generate scenario**: `POST /api/scenarios/generate` with valid token returns a scenario with rubric.
- [ ] **Batch generate**: `POST /api/scenarios/generate-batch` generates multiple scenarios.
- [ ] **Grade response**: `POST /api/grading/evaluate` returns scored criteria, feedback, and probing questions.
- [ ] **RAG query**: `POST /api/rag/query` returns relevant document chunks (requires ingested documents).
- [ ] **RAG ingest**: `POST /api/rag/ingest` accepts a text file and creates vector embeddings.

## 9. Accessibility & UI

- [ ] **Dark theme**: Default dark theme renders correctly with proper contrast.
- [ ] **Skip navigation**: Tab into the page — a skip-to-content link appears.
- [ ] **Focus styles**: All interactive elements show visible focus indicators.
- [ ] **Loading states**: Pages display skeleton loaders while data loads.
- [ ] **Error boundary**: The global error page renders gracefully on unhandled errors.
- [ ] **Responsive**: Pages are usable at mobile, tablet, and desktop widths.

---

## Test Accounts

No pre-seeded user accounts exist. Register new accounts via `/register`:

- **Learner**: Register normally (default role is `learner`)
- **Educator**: Requires manual database update — after registering, run:
  ```sql
  UPDATE users SET role = 'educator' WHERE email = 'your-email@example.com';
  ```
- **Admin**: Same process with `role = 'admin'`

---

## Known Limitations

1. **Socket.IO challenge handlers are stubs**: The `server.ts` challenge event handlers log but don't wire into the matchmaking module. Full real-time challenge flow is not end-to-end functional.
2. **`sendNudge` is a no-op**: The educator nudge action logs to console only; no notification delivery is implemented.
3. **N+1 queries**: `getInterventionQueue` and weekly leaderboard perform per-user queries in loops. Fine for small datasets, will need optimization at scale.
4. **Client-side data fetching in scenario page**: Uses `useEffect` + `fetch` instead of server-side data fetching as specified in the architecture.
5. **`as any` casts in auth code**: Auth configuration uses type casts instead of proper NextAuth type augmentation.
6. **`prerenderEarlyExit: false`**: Workaround in `next.config.ts` for a Next.js 16.2.0 prerender bug with `_global-error`.
7. **No email verification**: Registration does not require email confirmation.
8. **No password reset flow**: No forgot-password or reset-password functionality.

---

## Auto-Generated vs Human Attention

### Auto-Generated (complete, tested, passing)

- Database schema (14 tables with Drizzle ORM)
- Authentication (NextAuth v5 with credentials, JWT, role-based access)
- All 21 frontend pages and layouts
- 44 React components (UI, game, MTSS, challenge)
- 6 server action modules (auth, scenarios, challenges, gamification, educator, peer review)
- Python FastAPI service (scenarios, grading, RAG, health)
- Jinja2 prompt templates for AI interactions
- XP/leveling system with streak tracking
- MTSS classification algorithm and educator dashboards
- Leaderboard with SSE streaming
- 161 frontend tests + 20 Python tests
- Dark theme, animations, loading states, error boundaries

### Needs Human Attention

- **Socket.IO challenge flow**: Stub handlers need wiring to matchmaking logic for real-time challenges to work end-to-end
- **Educator nudge notifications**: Currently a no-op — needs integration with an email/push service
- **Production secrets**: `NEXTAUTH_SECRET`, `INTERNAL_API_TOKEN`, and `OPENAI_API_KEY` must be set to secure values
- **Email verification and password reset**: Not implemented
- **Performance at scale**: N+1 queries in educator/leaderboard actions need optimization for large user bases
- **OpenAI API key**: Required for actual AI scenario generation and grading (mock fallback works without it)
- **Deployment configuration**: No production Dockerfile for the Next.js app; only the Python service has one
