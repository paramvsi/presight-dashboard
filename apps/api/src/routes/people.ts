import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { PeoplePageSchema, PeopleQuerySchema } from "@presight/shared";
import { queryPeople } from "@/lib/dataset";

export const peopleRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/people",
    {
      schema: {
        querystring: PeopleQuerySchema,
        response: { 200: PeoplePageSchema },
      },
    },
    async (req) => queryPeople(req.query),
  );
};
