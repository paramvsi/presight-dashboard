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

function spawn() {
  const w = new Worker(workerUrl);
  w.on("message", (msg: WorkerOut) => {
    send(msg.clientId, {
      type: "job_result",
      jobId: msg.jobId,
      result: msg.result,
      completedAt: new Date().toISOString(),
    });
  });
  w.on("error", (err) => {
    console.error("worker error", err);
  });
  return w;
}

export function initQueue() {
  if (pool.length > 0) return;
  pool = Array.from({ length: POOL_SIZE }, spawn);
}

export async function shutdownQueue() {
  await Promise.all(pool.map((w) => w.terminate()));
  pool = [];
}

export function enqueue({ clientId }: { clientId: string }) {
  if (pool.length === 0) initQueue();
  const jobId = randomUUID();
  const worker = pool[nextWorker % pool.length]!;
  nextWorker++;
  worker.postMessage({ jobId, clientId });
  return { jobId, status: "pending" as const };
}
