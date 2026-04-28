import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueueStore } from "@/features/queue/store/queue-store";
import { useQueueSocket } from "@/features/queue/hooks/use-queue-socket";
import { useStartJobs } from "@/features/queue/hooks/use-start-jobs";
import { JobCard } from "@/features/queue/components/job-card";

const JOB_COUNT = 20;

const statusLabels = { connecting: "Connecting", open: "Connected", closed: "Disconnected" } as const;

export function QueuePage() {
  const wsStatus = useQueueSocket();
  const { start, submitting } = useStartJobs(JOB_COUNT);
  const jobOrder = useQueueStore((s) => s.jobOrder);
  const jobs = useQueueStore((s) => s.jobs);
  const completed = jobOrder.filter((id) => jobs[id]?.status === "done").length;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Worker queue</h1>
          <p className="text-xs text-muted-foreground">
            POST enqueues a job; the worker pool sends results back over a WebSocket.
          </p>
        </div>
        <Badge variant={wsStatus === "open" ? "secondary" : "outline"}>{statusLabels[wsStatus]}</Badge>
      </header>
      <div className="flex items-center gap-3">
        <Button onClick={start} disabled={submitting || wsStatus !== "open"} size="sm">
          <Play className="h-4 w-4" />
          Start {JOB_COUNT} Jobs
        </Button>
        {jobOrder.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {completed} / {jobOrder.length} complete
          </span>
        ) : null}
      </div>
      {jobOrder.length === 0 ? (
        <p className="text-sm text-muted-foreground">No jobs yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {jobOrder.map((id, idx) => {
            const job = jobs[id];
            if (!job) return null;
            return <JobCard key={id} job={job} index={idx} />;
          })}
        </div>
      )}
    </div>
  );
}
