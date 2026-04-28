import { Worker } from "node:worker_threads";
import { availableParallelism } from "node:os";
import { randomUUID } from "node:crypto";
import { send } from "@/lib/ws-registry";

type WorkerOut = { jobId: string; clientId: string; result: string };

const workerUrl = new URL(
  import.meta.url.endsWith(".ts") ? "../workers/job-worker.ts" : "./workers/job-worker.js",
  import.meta.url,
);

const POOL_SIZE = Math.max(2, Math.min(availableParallelism(), 4));

let pool: Worker[] = [];
let nextWorker = 0;

function spawn(slot: number) {
  const w = new Worker(workerUrl);
  w.on("message", (msg: WorkerOut) => {
    send(msg.clientId, {
      type: "job_result",
      jobId: msg.jobId,
      result: msg.result,
      completedAt: new Date().toISOString(),
    });
  });
  // a thrown error inside the worker (or crash exit) leaves a dead slot;
  // respawn so the pool keeps full capacity.
  const replace = (reason: string, err?: unknown) => {
    if (pool[slot] !== w) return;
    console.error(`worker slot ${slot} ${reason}`, err ?? "");
    pool[slot] = spawn(slot);
  };
  w.on("error", (err) => replace("errored", err));
  w.on("exit", (code) => {
    if (code !== 0) replace(`exited with code ${code}`);
  });
  return w;
}

export function initQueue() {
  if (pool.length > 0) return;
  pool = Array.from({ length: POOL_SIZE }, (_, i) => spawn(i));
}

export async function shutdownQueue() {
  const workers = pool;
  pool = [];
  await Promise.all(workers.map((w) => w.terminate()));
}

export function enqueue({ clientId }: { clientId: string }) {
  if (pool.length === 0) initQueue();
  const jobId = randomUUID();
  const worker = pool[nextWorker % pool.length]!;
  nextWorker++;
  worker.postMessage({ jobId, clientId });
  return { jobId, status: "pending" as const };
}
