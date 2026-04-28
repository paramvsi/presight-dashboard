import { parentPort } from "node:worker_threads";
import { faker } from "@faker-js/faker";

if (!parentPort) throw new Error("must run as a worker_thread");

type Incoming = { jobId: string; clientId: string };

parentPort.on("message", (msg: Incoming) => {
  setTimeout(() => {
    parentPort!.postMessage({
      jobId: msg.jobId,
      clientId: msg.clientId,
      result: faker.lorem.sentence(),
    });
  }, 2000);
});
