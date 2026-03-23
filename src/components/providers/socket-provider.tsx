"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
  challengeSocket: Socket | null;
  notificationSocket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  challengeSocket: null,
  notificationSocket: null,
  isConnected: false,
});

export function SocketProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  const [isConnected, setIsConnected] = useState(false);

  const sockets = useMemo(() => {
    // Only create sockets on the client
    if (typeof window === "undefined") return { challenge: null, notification: null };

    const challenge = io("/challenges", {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    const notification = io("/notifications", {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    return { challenge, notification };
  }, []);

  useEffect(() => {
    const cs = sockets.challenge;
    if (!cs) return;

    const onConnect = () => {
      setIsConnected(true);
      if (userId) {
        cs.emit("auth", { userId });
      }
    };
    const onDisconnect = () => setIsConnected(false);

    cs.on("connect", onConnect);
    cs.on("disconnect", onDisconnect);

    // If already connected (reconnect scenario), emit auth
    if (cs.connected && userId) {
      cs.emit("auth", { userId });
    }

    return () => {
      cs.off("connect", onConnect);
      cs.off("disconnect", onDisconnect);
    };
  }, [sockets.challenge, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sockets.challenge?.disconnect();
      sockets.notification?.disconnect();
    };
  }, [sockets]);

  return (
    <SocketContext.Provider
      value={{
        challengeSocket: sockets.challenge,
        notificationSocket: sockets.notification,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
