# Research: CapMan AI — Gamified Scenario Training & MTSS Agent

---

## 1. Executive Summary

CapMan AI is a greenfield, AI-driven options trading education platform built for the Peak6/CapMan proprietary trading firm. There is no existing application code — only the factory pipeline metadata lives in the repository. This is a full greenfield build.

The platform has five interlocking subsystems that must be designed and built cohesively:

1. **Curriculum Engine** — A structured, tier-based options trading curriculum covering fundamentals through advanced strategies, organized around CapMan's proprietary lexicon and trading philosophy.
2. **AI Scenario & Grading Engine** — Python/FastAPI service using LLMs + RAG to generate unique trading scenarios and grade free-text responses using rubric-based evaluation.
3. **Gamification Layer** — XP, leveling, leaderboards, head-to-head real-time challenges, and peer review built into every learning interaction.
4. **MTSS Reporting Dashboard** — Educator "God View" that maps learner performance to Tier 1/2/3 support classifications, tracked at the skill-objective level (not just aggregate score).
5. **Real-time Multiplayer Engine** — WebSocket-based head-to-head challenge and live leaderboard infrastructure.

**Key architectural decision**: The spec requires Python for AI/data logic (Atlas integration) AND Next.js 16 for the UI. The recommended pattern is Next.js 16 (frontend + thin API routes) proxying to a Python FastAPI service for all AI operations. Railway supports multi-service deployments natively.

---

## 2. Existing Codebase Analysis

### Directory Structure (as of 2026-03-19)

```
/Users/sebastian/dev/gauntlet/peak6/
├── .factory/
│   ├── artifacts/
│   │   └── tasks/           (empty)
│   ├── brief-1773940537755.md
│   ├── heartbeat
│   ├── logs/
│   ├── original-brief.md
│   ├── spec.json
│   └── state.json
└── .git/
```

### Conclusion: Greenfield Project

There is **no application source code**. No `package.json`, no `src/`, no Python files, no Docker configuration. Every file, directory, dependency, and convention must be established from scratch.

The factory pipeline is in `research` phase (state.json confirms `current_phase: "research"`). The brief specifies the full tech stack explicitly.

---

## Codebase Profile

This is a **greenfield project** — no existing application code. The codebase profile below describes the target structure that must be established.

### Target Directory Layout

```
peak6/
├── app/                        # Next.js 16 App Router
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing / login redirect
│   ├── (auth)/                 # Auth route group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/            # Learner dashboard group
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard home
│   │   ├── scenarios/page.tsx  # Scenario browser
│   │   ├── challenges/page.tsx # Head-to-head challenges
│   │   └── leaderboard/page.tsx
│   ├── (educator)/             # Educator "God View" group
│   │   ├── layout.tsx
│   │   ├── page.tsx            # MTSS overview
│   │   └── students/page.tsx   # Individual learner drill-down
│   └── api/                    # Next.js API routes (thin proxy layer)
│       ├── scenarios/route.ts
│       ├── grading/route.ts
│       └── challenges/route.ts
├── components/                 # Shared React components
│   ├── ui/                     # shadcn/ui generated components
│   ├── scenarios/              # Scenario-specific components
│   ├── gamification/           # XP bar, level badge, leaderboard
│   └── mtss/                   # Educator dashboard components
├── lib/                        # Shared utilities and config
│   ├── db/                     # Drizzle schema, migrations, client
│   │   ├── schema.ts
│   │   ├── migrate.ts
│   │   └── index.ts
│   ├── auth/                   # Auth.js config
│   ├── api.ts                  # API client helpers
│   └── utils.ts                # General utilities
├── src/                        # Python AI service
│   ├── main.py                 # FastAPI entry point
│   ├── routes/                 # API endpoints
│   │   ├── scenarios.py
│   │   ├── grading.py
│   │   └── rag.py
│   ├── services/               # Business logic
│   │   ├── scenario_generator.py
│   │   ├── grading_engine.py
│   │   └── rag_pipeline.py
│   └── models/                 # Pydantic models
├── docker-compose.yml          # PostgreSQL + pgvector local dev
├── drizzle.config.ts           # Drizzle migration config
├── next.config.ts              # Next.js config with Python proxy
├── tailwind.config.ts          # Tailwind + shadcn theme
├── package.json
└── requirements.txt            # Python dependencies
```

### Language & Runtime Breakdown

| Layer | Language | Runtime | Key Libraries |
|-------|----------|---------|---------------|
| Frontend | TypeScript | Node.js 22+ | Next.js 16, React 19, shadcn/ui, Tailwind 4, Motion |
| API Gateway | TypeScript | Next.js API routes | Thin proxy to Python service |
| AI Service | Python 3.12+ | FastAPI/Uvicorn | LangChain, pgvector, Anthropic/OpenAI SDK |
| Database | SQL | PostgreSQL 17 | Drizzle ORM (TS), asyncpg (Python), pgvector extension |

---

## Conventions

Since this is greenfield, the following conventions must be established and enforced from the first commit:

### Code Style & Formatting
- **TypeScript**: Strict mode enabled (`strict: true` in tsconfig). Use ESLint with `next/core-web-vitals` preset.
- **Python**: PEP 8 via Ruff linter/formatter. Type hints required on all function signatures.
- **File naming**: kebab-case for all files (`scenario-card.tsx`, `grading-engine.py`). Exception: Next.js route files (`page.tsx`, `layout.tsx`, `route.ts`).
- **Component naming**: PascalCase for React components (`ScenarioCard`, `XpBar`).

### Next.js Patterns
- Use **Server Components by default**. Only add `"use client"` when interactivity is needed (forms, animations, state).
- Use **Server Actions** for mutations (submit scenario attempt, award XP). Defined in `app/` directory co-located with routes.
- All data fetching via server components or server actions — no `useEffect` + `fetch` patterns.
- Route groups `(auth)`, `(dashboard)`, `(educator)` for layout segmentation.

### Database Conventions
- Drizzle schema defined in `lib/db/schema.ts` as single source of truth.
- Table names: plural snake_case (`users`, `scenario_attempts`, `xp_events`).
- All tables include `id` (serial primary key), `created_at`, `updated_at` timestamps.
- Use Drizzle `relations()` for explicit relationship declarations.
- Migrations via `drizzle-kit generate` and `drizzle-kit migrate`.

### Python Service Conventions
- FastAPI with Pydantic v2 models for all request/response schemas.
- Async endpoints throughout (`async def`).
- Service layer pattern: routes call services, services call external APIs/DB.
- All LLM prompts stored as Jinja2 templates in `src/prompts/` directory.

### Component Architecture
- shadcn/ui components live in `components/ui/` — installed via CLI, customized via CSS variables.
- Domain components in feature folders (`components/scenarios/`, `components/gamification/`, `components/mtss/`).
- Motion animations in dedicated hooks or wrapper components (`components/gamification/xp-animation.tsx`).

### Testing Strategy
- **Frontend**: Vitest + React Testing Library for component tests.
- **API**: Vitest for Next.js API route tests.
- **Python**: pytest + httpx for FastAPI endpoint tests.
- **E2E**: Playwright for critical user flows (complete a scenario, view leaderboard).

