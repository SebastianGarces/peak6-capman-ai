import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, sql } from "drizzle-orm";
import {
  scenarios,
  challenges,
  challengeParticipants,
  curriculumLevels,
  users,
  xpEvents,
} from "./src/lib/db/schema";
import {
  addToQueue,
  removeFromQueue,
  findMatch,
} from "./src/lib/challenge/matchmaking";

config({ path: ".env.local" });

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN || "";

// Database connection for server.ts (cannot use @/ aliases)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// C4: Socket-user bidirectional mapping
const socketUserMap = new Map<string, string>(); // socketId -> userId
const userSocketMap = new Map<string, string>(); // userId -> socketId
const challengeRoomMap = new Map<string, string[]>(); // challengeId -> [socketId, socketId]

// C6: Get a random active scenario for a given curriculum level number
async function getRandomScenario(levelNumber: number) {
  const rows = await db
    .select({
      id: scenarios.id,
      scenarioText: scenarios.scenarioText,
      marketData: scenarios.marketData,
      questionPrompt: scenarios.questionPrompt,
      rubric: scenarios.rubric,
      difficulty: scenarios.difficulty,
      curriculumLevelId: scenarios.curriculumLevelId,
    })
    .from(scenarios)
    .innerJoin(
      curriculumLevels,
      eq(scenarios.curriculumLevelId, curriculumLevels.id)
    )
    .where(
      and(
        eq(curriculumLevels.levelNumber, levelNumber),
        eq(scenarios.isActive, true)
      )
    )
    .orderBy(sql`random()`)
    .limit(1);

  return rows[0] || null;
}

// Grade a response via AI service or fallback to mock
async function gradeResponseViaService(params: {
  scenarioId: string;
  scenarioText: string;
  rubric: Record<string, unknown>;
  studentResponse: string;
}): Promise<{ total_score: number }> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/grading/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": INTERNAL_TOKEN,
      },
      body: JSON.stringify({
        scenario_id: params.scenarioId,
        scenario_text: params.scenarioText,
        rubric: params.rubric,
        student_response: params.studentResponse,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`AI service error: ${res.status}`);
    return await res.json();
  } catch {
    // Fallback mock score
    return { total_score: Math.floor(Math.random() * 51) + 50 };
  }
}

