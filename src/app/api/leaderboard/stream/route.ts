import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendData = async () => {
        try {
          const leaderboard = await db
            .select({
              id: users.id,
              name: users.name,
              xp: users.xp,
              level: users.level,
            })
            .from(users)
            .orderBy(desc(users.xp))
            .limit(50);

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(leaderboard)}\n\n`)
          );
        } catch {
          // Silently handle errors
        }
      };

      await sendData();
      const interval = setInterval(sendData, 5000);

      // Cleanup on abort
      const checkClosed = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":\n\n")); // heartbeat
        } catch {
          clearInterval(interval);
          clearInterval(checkClosed);
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