---

## Integration Points

### 1. Next.js ↔ Python FastAPI (Primary Integration)

The Next.js frontend proxies AI-related API calls to the Python FastAPI service via `next.config.ts` rewrites:

```typescript
// next.config.ts
export default {
  async rewrites() {
    return [
      { source: '/api/ai/:path*', destination: 'http://localhost:8000/:path*' }
    ];
  }
};
```

- **Scenario generation**: `app/api/scenarios/route.ts` → Python `src/routes/scenarios.py`
- **Grading**: `app/api/grading/route.ts` → Python `src/routes/grading.py`
- **RAG queries**: `app/api/rag/route.ts` → Python `src/routes/rag.py`
- Communication via JSON REST. Python service is stateless; all state in PostgreSQL.

### 2. Drizzle ORM ↔ PostgreSQL

- Drizzle schema in `lib/db/schema.ts` generates and runs migrations against PostgreSQL.
- Python service connects to the same PostgreSQL instance via asyncpg (direct SQL or SQLAlchemy async).
- **Shared database, separate ORMs** — Drizzle owns the schema/migrations, Python reads/writes via raw SQL or SQLAlchemy mapped to the same tables.
- pgvector extension used by Python service for RAG embeddings (table: `document_chunks`).

### 3. Auth.js ↔ Application

- Auth.js v5 configured in `lib/auth/` with database session strategy (Drizzle adapter).
- Session provides `user.id`, `user.role` (learner/educator/admin) to all server components.
- Python service validates requests via JWT token passed in `Authorization` header from Next.js API routes.

### 4. Atlas Tooling (External, Unknown API)

- The spec requires integration with "Atlas (Python)" for CapMan-specific tooling.
- Must design an abstraction layer in `src/services/atlas_client.py` with a clear interface.
- Initial implementation uses a mock/stub; real integration when Atlas API is documented.

### 5. WebSocket Server (Socket.io)

- Custom Node.js server wrapping Next.js for WebSocket support (Railway doesn't use Vercel's serverless model).
- Socket.io rooms for head-to-head challenges (`components/challenges/` components connect via client).
- Events: `challenge:start`, `challenge:submit`, `challenge:result`, `leaderboard:update`.

### 6. Docker Compose (Local Development)

- `docker-compose.yml` runs PostgreSQL 17 with pgvector extension.
- Python FastAPI service can optionally run in Docker for parity with production.
- Next.js runs via `npm run dev` (Turbopack) outside Docker for fast refresh.

### 7. Railway (Deployment)

- Two Railway services: (1) Next.js app, (2) Python FastAPI service.
- Railway-managed PostgreSQL with pgvector addon.
- Environment variables shared via Railway's variable linking.
- Custom `server.ts` entry point for Next.js to support WebSocket on Railway.

---

## 3. Options Trading Education Content & Curriculum

This section is the core educational content the platform must teach. The curriculum must reflect CapMan's proprietary lexicon (enforced via RAG), not generic financial theory.

### 3.1 Foundational Concepts (Tier 1 — Universal / Beginner)

These are prerequisites for all other content. Every learner starts here.

#### Options Basics
- **Call Option**: Right (not obligation) to BUY an underlying asset at the strike price before/on expiration. Buyer pays premium. Max loss = premium paid. Unlimited upside.
- **Put Option**: Right (not obligation) to SELL an underlying asset at the strike price before/on expiration. Buyer pays premium. Max loss = premium paid. Max gain = strike price (if underlying goes to zero).
- **Strike Price**: The agreed-upon price in the contract.
- **Expiration Date**: The date the contract expires. Options lose value as this approaches (theta decay).
- **Premium**: The price paid for the option contract. Composed of intrinsic value + extrinsic (time) value.
- **Intrinsic Value**: How much the option is in-the-money. For calls: max(0, underlying price - strike). For puts: max(0, strike - underlying price).
- **Extrinsic / Time Value**: Premium above intrinsic value. Driven by time to expiration and implied volatility.
- **Moneyness**: In-the-money (ITM), at-the-money (ATM), out-of-the-money (OTM).
- **Long vs. Short**: Long = bought the option (paid premium, limited risk). Short = sold the option (collected premium, higher risk).
- **Open Interest & Volume**: Liquidity indicators. Critical for entry/exit slippage analysis.

#### Scenario Examples (Beginner)
- "SPY is trading at $500. You buy a $510 call expiring in 30 days for $3.00. What is your max loss? At what price does the trade become profitable at expiration?"
- "You own 100 shares of AAPL at $180. You buy a $175 put for $2.50. What is the purpose of this trade? What is your maximum loss on the combined position?"

### 3.2 The Options Greeks (Tier 1-2 — Beginner to Intermediate)

Greeks are risk measurement tools. Teaching learners to internalize these is the cornerstone of the CapMan curriculum.

#### Delta (Δ)
- Measures how much the option price changes per $1 move in the underlying.
- Calls: Delta 0 to +1. Puts: Delta -1 to 0.
- ATM options ≈ 0.50 delta. Deep ITM → delta approaches ±1. Far OTM → delta approaches 0.
- Also interpreted as approximate probability of expiring ITM.
- **Delta hedging**: Market makers adjust delta to maintain neutral exposure.
- **Scenario prompt type**: "Your portfolio has net delta of +350. The underlying drops $2. Approximately how much does your portfolio value change?"

#### Gamma (Γ)
- Rate of change of delta per $1 move in underlying.
- Highest at ATM and near expiration. Long gamma = long options (benefiting from big moves). Short gamma = short options (hurt by big moves).
- **Key teaching point**: Gamma risk near expiration — short gamma positions can experience rapid delta changes.
- **Scenario prompt type**: "You are short an ATM straddle with 2 DTE. The underlying gaps up 5%. Describe the risks you now face."

#### Theta (Θ)
- Daily time decay — how much option value erodes per day, all else equal.
- Long options: Theta negative (you lose time value daily). Short options: Theta positive (you collect time decay).
- Accelerates as expiration approaches, especially for ATM options.
- **Key teaching point**: Theta/Gamma tradeoff. Long gamma = negative theta. Short gamma = positive theta. You cannot have both.
- **Scenario prompt type**: "You bought an ATM call for $5 with 60 DTE. It is now 30 DTE and the underlying has not moved. Roughly how much of the premium has decayed, and why?"

#### Vega (V)
- Sensitivity of option price to a 1-point change in implied volatility (IV).
- Long options: Positive vega (benefit from IV increases). Short options: Negative vega (hurt by IV increases).
- Higher for longer-dated options. Near-zero at expiration.
- **Key teaching point**: "Buying volatility" vs "selling volatility." Vega-neutral strategies.
- **Scenario prompt type**: "You are long a strangle ahead of earnings. The stock barely moves on the earnings announcement but implied volatility collapses from 80 to 25. Your options are now worth much less than expected. Explain why this happened."

#### Rho (ρ)
- Sensitivity to changes in risk-free interest rates.
- Less critical for short-dated options. More relevant for LEAPS (long-dated options).
- **Teaching note**: In high-rate environments, calls increase in value and puts decrease (for equity options).

