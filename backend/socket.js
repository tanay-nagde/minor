// backend/socket.js
import { Server } from "socket.io";

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for dev - update in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    // Join room (canvas session)
    socket.on("join-canvas", (canvasId) => {
      socket.join(canvasId);
      console.log(`🧑 Socket ${socket.id} joined canvas: ${canvasId}`);
    });

    // Receive updates from one client and broadcast to others in the same room
    socket.on("canvas-update", ({ canvasId, senderId, elements }) => {
      console.log(
        `[Server] Received update from ${senderId} in room ${canvasId}, elemts-${elements} broadcasting...`
      );
      socket.to(canvasId).emit("canvas-update", { senderId, elements });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  return io;
}
