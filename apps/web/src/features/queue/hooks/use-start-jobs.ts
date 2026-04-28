import { useState } from "react";
import { QueueJobAcceptedSchema, QueueJobRequestSchema } from "@presight/shared";
import { apiPost } from "@/lib/api";
import { useQueueStore } from "@/features/queue/store/queue-store";

export function useStartJobs(count = 20) {
  const clientId = useQueueStore((s) => s.clientId);
  const addPending = useQueueStore((s) => s.addPending);
  const reset = useQueueStore((s) => s.reset);
  const [submitting, setSubmitting] = useState(false);

  const start = async () => {
    if (submitting) return;
    setSubmitting(true);
    reset();
    const body = QueueJobRequestSchema.parse({ clientId });
    const requests = Array.from({ length: count }, () =>
      apiPost("/jobs", body, QueueJobAcceptedSchema),
    );
    const responses = await Promise.allSettled(requests);
    for (const r of responses) {
      if (r.status === "fulfilled") addPending(r.value.jobId);
    }
    setSubmitting(false);
  };

  return { start, submitting };
}
