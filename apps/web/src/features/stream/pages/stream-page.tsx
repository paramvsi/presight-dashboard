import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStream } from "@/features/stream/hooks/use-stream";
import { StreamOutput } from "@/features/stream/components/stream-output";

const labels: Record<ReturnType<typeof useStream>["status"], string> = {
  idle: "Idle",
  streaming: "Streaming",
  done: "Done",
  error: "Error",
};

export function StreamPage() {
  const { status, text, error, start, cancel } = useStream();
  const busy = status === "streaming";

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 overflow-y-auto p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Streaming text</h1>
        <Badge variant={status === "error" ? "outline" : "secondary"}>{labels[status]}</Badge>
      </header>
      <div className="flex gap-2">
        <Button onClick={start} disabled={busy} size="sm">
          <Play className="h-4 w-4" />
          {status === "done" ? "Restart" : "Start"}
        </Button>
        <Button onClick={cancel} disabled={!busy} size="sm" variant="outline">
          <Square className="h-4 w-4" />
          Cancel
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <StreamOutput text={text} isDone={status === "done"} />
    </div>
  );
}
