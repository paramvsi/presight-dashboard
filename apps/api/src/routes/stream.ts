import type { FastifyPluginAsync } from "fastify";
import { faker } from "@faker-js/faker";

const CHUNK_SIZE = 8;
const CHUNK_DELAY_MS = 15;

export const streamRoute: FastifyPluginAsync = async (app) => {
  app.get("/api/stream", async (req, reply) => {
    const text = faker.lorem.paragraphs(32, "\n\n");
    reply.raw.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    });
    reply.hijack();

    const onClose = () => {
      req.log.debug("stream client disconnected");
    };
    reply.raw.on("close", onClose);

    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      if (reply.raw.destroyed) return;
      reply.raw.write(text.slice(i, i + CHUNK_SIZE));
      await new Promise((r) => setTimeout(r, CHUNK_DELAY_MS));
    }

    reply.raw.end();
  });
};
