import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { QueueJobAcceptedSchema, QueueJobRequestSchema } from "@presight/shared";
import { enqueue } from "@/lib/queue";

export const jobsRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/jobs",
    {
      bodyLimit: 256,
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        body: QueueJobRequestSchema,
        response: { 200: QueueJobAcceptedSchema },
      },
    },
    async (req) => enqueue({ clientId: req.body.clientId }),
  );
};
