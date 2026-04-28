import { cn } from "@/lib/utils";

type Props = { text: string; isDone: boolean };

export function StreamOutput({ text, isDone }: Props) {
  if (!text) {
    return (
      <p className="text-sm text-muted-foreground">
        Click <span className="font-medium text-foreground">Start</span> to fetch a streamed paragraph.
      </p>
    );
  }
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-6 text-sm leading-relaxed text-card-foreground",
        isDone ? "whitespace-pre-line" : "whitespace-pre-wrap font-mono",
      )}
    >
      {text}
      {isDone ? null : <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-foreground/70 align-middle" />}
    </div>
  );
}