#### Second-Order Greeks
- **Vanna**: Delta sensitivity to IV changes. Important for risk management in complex portfolios.
- **Charm**: Delta decay per day (how delta changes with time). Relevant for delta hedging near expiration.
- **Volga/Vomma**: Vega sensitivity to IV changes. Important for volatility surface trading.

### 3.3 Options Strategies by Market Regime (Tier 2 — Intermediate)

The CapMan teaching philosophy explicitly links strategy selection to market regime analysis. This is a core differentiator from generic options education.

#### Market Regime Framework
Four primary regimes, each requiring different strategy alignment:

| Regime | VIX Level | Price Action | Preferred Strategies |
|--------|-----------|--------------|---------------------|
| Bull Quiet | < 20 | Uptrending | Bull call spreads, covered calls, cash-secured puts |
| Bull Volatile | > 20 | Uptrending but choppy | Ratio spreads, calendars, protective puts |
| Bear Quiet | < 20 | Downtrending | Bear put spreads, collar, long puts |
| Bear Volatile | > 20 | Downtrending fast | Long puts, put spreads, straddles |
| Sideways/Range | Any | Mean-reverting | Iron condors, iron butterflies, short strangles (if IV high) |

**Trend Identification**: Price vs. 50/200 SMA. Above 50 > 200 = bull trend. Below 50 < 200 = bear trend. Crossing = transition.

**Volatility Regime**: IV vs. Historical Volatility (HV). IV > HV = options "expensive," favor selling. IV < HV = options "cheap," favor buying.

#### Single-Leg Strategies (Tier 1-2)
- **Long Call**: Bullish, defined risk. Best in low-IV bull trend. Pay for delta exposure.
- **Long Put**: Bearish, defined risk. Best in high-IV bear trend or as hedge.
- **Covered Call**: Long 100 shares + short call. Income generation, upside cap. Best in sideways/mild bull.
- **Cash-Secured Put**: Short put with cash collateral. Bullish to neutral. Income + potential acquisition of stock at lower price.

#### Vertical Spreads (Tier 2)
All four vertical spreads share a structure: buy one option, sell one option at different strike, same expiration, same type (all calls or all puts).

- **Bull Call Debit Spread**: Buy lower strike call, sell higher strike call. Cost = net debit. Max profit = spread width - debit. Max loss = debit. Breakeven = lower strike + debit.
- **Bear Put Debit Spread**: Buy higher strike put, sell lower strike put. Bearish. Max profit = spread width - debit.
- **Bull Put Credit Spread**: Sell higher strike put, buy lower strike put. Collect credit. Bullish to neutral. Max profit = credit. Max loss = spread width - credit.
- **Bear Call Credit Spread**: Sell lower strike call, buy higher strike call. Bearish to neutral. Collect credit.

**Key Teaching Point**: Debit spreads pay to express a directional view. Credit spreads collect premium to fade a move outside the range. Credit spreads have positive theta; debit spreads have negative theta.

#### Neutral/Volatility Strategies (Tier 2-3)
- **Long Straddle**: Buy ATM call + ATM put, same strike/expiration. Long vega, long gamma, negative theta. Profits from large moves in either direction. Best when IV is low (cheap options) and a big move is expected (e.g., before earnings).
- **Long Strangle**: Buy OTM call + OTM put. Lower cost than straddle, needs bigger move to profit.
- **Short Straddle**: Sell ATM call + ATM put. Short vega, short gamma, positive theta. Profits from low volatility/range-bound market. Unlimited risk. Best when IV is high.
- **Short Strangle**: Sell OTM call + OTM put. Wider breakeven than short straddle. Still undefined risk.

#### Complex Multi-Leg Strategies (Tier 3 — Advanced)
- **Iron Condor**: Sell OTM call spread + sell OTM put spread. Four legs. Defined risk. Benefits from range-bound, decaying IV. Best in high-IV sideways regime. Max profit = total credit. Max loss = spread width - credit.
- **Iron Butterfly**: Sell ATM straddle + buy OTM strangle wings. Higher credit, narrower profitable range. More theta. Max profit if underlying pins at short strike at expiration.
- **Calendar Spread (Time Spread)**: Sell near-term option + buy same-strike, later-dated option. Long vega. Profits from IV increase or stable price near short strike.
- **Diagonal Spread**: Calendar spread with different strikes. Hybrid directional + time value play.
- **Ratio Spreads**: Buy 1 option, sell 2+ options at different strike. Generates credit but introduces undefined risk above/below the ratio.
- **Butterfly Spread**: Buy 1 low, sell 2 middle, buy 1 high (same type, same expiration). Max profit at middle strike. Very low cost. Best when expecting pin at specific price.
- **Condor Spread**: 4 strikes instead of butterfly's 3. Wider profitable zone, lower max profit.

### 3.4 Risk Management Framework (Tier 2-3)

This is CapMan-specific pedagogy — managing risk at trade, position, and portfolio level.

#### Trade-Level Risk
- **Max Loss Definition**: Know it before entering. For debit spreads = debit paid. For credit spreads = spread width - credit.
- **Position Sizing**: Risk 1-3% of account per trade maximum. Formula: Risk per trade / Max loss per contract = number of contracts.
- **Risk-to-Reward Ratio (R:R)**: At minimum 1:1.5 to 1:2. Only take trades where potential reward justifies risk.
- **Breakeven Analysis**: At expiration, what does the underlying need to do for the trade to be profitable? Is that move realistic given current IV?

#### Position-Level Risk
- **Delta Exposure**: Total portfolio delta tells you directional bias. Positive delta = long bias (profits if market rises). Target delta-neutral for pure volatility plays.
- **Gamma Risk**: Short gamma = risk from large moves. Near expiration, short gamma positions need active management.
- **Theta Collection Rate**: Is the portfolio collecting enough daily theta to justify the gamma/vega risks?

#### Portfolio-Level Risk
- **Correlation Risk**: Multiple short volatility positions in correlated underlyings = concentrated exposure.
- **Liquidity Management**: Never hold to expiration if underlying has low liquidity. Wide bid-ask = slippage.
- **Rolling**: When to roll a position (extend duration to avoid assignment, manage a loser by adjusting strikes).

### 3.5 Trade Analysis Methodology (Core CapMan Skill)

This is the "why" behind every trade — what the probing AI agent tests.

#### The Analysis Framework (STEP)
1. **S — Situation**: What is the market regime? What is the trend? What is IV doing?
2. **T — Trade Thesis**: What specific move/non-move am I betting on? Over what timeframe?
3. **E — Entry Mechanics**: Which strategy best expresses the thesis? Why this expiration? Why these strikes? What is the credit/debit?
4. **P — Plan**: What is max profit? Max loss? At what point do I exit (profit target, stop loss)? What events could invalidate the thesis?

#### Probing Questions the AI Should Ask
- "Why did you choose a 30-day expiration vs. 60-day?"
- "Your delta is 0.30. What does that tell you about the probability of this trade expiring profitable?"
- "IV is at the 80th percentile historically. Does that change which strategy you select? Why?"
- "The stock just broke through a key support level. Does your thesis still hold? How does this affect your Greeks?"
- "If you had to delta-hedge this position, what would you do and how often?"

