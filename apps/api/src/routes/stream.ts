import type { FastifyPluginAsync } from "fastify";
import { faker } from "@faker-js/faker";

export const streamRoute: FastifyPluginAsync = async (app) => {
  app.get("/api/stream", async (_req, reply) => {
    const text = faker.lorem.paragraphs(32, "\n\n");
    reply
      .header("Content-Type", "text/plain; charset=utf-8")
      .header("Cache-Control", "no-cache")
      .send(text);
  });
};
