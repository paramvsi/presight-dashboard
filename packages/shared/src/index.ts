import { z } from "zod";

export const PersonSchema = z.object({
  id: z.string().uuid(),
  avatar: z.string().url(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  age: z.number().int().min(0).max(120),
  nationality: z.string().min(1),
  hobbies: z.array(z.string()).max(10),
});
export type Person = z.infer<typeof PersonSchema>;

export const PeopleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  nationalities: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),
});
export type PeopleQuery = z.infer<typeof PeopleQuerySchema>;

export const PeoplePageSchema = z.object({
  items: z.array(PersonSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  hasMore: z.boolean(),
});
export type PeoplePage = z.infer<typeof PeoplePageSchema>;

export const FacetItemSchema = z.object({
  value: z.string(),
  count: z.number().int().min(0),
});
export type FacetItem = z.infer<typeof FacetItemSchema>;

export const FacetsResponseSchema = z.object({
  topHobbies: z.array(FacetItemSchema).max(20),
  topNationalities: z.array(FacetItemSchema).max(20),
});
export type FacetsResponse = z.infer<typeof FacetsResponseSchema>;

export const QueueJobRequestSchema = z.object({
  clientId: z.string().uuid(),
});
export type QueueJobRequest = z.infer<typeof QueueJobRequestSchema>;

export const QueueJobAcceptedSchema = z.object({
  jobId: z.string().uuid(),
  status: z.literal("pending"),
});
export type QueueJobAccepted = z.infer<typeof QueueJobAcceptedSchema>;

export const QueueResultMessageSchema = z.object({
  type: z.literal("job_result"),
  jobId: z.string().uuid(),
  result: z.string(),
  completedAt: z.string().datetime(),
});
export type QueueResultMessage = z.infer<typeof QueueResultMessageSchema>;

export const ServerToClientMessageSchema = z.discriminatedUnion("type", [
  QueueResultMessageSchema,
]);
export type ServerToClientMessage = z.infer<typeof ServerToClientMessageSchema>;

export const ProblemDetailSchema = z
  .object({
    type: z.string().optional(),
    title: z.string().optional(),
    status: z.number().int().optional(),
    detail: z.string().optional(),
  })
  .passthrough();
export type ProblemDetail = z.infer<typeof ProblemDetailSchema>;
