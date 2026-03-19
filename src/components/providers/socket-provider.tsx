"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  challengeSocket: Socket | null;
  notificationSocket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  challengeSocket: null,
  notificationSocket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [challengeSocket, setChallengeSocket] = useState<Socket | null>(null);
  const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const challengeSock = io("/challenges", {
      autoConnect: true,
      reconnection: true,
    });

    const notifSock = io("/notifications", {
      autoConnect: true,
      reconnection: true,
    });

    challengeSock.on("connect", () => setIsConnected(true));
    challengeSock.on("disconnect", () => setIsConnected(false));

    setChallengeSocket(challengeSock);
    setNotificationSocket(notifSock);

    return () => {
      challengeSock.disconnect();
      notifSock.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ challengeSocket, notificationSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
