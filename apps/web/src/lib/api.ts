import type { ZodType } from "zod";

const BASE = (import.meta.env.VITE_API_BASE ?? "/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
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

export async function apiGet<T>(path: string, schema: ZodType<T>, opts: GetOpts = {}): Promise<T> {
  const res = await fetch(buildUrl(path, opts.query), { signal: opts.signal });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new ApiError(body?.detail ?? `Request failed (${res.status})`, res.status, body);
  }
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
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new ApiError(detail?.detail ?? `Request failed (${res.status})`, res.status, detail);
  }
  return schema.parse(await res.json());
}
