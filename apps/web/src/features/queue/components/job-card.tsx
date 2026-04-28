import { Loader2, CheckCircle2 } from "lucide-react";
import type { Job } from "@/features/queue/store/queue-store";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ID_PREVIEW = 8;

export function JobCard({ job, index }: { job: Job; index: number }) {
  const isDone = job.status === "done";
  return (
    <Card className={cn("transition-colors", isDone ? "" : "border-dashed")}>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">#{(index + 1).toString().padStart(2, "0")}</span>
          <span className="font-mono opacity-60">{job.jobId.slice(0, ID_PREVIEW)}</span>
        </div>
        {isDone ? (
          <div className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm leading-snug">{job.result}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>pending…</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