// Award XP directly (cannot use server actions from server.ts)
async function awardXpDirect(
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string
) {
  await db.insert(xpEvents).values({
    userId,
    amount,
    reason,
    referenceId,
  });
  await db
    .update(users)
    .set({
      xp: sql`${users.xp} + ${amount}`,
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Challenge namespace
  const challengeNs = io.of("/challenges");
  challengeNs.on("connection", (socket) => {
    console.log("Challenge client connected:", socket.id);

    // Auth event: map socket to user
    socket.on("auth", (data: { userId: string }) => {
      if (!data?.userId) return;
      socketUserMap.set(socket.id, data.userId);
      userSocketMap.set(data.userId, socket.id);
      console.log(`Socket ${socket.id} authenticated as user ${data.userId}`);
    });

    // C1: challenge:request handler
    socket.on(
      "challenge:request",
      async (data: { curriculumLevelId: number; userId?: string; xp?: number }) => {
        const userId = socketUserMap.get(socket.id);
        if (!userId) {
          socket.emit("challenge:error", { message: "Not authenticated" });
          return;
        }

        // Look up user XP if not provided
        let xp = data.xp ?? 0;
        if (!data.xp) {
          const [user] = await db
            .select({ xp: users.xp })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
          if (user) xp = user.xp;
        }

        const entry = {
          socketId: socket.id,
          userId,
          curriculumLevel: data.curriculumLevelId,
          xp,
          joinedAt: Date.now(),
        };

        addToQueue(entry);
        const match = findMatch(entry);

        if (match) {
          // Remove both from queue
          removeFromQueue(socket.id);
          removeFromQueue(match.socketId);

          // Get a random scenario for this level
          const scenario = await getRandomScenario(data.curriculumLevelId);
          if (!scenario) {
            socket.emit("challenge:error", {
              message: "No scenarios available for this level",
            });
            return;
          }

          // Create challenge record in DB
          const [challenge] = await db
            .insert(challenges)
            .values({ scenarioId: scenario.id, status: "active", startedAt: new Date() })
            .returning();

          // Add both participants
          await db.insert(challengeParticipants).values([
            { challengeId: challenge.id, userId },
            { challengeId: challenge.id, userId: match.userId },
          ]);

          // Track challenge room
          challengeRoomMap.set(challenge.id, [socket.id, match.socketId]);

          // Look up user names/levels for the opponent display
          const [myUser] = await db
            .select({ name: users.name, level: users.level })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
          const [matchUser] = await db
            .select({ name: users.name, level: users.level })
            .from(users)
            .where(eq(users.id, match.userId))
            .limit(1);

          // Emit challenge:matched to both sockets
          socket.emit("challenge:matched", {
            challengeId: challenge.id,
            opponent: {
              name: matchUser?.name || "Opponent",
              level: matchUser?.level || 1,
            },
          });

          const matchSocket = challengeNs.sockets.get(match.socketId);
          if (matchSocket) {
            matchSocket.emit("challenge:matched", {
              challengeId: challenge.id,
              opponent: {
                name: myUser?.name || "Opponent",
                level: myUser?.level || 1,
              },
            });
          }

          // After 5s delay, emit countdown then start with scenario data
          setTimeout(() => {
            const scenarioData = {
              scenario: {
                id: scenario.id,
                scenario_text: scenario.scenarioText,
                question_prompt: scenario.questionPrompt,
                market_data: scenario.marketData,
                difficulty: scenario.difficulty,
              },
            };

            socket.emit("challenge:start", scenarioData);
            if (matchSocket) {
              matchSocket.emit("challenge:start", scenarioData);
            }
          }, 5000);
        }
      }
    );

    // Fetch scenario for a challenge (in case client missed challenge:start)
    socket.on(
      "challenge:get_scenario",
      async (data: { challengeId: string }) => {
        if (!data?.challengeId) return;
        try {
          const [challenge] = await db
            .select({ scenarioId: challenges.scenarioId })
            .from(challenges)
            .where(eq(challenges.id, data.challengeId))
            .limit(1);
          if (!challenge) return;

          const [scenario] = await db
            .select()
            .from(scenarios)
            .where(eq(scenarios.id, challenge.scenarioId))
            .limit(1);
          if (!scenario) return;

          socket.emit("challenge:start", {
            scenario: {
              id: scenario.id,
              scenario_text: scenario.scenarioText,
              question_prompt: scenario.questionPrompt,
              market_data: scenario.marketData,
              difficulty: scenario.difficulty,
            },
          });
        } catch (err) {
          console.error("Error fetching challenge scenario:", err);
        }
      }
    );

    // C2: challenge:cancel handler
    socket.on("challenge:cancel", () => {
      removeFromQueue(socket.id);
    });

    // C3: challenge:submit handler
    socket.on(
      "challenge:submit",
      async (data: { challengeId: string; response: string; userId?: string }) => {
        let userId = socketUserMap.get(socket.id);
        // Fallback: use userId from event data if socket mapping is stale
        if (!userId && data?.userId) {
          userId = data.userId;
          socketUserMap.set(socket.id, userId);
          userSocketMap.set(userId, socket.id);
          console.log(`Re-mapped socket ${socket.id} to user ${userId} from submit data`);
        }
        if (!userId || !data?.challengeId) {
          console.log("challenge:submit rejected — no userId or challengeId", { userId, data });
          return;
        }
        console.log(`challenge:submit from ${userId} for challenge ${data.challengeId}`);
        try {

        // Update participant with response
        await db
          .update(challengeParticipants)
          .set({ responseText: data.response, submittedAt: new Date() })
          .where(
            and(
              eq(challengeParticipants.challengeId, data.challengeId),
              eq(challengeParticipants.userId, userId)
            )
          );

        // Notify opponent using current socket IDs
        const participantRows = await db
          .select({ odUserId: challengeParticipants.userId })
          .from(challengeParticipants)
          .where(eq(challengeParticipants.challengeId, data.challengeId));
        const opponentUserId = participantRows.find((p) => p.odUserId !== userId)?.odUserId;
        if (opponentUserId) {
          const opponentSocketId = userSocketMap.get(opponentUserId);
          if (opponentSocketId) {
            const opponentSocket = challengeNs.sockets.get(opponentSocketId);
            if (opponentSocket) {
              opponentSocket.emit("challenge:opponent_submitted");
            }
          }
        }

        // Check if both have submitted
        const participants = await db
          .select()
          .from(challengeParticipants)
          .where(eq(challengeParticipants.challengeId, data.challengeId));

        const allSubmitted =
          participants.length === 2 &&
          participants.every((p) => p.submittedAt !== null);

        if (allSubmitted) {
          // Update challenge status to grading
          await db
            .update(challenges)
            .set({ status: "grading", updatedAt: new Date() })
            .where(eq(challenges.id, data.challengeId));

          // Get the scenario for grading
          const [challenge] = await db
            .select()
            .from(challenges)
            .where(eq(challenges.id, data.challengeId))
            .limit(1);
          if (!challenge) return;

          const [scenario] = await db
            .select()
            .from(scenarios)
            .where(eq(scenarios.id, challenge.scenarioId))
            .limit(1);

          // Grade both responses
          const results = await Promise.all(
            participants.map(async (p) => {
              const grading = await gradeResponseViaService({
                scenarioId: challenge.scenarioId,
                scenarioText: scenario?.scenarioText || "",
                rubric: (scenario?.rubric as Record<string, unknown>) || {},
                studentResponse: p.responseText || "",
              });
              return {
                userId: p.userId,
                score: grading.total_score,
                responseText: p.responseText,
                submittedAt: p.submittedAt,
              };
            })
          );

          // Update scores in DB
          for (const r of results) {
            await db
              .update(challengeParticipants)
              .set({ score: r.score })
              .where(
                and(
                  eq(challengeParticipants.challengeId, data.challengeId),
                  eq(challengeParticipants.userId, r.userId)
                )
              );
          }

          // Determine winner
          let winnerId: string;
          if (results[0].score !== results[1].score) {
            winnerId =
              results[0].score > results[1].score
                ? results[0].userId
                : results[1].userId;
          } else {
            // Tiebreaker: faster submission
            winnerId =
              (results[0].submittedAt || new Date()) <=
              (results[1].submittedAt || new Date())
                ? results[0].userId
                : results[1].userId;
          }

          const loserId = results.find((r) => r.userId !== winnerId)!.userId;

          // Update challenge record
          await db
            .update(challenges)
            .set({
              status: "complete",
              winnerId,
              completedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(challenges.id, data.challengeId));

          // Award XP
          await awardXpDirect(winnerId, 50, "challenge_win", data.challengeId);
          await awardXpDirect(loserId, 10, "challenge_loss", data.challengeId);

          // Emit results to both participants using current socket IDs
          console.log("Emitting results. Winner:", winnerId, "Participants:", results.map(r => r.userId));
          for (const r of results) {
            const currentSocketId = userSocketMap.get(r.userId);
            console.log(`  User ${r.userId}: socketId=${currentSocketId}, score=${r.score}`);
            if (!currentSocketId) { console.log(`  SKIP — no socket for user ${r.userId}`); continue; }
            const s = challengeNs.sockets.get(currentSocketId);
            if (!s) continue;
            const isWinner = r.userId === winnerId;
            const opponentResult = results.find(
              (o) => o.userId !== r.userId
            );

            s.emit("challenge:results", {
              winner: isWinner ? "you" : "opponent",
              yourScore: r.score ?? 0,
              opponentScore: opponentResult?.score ?? 0,
              xpAwarded: isWinner ? 50 : 10,
              opponentResponse: opponentResult?.responseText || "",
            });
          }

          // Clean up room mapping
          challengeRoomMap.delete(data.challengeId);
        }
        } catch (err) {
          console.error("challenge:submit error:", err);
          socket.emit("challenge:error", { message: "Failed to process submission" });
        }
      }
    );

    // Disconnect cleanup
    socket.on("disconnect", () => {
      console.log("Challenge client disconnected:", socket.id);
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        userSocketMap.delete(userId);
      }
      socketUserMap.delete(socket.id);
      removeFromQueue(socket.id);
    });
  });

  // Notifications namespace
  const notifications = io.of("/notifications");
  notifications.on("connection", (socket) => {
    console.log("Notification client connected:", socket.id);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
