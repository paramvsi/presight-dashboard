import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { FacetsResponseSchema } from "@presight/shared";
import { getFacets } from "@/lib/dataset";

export const facetsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/facets",
    { schema: { response: { 200: FacetsResponseSchema } } },
    async () => getFacets(),
  );
};
