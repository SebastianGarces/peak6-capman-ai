import { auth } from "@/lib/auth";
import { popNotifications } from "@/lib/notifications/store";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendNotifications = () => {
        try {
          const notifications = popNotifications(userId);
          if (notifications.length > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(notifications)}\n\n`)
            );
          }
        } catch {
          // Silently handle errors
        }
      };

      sendNotifications();
      const interval = setInterval(sendNotifications, 3000);

      // Heartbeat to detect closed connections
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":\n\n"));
        } catch {
          clearInterval(interval);
          clearInterval(heartbeat);
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
