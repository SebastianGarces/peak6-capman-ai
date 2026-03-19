import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

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
  const challenges = io.of("/challenges");
  challenges.on("connection", (socket) => {
    console.log("Challenge client connected:", socket.id);

    socket.on("challenge:request", (data) => {
      // Matchmaking logic will be added in Task 40
    });

    socket.on("challenge:cancel", () => {
      // Cancel logic
    });

    socket.on("challenge:submit", (data) => {
      // Submit logic
    });

    socket.on("disconnect", () => {
      console.log("Challenge client disconnected:", socket.id);
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
