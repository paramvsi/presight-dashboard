import type { FastifyPluginAsync } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

export const securityPlugin: FastifyPluginAsync = async (app) => {
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: corsOrigin, credentials: true });
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
    // /api/stream is long-lived and /ws upgrades; exempt them from the global limiter.
    allowList: (req) => req.url.startsWith("/api/stream") || req.url.startsWith("/ws"),
  });
  await app.register(sensible);
};
