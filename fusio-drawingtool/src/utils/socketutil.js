import { socket } from "./socket";

export function connectSocket(canvasId) {
  if (!socket.connected) {
    socket.connect();

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected:", socket.id);
      socket.emit("join-canvas", canvasId);
    });
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
    console.log("[Socket.IO] Disconnected");
  }
}

export function emitCanvasUpdate(canvasId, senderId, elements) {
  if (!socket || !socket.connected) {
    console.error("[Socket.IO] Not connected, cannot emit update");
    return;
  }

  socket.emit("canvas-update", { canvasId, senderId, elements });
  console.log(`[Socket.IO] Emitted canvas update for ${canvasId} from ${senderId}`);
}
