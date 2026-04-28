import Fastify, { type FastifyError } from "fastify";
import { ZodError } from "zod";
import { applyZod, type ZodTypeProvider } from "@/plugins/zod";
import { securityPlugin } from "@/plugins/security";
import { healthRoute } from "@/routes/health";

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";

const isDev = process.env.NODE_ENV !== "production";

const app = Fastify({
  logger: {
    level: LOG_LEVEL,
    transport: isDev
      ? { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } }
      : undefined,
  },
}).withTypeProvider<ZodTypeProvider>();

applyZod(app);

app.setErrorHandler((err: FastifyError, req, reply) => {
  if (err instanceof ZodError) {
    return reply.status(400).send({
      type: "about:blank",
      title: "Validation failed",
      status: 400,
      detail: err.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; "),
      issues: err.issues,
    });
  }

  const status = err.statusCode ?? 500;
  if (status >= 500) req.log.error({ err }, "request failed");
  return reply.status(status).send({
    type: "about:blank",
    title: err.name || "Error",
    status,
    detail: err.message,
  });
});

await app.register(securityPlugin);
await app.register(healthRoute);

app.listen({ port: PORT, host: HOST }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
