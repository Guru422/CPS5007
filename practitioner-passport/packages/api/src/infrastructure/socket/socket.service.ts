import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { config } from "../../shared/config/env";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: [config.webBaseUrl, "http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join-conversation", (conversationId: string | number) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("leave-conversation", (conversationId: string | number) => {
      socket.leave(`conv:${conversationId}`);
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}

export function emitNewMessage(conversationId: number, message: unknown) {
  if (io) {
    io.to(`conv:${conversationId}`).emit("new-message", message);
  }
}
