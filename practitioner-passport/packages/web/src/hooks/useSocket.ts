import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
  }
  return socket;
}

export function useChatSocket(
  conversationId: number | null,
  onNewMessage: (message: unknown) => void,
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!conversationId) return;

    const s = getSocket();
    s.emit("join-conversation", conversationId);

    const handler = (msg: unknown) => callbackRef.current(msg);
    s.on("new-message", handler);

    return () => {
      s.emit("leave-conversation", conversationId);
      s.off("new-message", handler);
    };
  }, [conversationId]);
}