### 3.6 Curriculum Progression Levels (Mastery-Based)

| Level | Name | Prerequisites | Key Concepts |
|-------|------|---------------|--------------|
| 1 | Foundation | None | Calls, puts, strike, expiration, premium, P&L diagrams |
| 2 | Greeks Basics | Level 1 mastery | Delta, theta, vega at an intuitive level |
| 3 | Single-Leg Strategies | Level 2 mastery | Long/short calls and puts, covered call, cash-secured put |
| 4 | Vertical Spreads | Level 3 mastery | Bull/bear call/put spreads, max profit/loss, breakeven |
| 5 | Market Regime Analysis | Level 4 mastery | Trend identification, IV analysis, regime-strategy matching |
| 6 | Volatility Strategies | Level 5 mastery | Straddles, strangles, calendar spreads |
| 7 | Complex Strategies | Level 6 mastery | Iron condors, butterflies, condors, ratio spreads |
| 8 | Risk Management | Levels 1-7 | Position sizing, portfolio delta/gamma, rolling, adjustments |
| 9 | Advanced Greeks | Level 8 mastery | Second-order Greeks, volga, vanna, charm |
| 10 | Professional Synthesis | All above | Multi-regime portfolios, stress testing, full trade plans |

**Mastery Threshold**: A learner must achieve ≥80% on AI-graded scenario evaluations across 10+ attempts within a level before unlocking the next level. XP is awarded per attempt; bonus XP for streaks.

---

## 4. Tech Stack Analysis

### 4.1 Next.js 16 (Released October 2025, current: 16.2 as of March 2026)

**Source**: https://nextjs.org/blog/next-16

#### Key Features Relevant to This Project

- **Cache Components** (`"use cache"` directive): Explicit, opt-in caching replacing implicit caching. Default is uncached/dynamic. Enable with `cacheComponents: true` in `next.config.ts`.
- **Turbopack (Stable)**: Default bundler. 2-5x faster production builds, 10x faster Fast Refresh. No webpack config needed unless custom.
- **proxy.ts** (replaces `middleware.ts`): Runs on Node.js runtime. Use for auth middleware, request interception.
- **`updateTag()` and `refresh()`**: New Server Action cache APIs. `updateTag()` for read-your-writes. `refresh()` for refreshing uncached data.
- **React 19.2 + View Transitions**: Animate between page states. Relevant for gamification transitions.
- **React Compiler (Stable)**: Auto-memoization. Enable with `reactCompiler: true`.
- **Enhanced Routing**: Layout deduplication, incremental prefetching.

#### Breaking Changes to Know (Next.js 16)
- **Node.js 20.9+ required**. TypeScript 5.1+ required.
- `params` and `searchParams` are async: must `await params`, `await searchParams`.
- `cookies()`, `headers()`, `draftMode()` are async.
- `middleware.ts` renamed to `proxy.ts`.
- `experimental.ppr` removed (replaced by `cacheComponents`).
- `serverRuntimeConfig`, `publicRuntimeConfig` removed — use `.env` files.
- `next lint` command removed — use ESLint/Biome directly.
- AMP support removed.

#### Recommended Project Structure (Next.js 16 App Router)

```
src/
├── app/
│   ├── (auth)/              # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Authenticated app routes
│   │   ├── layout.tsx       # Dashboard shell
│   │   ├── learn/           # Learning module routes
│   │   │   ├── [levelId]/
│   │   │   │   └── scenario/
│   │   │   │       └── [scenarioId]/
│   │   ├── compete/         # Head-to-head challenges
│   │   ├── leaderboard/
│   │   └── profile/
│   ├── educator/            # MTSS dashboard (separate auth role)
│   │   └── dashboard/
│   ├── api/                 # API routes (thin proxy layer)
│   │   ├── scenarios/
│   │   ├── grading/
│   │   ├── leaderboard/
│   │   └── ws/              # WebSocket upgrade endpoint
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn/ui generated components
│   ├── game/                # Gamification-specific components
│   │   ├── XPBar.tsx
│   │   ├── LeaderboardCard.tsx
│   │   └── ChallengeTimer.tsx
│   ├── trading/             # Trading scenario components
│   │   ├── ScenarioCard.tsx
│   │   ├── GreeksDisplay.tsx
│   │   └── PayoffDiagram.tsx
│   └── mtss/                # Educator dashboard components
│       ├── TierHeatmap.tsx
│       └── SkillProgressTable.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts        # Drizzle schema
│   │   ├── index.ts         # DB connection
│   │   └── migrations/
│   ├── ai/
│   │   └── client.ts        # Python service API client
│   └── auth/
│       └── session.ts
├── actions/                 # Server Actions
│   ├── scenario.ts
│   ├── grading.ts
│   └── gamification.ts
└── types/
    └── index.ts
```

### 4.2 shadcn/ui + Tailwind CSS

**Source**: https://ui.shadcn.com/

shadcn/ui is a component collection (not a library — you copy components into your codebase) built on Radix UI primitives with Tailwind CSS styling. Components are fully owned and customizable.

#### Available Components (Relevant Subset)
- **Data Display**: Table, Badge, Avatar, Progress, Skeleton
- **Charts**: Chart (built on Recharts) — critical for MTSS dashboard
- **Feedback**: Alert, Toast (via Sonner), Tooltip
- **Navigation**: NavigationMenu, Tabs, Breadcrumb, Sidebar
- **Overlays**: Dialog, Sheet, Drawer, Popover, HoverCard
- **Forms**: Form, Input, Select, Textarea, RadioGroup, Checkbox, Slider
- **Layout**: Card, Separator, ScrollArea, ResizablePanelGroup
- **Gaming**: None natively — will need custom components on top of shadcn primitives

#### Theming Approach
- CSS variables defined in `globals.css` for light/dark mode.
- Use `next-themes` for dark mode switching.
- shadcn/ui uses CSS variable tokens (e.g., `--primary`, `--background`, `--foreground`).
- For a trading platform: dark mode should be the default. Financial platforms universally use dark UI.
- Custom "CapMan" color theme: Consider a dark theme with accent color appropriate to the brand.

#### Setup Pattern
```bash
npx shadcn@latest init
# Choose: TypeScript, App Router, Tailwind, CSS variables
npx shadcn@latest add button card table badge progress chart dialog
```

### 4.3 Drizzle ORM

**Source**: https://orm.drizzle.team/

Drizzle is a TypeScript-first, zero-code-generation ORM. Schema is defined in TypeScript files that serve as both DB definition and TS types.

#### Schema Definition Pattern
```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, text, integer, timestamp, boolean, jsonb, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['learner', 'educator', 'admin'] }).notNull().default('learner'),
  xp: integer('xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  scenarioAttempts: many(scenarioAttempts),
  challengeParticipations: many(challengeParticipations),
}));
```

