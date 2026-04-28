import { ProblemDetailSchema } from "@presight/shared";
import type { ZodType } from "zod";

const BASE = (import.meta.env.VITE_API_BASE ?? "/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type GetOpts = { signal?: AbortSignal; query?: Record<string, string | number | string[] | undefined> };

function buildUrl(path: string, query?: GetOpts["query"]) {
  const url = new URL(`${BASE}${path.startsWith("/") ? path : `/${path}`}`, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) for (const item of v) url.searchParams.append(k, item);
      else url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function readProblem(res: Response): Promise<string> {
  const fallback = `Request failed (${res.status})`;
  const parsed = await res
    .json()
    .then((body) => ProblemDetailSchema.safeParse(body))
    .catch(() => null);
  if (!parsed?.success) return fallback;
  return parsed.data.detail ?? parsed.data.title ?? fallback;
}

export async function apiGet<T>(path: string, schema: ZodType<T>, opts: GetOpts = {}): Promise<T> {
  const res = await fetch(buildUrl(path, opts.query), { signal: opts.signal });
  if (!res.ok) throw new ApiError(await readProblem(res), res.status);
  return schema.parse(await res.json());
}

export async function apiPost<TReq, TRes>(
  path: string,
  body: TReq,
  schema: ZodType<TRes>,
  opts: { signal?: AbortSignal } = {},
): Promise<TRes> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  if (!res.ok) throw new ApiError(await readProblem(res), res.status);
  return schema.parse(await res.json());
}
