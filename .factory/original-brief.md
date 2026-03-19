EdTeam AI Gauntlet Proposal

1) Project Title: CapMan AI: Gamified Scenario Training & MTSS Agent
2) Project overview:
Design and build an AI-driven training agent designed to maximize learner engagement
and mastery through iterative exposure to diverse market regimes. The system will
create a flexible, mastery-based learning pathway that exposes students to various
trading concepts, trade analysis, and decision-making scenarios, wrapped in a gamified
experience. The platform automates the feedback loop, using AI to drive specific
learning outcomes while providing educators with real-time MTSS intervention data.
3) Problem Statement:
● Capacity Bottleneck: Deep reflection and high-repetition training are core
strengths but are currently limited by human bandwidth and market environment.
● Scalability Gap: The current manual model cannot generate the volume of
unique, complex scenarios required for the long-term vision of the TA program.
● Engagement & Tracking: The program lacks a centralized, gamified system to
drive high engagement and automatically track granular performance data for
MTSS framework
4) Business Context and Impact
a) Business Context
The educational model relies on trading scenario repetition to reinforce complex
trading concepts. This project automates and expands the existing repetition
methodology. The solution must incorporate Trading Data Team context
documents to enforce proprietary CapMan lexicon and specialized options
trading logic. This ensures that automated repetitions reflect the firm’s specific
trading nuances rather than generic financial theory.
b) Key Impact Metrics
■ High user retention driven by gamification loops (XP, leaderboards).
■ System ability to generate high volumes of unique, coherent scenarios
without latency.
■ High correlation between AI-assigned grades and human-educator
benchmarks.
5) Technical Requirements
a) Required Programming Languages: Python (AI/Data logic) required to
integrate with Atlas tooling. Can use any language for Interactive UI.
b) AI/ML Frameworks: LLMs (Grading/Context), RAG (Retrieval-Augmented
Generation for proprietary docs).
c) Development Tools: Scenario generation engine, Gamification logic libraries
(scoring, matchmaking).

d) Other Specific Requirements:
■ Multi-User Engine: Support for real-time interaction, head-to-head
challenges, and peer review.
■ Dynamic Leaderboards: Real-time ranking systems based on mastery
and repetition volume.
■ Objective based MTSS Reporting: Track learner performance against
specific key learning objectives. Dashboards provide granular
visualization of this progress to identify intervention needs at the specific
skill level, rather than just an aggregate score.

6) Success criteria
a) What Does Success Look Like:
■ A functional learning platform where the AI Agent autonomously
generates and evaluates the user response for a trading scenario.
■ The system successfully "gamifies" the experience (e.g., unlocking levels
based on mastery, leaderboards, live multi-player challenges).
■ Educators have a "God View" dashboard to see real-time learner
grouping by skill level.

b) Functional Requirements (Must Haves):
■ Dynamic Scenario Generator: AI creates varied prompts (not static
hard-coded questions) requiring analysis. Integrates with Atlas (Python) to
generate tooling relevant to CapMan
■ Probing & Grading Agent: AI asks follow-up questions ("Why did you
choose that strike?") and grades the reasoning, not just the answer.
■ Gamification Layer: XP systems, leaderboards, and competitive
"head-to-head" analysis challenges.
■ Peer Review Module: A mechanism for users to evaluate each other's
responses.
■ MTSS Reporting: Automated classification of users into support tiers
based on performance data.
c) Performance Benchmarks:
■ AI grading correlation with educator standards.
■ System latency low enough to support real-time competitive scenarios.
d) Code Quality Expectations:
■ Modular architecture to allow easy addition of new scenario types.
■ Robust data logging for long-term trajectory tracking.

Tech decisions:
- Use nextjs 16
- Use shadcn/ui and tailwind
- Use motion (fka. framer-motion)
- Use drizzle for db
- Postgres (latest) use docker-compose to spin up local db
- Deployment will be in railway

Research:
Make sure you do proper research for the lessons the platform will teach.

Make sure at the end there is some tasks to polish the UI, the end should be a polish UI. This is important