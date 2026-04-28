import type { ServerToClientMessage } from "@presight/shared";
import type { WebSocket } from "@fastify/websocket";

const sockets = new Map<string, WebSocket>();

export function register(clientId: string, socket: WebSocket) {
  sockets.set(clientId, socket);
}

export function unregister(clientId: string) {
  sockets.delete(clientId);
}

export function send(clientId: string, message: ServerToClientMessage) {
  const socket = sockets.get(clientId);
  if (!socket || socket.readyState !== socket.OPEN) return false;
  socket.send(JSON.stringify(message));
  return true;
}