#### Migration Pattern
```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

```bash
# Generate migration
npx drizzle-kit generate
# Apply migration
npx drizzle-kit migrate
# (or push directly in dev)
npx drizzle-kit push
```

#### DB Connection (Next.js 16 pattern)
```typescript
// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

### 4.4 Motion (fka Framer Motion)

**Source**: https://motion.dev/

Motion is the animation library for React. Key APIs:

- `motion.div`, `motion.span` etc — animatable HTML elements
- `animate` — keyframe animations
- `variants` — named animation states, supports `staggerChildren` for list animations
- `AnimatePresence` — animate mount/unmount transitions
- `useMotionValue`, `useTransform`, `useSpring` — physics-based animations
- `layout` prop — automatic layout animations when DOM changes
- `whileHover`, `whileTap`, `whileDrag` — gesture animations

#### Key Gamification Patterns
```tsx
// XP bar fill animation
<motion.div
  className="xp-bar-fill"
  initial={{ width: previousXPPercent + '%' }}
  animate={{ width: newXPPercent + '%' }}
  transition={{ duration: 1, ease: 'easeOut' }}
/>

// Level up celebration
<AnimatePresence>
  {showLevelUp && (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      LEVEL UP!
    </motion.div>
  )}
</AnimatePresence>

// Leaderboard position change
<motion.li layout transition={{ type: 'spring', stiffness: 200 }}>
  {/* Automatically animates when position changes in list */}
</motion.li>

// Staggered list entrance
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

### 4.5 Python / FastAPI AI Service

**Source**: https://fastapi.tiangolo.com/

FastAPI is the recommended Python web framework for the AI service layer.

#### Architecture Pattern
```
Next.js 16 (port 3000)
    |
    | HTTP/REST (internal service call)
    |
FastAPI Python Service (port 8000)
    |
    +-- LLM Client (OpenAI/Anthropic/etc.)
    +-- Vector Database (Pinecone/pgvector)
    +-- RAG Pipeline (LangChain/LlamaIndex)
    +-- Atlas Integration
