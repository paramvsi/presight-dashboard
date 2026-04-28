import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const HealthResponse = z.object({ status: z.literal("ok"), uptime: z.number() });

export const healthRoute: FastifyPluginAsync = async (app) => {
  app.get(
    "/health",
    { schema: { response: { 200: HealthResponse } } },
    async () => ({ status: "ok" as const, uptime: process.uptime() }),
  );
};
