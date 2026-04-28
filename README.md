# Presight Dashboard

A three-feature take-home: a virtualized people list with faceted filters, a chunked-text streaming viewer, and a worker queue whose results are pushed back over WebSocket.

## Stack

| Area     | Choice                                                                  |
| -------- | ----------------------------------------------------------------------- |
| Monorepo | pnpm workspaces — `apps/web`, `apps/api`, `packages/shared`             |
| Shared   | Zod schemas + inferred TS types, consumed as `.ts` (no build step)      |
| Backend  | Fastify 5, `fastify-type-provider-zod`, `@fastify/websocket`, `worker_threads`, `@faker-js/faker` |
| Frontend | Vite, React 18, Tailwind + shadcn (slate), Zustand, React Query v5, `@tanstack/react-virtual`, `react-router-dom` |
| Tooling  | TypeScript strict everywhere, flat-config ESLint, Prettier, tsx + tsup  |

## Run

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm dev          # api on :3001, web on :5173 (Vite proxies /api and /ws)
pnpm typecheck
pnpm lint
pnpm build
```

Open `http://localhost:5173/`.

## Architecture

```
                      ┌──────────────── apps/web ────────────────┐
                      │                                          │
        /people  ────▶│  React Query  ──▶  apiGet  ──▶  /api/*   │──┐
        /stream  ────▶│  fetch+ReadableStream + RAF buffer       │  │
        /queue   ────▶│  Zustand jobs map  +  WebSocket          │──┤
                      └──────────────────────────────────────────┘  │
                                                                    │ Vite proxy
                      ┌──────────────── apps/api ────────────────┐  │
                      │  Fastify 5 + fastify-type-provider-zod   │◀─┘
                      │  helmet, cors, rate-limit, sensible      │
                      │                                          │
   GET /api/people  ─▶│  routes/people.ts  ─▶  lib/dataset.ts    │
   GET /api/facets  ─▶│  routes/facets.ts                        │
   GET /api/stream  ─▶│  routes/stream.ts (chunked write)        │
   POST /api/jobs   ─▶│  routes/jobs.ts ─▶ lib/queue.ts ┐        │
                      │                                 ▼        │
                      │                        worker_threads pool│
                      │                                 │        │
                      │                                 ▼        │
   WS /ws ?clientId ◀│  routes/ws.ts ◀─ lib/ws-registry.ts        │
                      └──────────────────────────────────────────┘
```

Dataset (~10k people) is generated once at startup with a fixed seed and held in memory. Facets are precomputed at startup. The worker pool is sized to `min(availableParallelism(), 4)` and dispatched round-robin. The `clientId` is generated in `sessionStorage` on first read and used both as the WebSocket subscription key and as the job request body.

## Decisions & Trade-offs

- **Fastify over Express.** Native `async/await`, schema-first validation via `fastify-type-provider-zod`, and a real plugin system. Express would need a stack of middleware to reach feature parity (zod-express, helmet, express-rate-limit, ws) — Fastify gives the same with one plugin call each.
- **Zustand over Redux.** Three small client-state slices (filters, queue jobs, WS status). Redux Toolkit is overkill for this scope and pushes you toward a global store you don't need. Zustand fits in a single file per slice with narrow selectors and no provider tree.
- **In-memory queue, not Redis/BullMQ.** The exercise asks for a worker pool with a 2-second timeout. Real production work would put a durable queue between the API and the workers (Redis Streams or BullMQ), give jobs idempotency keys, and move WS delivery into a separate fan-out service so it survives API restarts.
- **React Query for server state, Zustand for client state.** The boundary is enforced — fetched data lives only in React Query, never copied into Zustand. The infinite-people query passes the React Query `signal` into the fetch wrapper, so stale queries cancel automatically when filters change.
- **Virtualizer-driven infinite scroll, not a scroll listener.** `useVirtualizer().getVirtualItems()` already reports the visible range; an effect watches the last visible index and fires `fetchNextPage()` when it's within 5 of the end. No `onScroll` handler, no debouncing of scroll events.
- **RAF-batched stream rendering.** The `fetch` reader appends decoded chunks into a ref-buffer and schedules a single `requestAnimationFrame` flush. We get one render per frame instead of one per character, while still feeling character-by-character to the user.
- **No barrel files.** Imports point at the file that owns the export. Avoids tree-shaking pitfalls and makes the origin of any symbol obvious in a click-through.
