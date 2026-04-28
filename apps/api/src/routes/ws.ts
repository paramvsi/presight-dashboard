import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { register, unregister } from "@/lib/ws-registry";

const QuerySchema = z.object({ clientId: z.string().uuid() });
const PING_INTERVAL_MS = 30_000;

export const wsRoute: FastifyPluginAsync = async (app) => {
  app.get("/ws", { websocket: true }, (socket, req) => {
    const parsed = QuerySchema.safeParse(req.query);
    if (!parsed.success) {
      socket.close(1008, "missing or invalid clientId");
      return;
    }
    const { clientId } = parsed.data;
    register(clientId, socket);
    req.log.info({ clientId }, "ws client connected");

    // keep idle sockets alive through proxies that close after ~60s of silence
    const ping = setInterval(() => {
      if (socket.readyState === socket.OPEN) socket.ping();
    }, PING_INTERVAL_MS);

    socket.on("close", () => {
      clearInterval(ping);
      unregister(clientId);
      req.log.info({ clientId }, "ws client disconnected");
    });
  });
};