```

#### Next.js → Python Integration
Two options:
1. **Direct API calls from Next.js Server Actions/Routes to FastAPI**: Recommended. Keep Next.js API routes thin — they handle auth, then proxy to Python service.
2. **Route rewrites**: Configure `next.config.ts` rewrites to map `/api/ai/*` to Python service.

```typescript
// next.config.ts — rewrite pattern
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/ai/:path*',
        destination: `${process.env.AI_SERVICE_URL}/api/:path*`,
      },
    ];
  },
};
```

#### FastAPI Service Structure
```
python-service/
├── main.py
├── routers/
│   ├── scenarios.py      # Scenario generation endpoints
│   ├── grading.py        # AI grading endpoints
│   └── rag.py            # Document retrieval endpoints
├── services/
│   ├── llm_service.py    # LLM abstraction
│   ├── rag_service.py    # RAG pipeline
│   └── grading_service.py
├── models/
│   └── schemas.py        # Pydantic models
├── requirements.txt
└── Dockerfile
```

### 4.6 PostgreSQL + Docker Compose (Local Dev)

```yaml
# docker-compose.yml
version: '3.9'
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: capman_dev
      POSTGRES_USER: capman
      POSTGRES_PASSWORD: capman_local
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U capman -d capman_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@capman.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
```

### 4.7 Railway Deployment

Railway supports multi-service deployments from a single repository or multiple repositories. For this project:

- **Service 1**: Next.js 16 app (auto-detected, Nixpacks build)
- **Service 2**: Python FastAPI service (auto-detected or Dockerfile)
- **Service 3**: PostgreSQL (Railway managed database plugin)

Railway automatically injects `DATABASE_URL` when a PostgreSQL service is attached. Inter-service communication uses Railway's private networking via `${{ServiceName.RAILWAY_PRIVATE_DOMAIN}}`.

**Environment Variables needed**:
```
DATABASE_URL=postgresql://...
AI_SERVICE_URL=http://ai-service.railway.internal:8000  # private network
OPENAI_API_KEY=...  (or ANTHROPIC_API_KEY)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://capman.up.railway.app
PINECONE_API_KEY=...  (or use pgvector)
```

---

## 5. Gamification Design Patterns

### 5.1 XP and Leveling System

#### XP Award Structure
| Action | XP Award |
|--------|----------|
| Complete scenario attempt | 10 XP base |
| Score 80-89% on attempt | +10 XP bonus |
| Score 90-100% on attempt | +25 XP bonus |
| Daily streak (consecutive days) | +15 XP/day bonus |
| Win head-to-head challenge | +50 XP |
| Peer review completed | +5 XP |
| First attempt on new concept | +5 XP exploration bonus |
| Perfect score on level assessment | +100 XP |

#### Level Thresholds
Exponential curve — early levels are quick (motivation), later levels require depth.

| Level | XP Required (Total) | Badge Name |
|-------|--------------------|-----------| 
| 1 | 0 | Recruit |
| 2 | 100 | Analyst I |
| 3 | 300 | Analyst II |
| 4 | 600 | Trader I |
| 5 | 1,000 | Trader II |
| 6 | 1,500 | Senior Trader |
| 7 | 2,500 | Strategist I |
| 8 | 4,000 | Strategist II |
| 9 | 6,000 | Risk Manager |
| 10 | 10,000 | CapMan Pro |

#### Mastery Unlocks (Separate from Level)
Levels are overall XP accumulation. Curriculum unlocks are mastery-gated:
- Each curriculum level (1-10, see Section 3.6) requires passing a mastery threshold independently.
- A learner can be Level 5 (XP) but only unlocked Curriculum Level 3.

### 5.2 Leaderboard Design

Three leaderboard types:
1. **Global All-Time**: Total XP. Updated after each session.
2. **Weekly Sprint**: XP earned in current week. Resets every Monday 00:00 UTC. Creates urgency.
3. **Skill-Level Leaderboard**: Ranking within a specific curriculum level. Learners only compete against peers at the same level — reduces discouragement.

#### Leaderboard Database Schema (outline)
- `leaderboard_snapshots`: Weekly snapshots stored for historical comparison.
- Real-time position computed from `users.xp` for all-time. Weekly uses `xp_events` table summed for current week.

### 5.3 Head-to-Head Challenge Mechanics

#### Challenge Flow
1. **Matchmaking**: Learner A requests challenge → system finds Learner B of similar XP/curriculum level → both receive challenge invitation (WebSocket event).
2. **Challenge Room**: Both learners receive the same AI-generated scenario simultaneously (server generates one scenario, broadcasts to both).
3. **Timed Response**: 5-minute countdown timer. Both submit free-text analysis.
4. **AI Grading**: Python service grades both responses simultaneously.
5. **Peer Reveal**: Both responses revealed to each other (anonymous until reveal). Each reviews the other's work (peer review module).
6. **Winner Determination**: Higher AI score wins. Tiebreaker = submission speed. Winner gets 50 XP. Loser gets 10 XP participation.
7. **Rematch or Exit**: Option to immediately rematch or return to training.

#### Matchmaking Algorithm
- Simple ELO-adjacent: Match within ±200 XP range first. Expand to ±400 after 30s wait. Random match after 60s wait.
- Skill-level gate: Only match learners who have unlocked the same curriculum level.

### 5.4 Peer Review Module

- After each challenge (or optionally for solo practice), learner reviews a peer's anonymized response.
- Peer rates the response on a rubric: Correctness (1-5), Depth of Reasoning (1-5), Risk Awareness (1-5).
- Peer review scores feed into MTSS data as a second signal alongside AI grading.
- Peer reviewers earn 5 XP per completed review.
- **Trust scoring**: If a peer's review correlates with AI grade ≥70%, their future reviews get slightly more weight.

### 5.5 Engagement Loops

```
[Login] → [Daily Challenge Prompt] → [Complete Scenario]
    ↓                                         ↓
[XP Award + Animation] ← [AI Grading + Feedback]
    ↓
[Level Progress Bar Update]
    ↓
[Check for Level Up?] → [Level Up Celebration] → [New Content Unlocked]
    ↓
[Leaderboard Position Change]
    ↓
[Head-to-Head Challenge Invitation?]
    ↓
[Streak Counter Update]
    ↓
[Daily Goal Progress] → [Share/Compete]
```

**Retention Mechanics**:
- Daily streak counter (breaks if no activity for 24h).
- "Challenge waiting" notifications when another learner challenges you.
- Weekly leaderboard deadline creates urgency.
- "Next level in X XP" always visible.
- Educator can send "nudge" to specific learners via MTSS dashboard.

---

## 6. MTSS Framework Integration

### 6.1 MTSS Tier Definitions (adapted for trading education)

| Tier | Name | Criteria | Population | Response |
|------|------|----------|------------|----------|
| Tier 1 | Universal | Passing rate ≥70% across tracked skill objectives, consistent engagement | ~80% of learners | Standard curriculum access, peer challenges |
| Tier 2 | Targeted | Passing rate 50-69% on 2+ skill objectives, OR low engagement (<3 sessions/week) | ~15% of learners | Educator notification, targeted scenario assignment in weak areas |
| Tier 3 | Intensive | Passing rate <50% on 2+ skill objectives, OR 0 attempts in 5+ days | ~5% of learners | Immediate educator intervention flag, 1:1 review queue |

### 6.2 Skill Objective Tracking

MTSS is tracked at the **skill objective level** — not just aggregate score. Each scenario attempt is tagged to one or more skill objectives:

```
Skill Objectives (mapped to curriculum content):
- OBJ-001: Identify option moneyness (ITM/ATM/OTM)
- OBJ-002: Calculate option intrinsic and extrinsic value
- OBJ-003: Interpret delta for directional risk
- OBJ-004: Interpret theta for time decay impact
- OBJ-005: Interpret vega for volatility sensitivity
- OBJ-006: Identify correct strategy for market regime
- OBJ-007: Calculate max profit/loss for vertical spreads
- OBJ-008: Calculate breakeven for a given strategy
- OBJ-009: Articulate risk management rationale
- OBJ-010: Construct multi-leg trade thesis
- OBJ-011: Identify adjustment triggers (stop loss, roll conditions)
- OBJ-012: Evaluate portfolio-level Greek exposure
```

Each scenario attempt produces a rubric score per objective (0-100). Rolling 10-attempt average per objective determines MTSS tier for that objective.

### 6.3 Educator "God View" Dashboard

Key components:
1. **Cohort Heatmap**: Grid of learners × skill objectives. Color-coded by tier (green=T1, yellow=T2, red=T3). Sortable/filterable.
2. **Tier Distribution Chart**: Bar chart showing current T1/T2/T3 counts. Historical trendline.
3. **Individual Learner Drill-Down**: Click any learner to see their full skill objective history, recent scenario attempts, XP trend, and engagement metrics.
4. **Intervention Queue**: Sorted list of Tier 3 learners with days since last activity and specific failing objectives highlighted.
5. **Cohort Progress Over Time**: Line chart of average mastery per curriculum level over weeks.
6. **Engagement Metrics Panel**: DAU/WAU, average sessions per week, challenge participation rate.
7. **Scenario Performance Analytics**: Which AI-generated scenarios have the highest/lowest pass rates (identifies scenarios that may be too hard/easy or poorly generated).

### 6.4 MTSS Classification Algorithm

Run after each scenario attempt:

```python
def classify_mtss_tier(user_id: str, objective_id: str, db) -> int:
    # Get last 10 attempts for this user+objective
    attempts = db.query(...)  # last 10 scenario_attempts where objective tagged
    
    if len(attempts) < 3:
        return 1  # Insufficient data, default to Tier 1
    
    avg_score = mean([a.score for a in attempts])
    days_since_activity = (now() - user.last_active).days
    
    if avg_score < 50 or days_since_activity >= 5:
        return 3
    elif avg_score < 70 or days_since_activity >= 3:
        return 2
    else:
        return 1
```

Store tier classifications in `mtss_classifications` table for historical tracking and dashboard queries.

---

## 7. AI/LLM Architecture

### 7.1 Scenario Generation Engine

#### Prompt Engineering Strategy
The scenario generator must produce varied, coherent, CapMan-lexicon-compliant trading scenarios. Key dimensions of variation:

1. **Underlying Asset**: Individual stocks (AAPL, SPY, QQQ, individual equities), index ETFs, sector ETFs
2. **Market Regime**: Bull quiet, bull volatile, bear quiet, bear volatile, sideways
3. **Scenario Type**: Entry decision, exit decision, adjustment decision, post-trade analysis
4. **Complexity Level**: Mapped to curriculum level 1-10
5. **Greeks Focus**: Which Greek is central to the lesson
6. **Time Horizon**: Same-day, weekly, monthly, quarterly expiration

#### System Prompt Template (Scenario Generator)
```python
SCENARIO_GENERATION_SYSTEM = """
You are a scenario generator for CapMan, a proprietary options trading firm.
Generate realistic trading scenarios that test specific options trading concepts.

CONTEXT DOCUMENTS (CapMan proprietary lexicon and standards):
{rag_context}

REQUIREMENTS:
- Use CapMan's specific terminology as defined in the context documents
- The scenario must test the following concept: {target_concept}
- Difficulty level: {difficulty} (1=beginner, 10=expert)
- Market regime: {regime}
- The learner should be required to make a specific trading decision

OUTPUT FORMAT (JSON):
{
  "scenario_text": "...",  // 2-4 paragraphs describing market situation
  "market_data": {          // Relevant data points
    "underlying": "SPY",
    "underlying_price": 500,
    "iv_rank": 45,
    "vix": 18,
    ...
  },
  "question_prompt": "...",  // The specific question asked of learner
  "target_objectives": ["OBJ-003", "OBJ-006"],
  "expected_answer_rubric": {
    "criteria": [
      {"criterion": "Correctly identifies market regime", "weight": 0.2, "points": 20},
      ...
    ]
  }
}
"""
```

#### Scenario Validation
Before storing generated scenarios:
1. LLM self-critique pass: Generate scenario → ask same LLM to evaluate coherence, difficulty calibration, and CapMan lexicon compliance.
2. Store with `quality_score` field. Only serve scenarios with `quality_score ≥ 0.7`.
3. Pre-generate scenario bank (asynchronously) so latency at serve-time is near-zero.

### 7.2 AI Grading Engine

#### Rubric-Based Evaluation (Research Finding)
2025 research shows: LLMs grading with explicit rubric criteria achieve ICC of 0.947-0.972 correlation with human graders. Key to high accuracy: **require the LLM to explicitly list which rubric criteria are satisfied** (not just give a score).

#### Grading System Prompt Template
```python
GRADING_SYSTEM = """
You are an expert options trading educator at CapMan grading a student response.

SCENARIO:
{scenario_text}

GRADING RUBRIC:
{rubric_criteria}  // JSON list of criteria, each with weight and description

STUDENT RESPONSE:
{student_response}

INSTRUCTIONS:
1. For each rubric criterion, determine if the student's response satisfies it.
2. Quote the specific part of the student's response that satisfies or fails each criterion.
3. Assign a score for each criterion.
4. Provide constructive feedback explaining what was correct and what was missing.
5. Identify which skill objectives the student demonstrated mastery of.

OUTPUT FORMAT (JSON):
{
  "criteria_evaluation": [...],
  "total_score": 0-100,
  "skill_objectives_demonstrated": [...],
  "feedback_summary": "...",
  "probing_questions": [...]  // 1-3 follow-up questions to deepen understanding
}
"""
```

#### Probing Follow-Up Agent
After initial grading, the AI generates 1-3 targeted follow-up questions based on gaps identified. The learner must respond to at least one probing question. This second response is also graded (with reduced weight) and can improve the final score.

### 7.3 RAG Architecture (Proprietary Document Integration)

#### Vector Database Options
- **pgvector** (PostgreSQL extension): Recommended for this project. Keeps all data in one database. Avoids external dependency. Supports cosine similarity search.
- **Pinecone**: Managed vector DB. Better for very large document corpora. Adds external dependency and cost.
- **Recommendation**: Use pgvector initially. Can migrate to Pinecone if needed.

#### RAG Pipeline (LangChain/Python)
```python
# Document ingestion (one-time + periodic updates)
from langchain.document_loaders import PDFLoader, DocxLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores.pgvector import PGVector

def ingest_capman_documents(file_path: str):
    loader = PDFLoader(file_path)  # or DocxLoader
    docs = loader.load()
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(docs)
    
    embeddings = OpenAIEmbeddings()
    vector_store = PGVector(
        connection_string=DATABASE_URL,
        embedding_function=embeddings,
        collection_name="capman_docs"
    )
    vector_store.add_documents(chunks)

# Retrieval at scenario generation time
def get_capman_context(query: str, k: int = 5) -> str:
    results = vector_store.similarity_search(query, k=k)
    return "\n\n".join([doc.page_content for doc in results])
```

#### Document Types to Support
- CapMan trading manuals / playbooks
- Proprietary strategy guides
- Internal lexicon glossaries
- Past educator-written model answers (as few-shot examples for grading)

### 7.4 LLM Provider Selection

| Provider | Strengths | Weaknesses | Use For |
|----------|-----------|------------|---------|
| OpenAI GPT-4o | Best general quality, fast | Cost | Grading (accuracy critical) |
| OpenAI GPT-4o-mini | Fast, cheap | Less nuanced | Scenario generation (bulk) |
| Anthropic Claude 3.5 Sonnet | Excellent at following rubrics | Cost | Grading (fallback/comparison) |
| Anthropic Claude 3 Haiku | Very fast, cheap | Less capable | Probing question generation |

**Recommendation**: GPT-4o-mini for scenario generation (bulk, cost-sensitive). GPT-4o or Claude 3.5 Sonnet for grading (accuracy-critical). Abstract behind a provider interface for easy switching.

### 7.5 AI Service Performance Considerations

- **Pre-generation**: Generate 50-100 scenarios per curriculum level nightly. Store in `scenarios` table. Serve from DB, not live generation (eliminates latency).
- **Grading latency**: Grading is synchronous and user-facing. Target < 5s. Use streaming responses to show partial feedback.
- **Rate limiting**: Implement request queue in FastAPI. Use Redis or in-memory queue for concurrent grading requests.
- **Caching**: Cache RAG context for common scenario types. Invalidate when new documents ingested.

---

## 8. Real-time Features

### 8.1 WebSocket vs SSE Decision

For this project:
- **Head-to-head challenges**: Requires **WebSockets** (bidirectional — both clients send/receive events in real time).
- **Leaderboard updates**: Can use **Server-Sent Events (SSE)** (unidirectional server push).
- **Challenge invitations and notifications**: SSE is sufficient.

**Critical deployment constraint**: Vercel serverless does NOT support WebSockets. Since we are deploying on Railway (not Vercel), this constraint does not apply. Railway supports long-running Node.js processes with WebSocket connections natively.

### 8.2 WebSocket Architecture (Head-to-Head)

#### Custom Server Approach (Recommended for Railway)
Next.js 16 does not natively support WebSocket servers — you need a custom `server.ts`:

```typescript
// server.ts (custom Next.js server)
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: process.env.NEXTAUTH_URL },
  });

  // Challenge room management
  const challengeRooms = new Map();

  io.on('connection', (socket) => {
    socket.on('join_challenge', (challengeId) => {
      socket.join(challengeId);
      // Notify both users when both have joined
    });

    socket.on('submit_response', async ({ challengeId, response }) => {
      // Store response, check if both submitted
      // If both submitted, trigger grading
      io.to(challengeId).emit('response_received', { userId: socket.data.userId });
    });

    socket.on('grading_complete', ({ challengeId, results }) => {
      io.to(challengeId).emit('challenge_results', results);
    });
  });

  httpServer.listen(3000);
});
```

#### Alternative: Separate WebSocket Service
For cleaner separation, run a dedicated Socket.io service on Railway:
- Next.js handles HTTP (port 3000)
- Socket.io service handles WebSockets (port 3001)
- Next.js client connects to Socket.io service URL

### 8.3 Real-time Leaderboard

SSE approach for leaderboard:
```typescript
// app/api/leaderboard/stream/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const leaderboard = await getTopLeaderboard(10);
        const data = `data: ${JSON.stringify(leaderboard)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }, 5000); // Update every 5 seconds

      // Clean up on disconnect
      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 9. Key Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI grading correlation too low with human educators | Medium | High | Establish baseline with human-graded test set; tune prompts; implement human review queue for low-confidence grades |
| LLM generates incoherent or off-lexicon scenarios | Medium | High | Pre-generate + validate scenario bank nightly; quality score filter; human review flagging |
| WebSocket latency in head-to-head challenges | Medium | Medium | Use Socket.io with Redis adapter for scalability; deploy WebSocket server on Railway close to DB |
| Database performance under real-time leaderboard load | Low | Medium | Cache leaderboard in Redis or Next.js cache; update asynchronously after XP events |
| RAG retrieval misses key CapMan context | Medium | High | Chunk size tuning; test retrieval quality with eval set; add metadata filters by document type |
| Next.js 16 is very new — potential breaking bugs | Low | Medium | Pin to specific minor version; monitor release notes; avoid experimental features in production |
| Railway cold starts affecting AI service latency | Medium | Medium | Keep Python service warm with health check pings; pre-warm with Railway's always-on option |
| Scope creep — platform has many features | High | High | Implement in phases: Curriculum → AI Grading → Gamification → MTSS Dashboard → Real-time Challenges |
| pgvector performance degradation at scale | Low | Medium | Index with `ivfflat` or `hnsw`; monitor query times; migrate to Pinecone if needed |
| Python service and Next.js service communication failures | Medium | High | Implement circuit breaker pattern; graceful degradation (show cached scenario if AI service down) |

---

## 10. Recommendations

### 10.1 Architecture Recommendations

1. **Separate the AI service from the start.** Do not use Next.js API routes for LLM calls. A dedicated Python FastAPI service is cleaner, independently scalable, and required for Atlas tooling integration.

2. **Use pgvector for RAG** rather than an external service. Simplifies the stack (one DB), sufficient for the document corpus size expected.

3. **Pre-generate scenario banks.** Do not call the LLM at user request time for scenario delivery. Generate and validate scenarios nightly. This eliminates the single biggest latency risk.

4. **Default to dark mode.** All serious trading platforms use dark UIs. Design the shadcn/ui theme with dark as primary.

5. **Use Socket.io** (not raw WebSockets) for the head-to-head challenge server. Socket.io provides room management, reconnection, and fallback transport out of the box.

6. **Use `next-auth` v5** (Auth.js) for authentication. Supports JWT sessions and database sessions. Role-based access needed: `learner`, `educator`, `admin`.

### 10.2 Database Schema Key Tables

The architect should design (at minimum) these tables:
- `users` — profile, XP, level, role, streak data
- `curriculum_levels` — the 10 levels with unlock requirements
- `skill_objectives` — the 12 objectives per curriculum level
- `scenarios` — pre-generated AI scenarios with quality scores
- `scenario_attempts` — each attempt with score, AI feedback, time spent
- `scenario_attempt_objectives` — junction: attempt → objectives tested, score per objective
- `mtss_classifications` — historical tier per user per objective
- `challenges` — head-to-head challenge records
- `challenge_participants` — junction: challenge → user, response, score
- `xp_events` — append-only log of all XP awards (for weekly leaderboard)
- `leaderboard_snapshots` — weekly snapshots for historical leaderboard
- `peer_reviews` — peer review submissions and scores
- `capman_documents` — metadata for ingested RAG documents
- `document_chunks` — pgvector embeddings for RAG retrieval

### 10.3 Phase Implementation Order

**Phase 1 — Foundation**: Project scaffolding, DB schema, auth, basic curriculum navigation, static scenario display.

**Phase 2 — AI Core**: Python FastAPI service, LLM integration, RAG pipeline, scenario generation, grading engine.

**Phase 3 — Gamification**: XP system, leveling, leaderboards (static then real-time), daily streaks.

**Phase 4 — MTSS Dashboard**: Skill objective tracking, tier classification, educator dashboard components.

**Phase 5 — Real-time Challenges**: WebSocket server, matchmaking, head-to-head challenge rooms, peer review.

**Phase 6 — UI Polish**: Motion animations throughout (XP bar, level-up celebrations, leaderboard transitions), responsive design audit, dark theme refinement, loading states, error boundaries, accessibility pass.

### 10.4 Unknowns for the Architect

1. **CapMan-specific proprietary lexicon**: The RAG system depends on these documents existing. The architect must assume placeholder documents initially, with a clear document ingestion workflow for the actual CapMan materials.

2. **Atlas tooling integration**: The spec mentions "integrates with Atlas (Python) to generate tooling relevant to CapMan." The nature of Atlas is unspecified. The architect must design an abstraction layer that can accommodate Atlas integration without knowing its API.

3. **Authentication provider**: The spec does not specify if CapMan uses SSO (SAML/OIDC with their corporate identity provider) or email/password. This affects auth implementation significantly.

4. **AI provider**: OpenAI vs. Anthropic vs. Azure OpenAI. Cost, rate limits, and data residency requirements need to be confirmed with Peak6.

5. **User scale**: How many concurrent learners? This affects WebSocket server sizing and DB connection pool sizing.

6. **Educator-to-learner ratio**: Affects MTSS dashboard design (one educator managing 20 learners vs. 200).

7. **"Next.js 16"** — The spec says "Use nextjs 16." Next.js 16.2 is the latest as of March 2026. Confirm whether 16.x latest is acceptable or if there is a version pin requirement.

8. **Real-time requirement strictness**: The spec says "low enough latency to support real-time competitive scenarios." Define the acceptable p95 latency for: (a) scenario delivery, (b) grading response, (c) challenge WebSocket events.

---

## Sources

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16)
- [Next.js 15 Release Blog](https://nextjs.org/blog/next-15)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs/theming)
- [Drizzle ORM Relations Documentation](https://orm.drizzle.team/docs/relations)
- [Motion (Framer Motion) Documentation](https://motion.dev/docs/react)
- [Option Greeks - The Options Playbook](https://www.optionsplaybook.com/options-introduction/option-greeks)
- [Options Greeks - Option Alpha](https://optionalpha.com/learn/options-greeks)
- [Vertical Spreads - Option Alpha](https://optionalpha.com/learn/vertical-spread)
- [Iron Condor - Options Playbook](https://www.optionsplaybook.com/option-strategies/iron-condor)
- [Market Regime Analysis - DayTradingToolkit](https://daytradingtoolkit.com/strategies/how-to-identify-market-regime/)
- [Aligning Options Strategies with Implied Volatility - Charles Schwab](https://www.schwab.com/learn/story/aligning-your-options-with-implied-volatility)
- [MTSS Tiers Explained - Panorama Education](https://www.panoramaed.com/blog/mtss-tiers-tier-1-2-and-3-explained)
- [MTSS Essential Components](https://mtss4success.org/essential-components)
- [LLM Rubric-Based Grading - Promptfoo](https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/llm-rubric/)
- [Advances in Auto-Grading with LLMs - ACL 2025](https://aclanthology.org/2025.bea-1.35.pdf)
- [RAG Architecture - IBM](https://www.ibm.com/think/topics/retrieval-augmented-generation)
- [WebSockets vs SSE in Next.js - HackerNoon](https://hackernoon.com/streaming-in-nextjs-15-websockets-vs-server-sent-events)
- [Next.js + FastAPI Integration Pattern](https://vintasoftware.github.io/nextjs-fastapi-template/)
- [Gamification XP Systems - Gamification For Teachers](https://gamificationforteachers.com/classroom-xp-systems/)
- [Options Position Sizing - Option Alpha](https://optionalpha.com/learn/position-sizing)
- [Railway PostgreSQL Documentation](https://docs.railway.com/databases/postgresql)
- [Next.js on Railway Deployment](https://railway.com/deploy/nextjs)
- [How to Use Drizzle ORM with PostgreSQL in Next.js 15 - Strapi](https://strapi.io/blog/how-to-use-drizzle-orm-with-postgresql-in-a-nextjs-15-project)
