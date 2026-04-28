type Props = { text: string; isDone: boolean };

export function StreamOutput({ text, isDone }: Props) {
  if (!text) {
    return (
      <p className="text-sm text-muted-foreground">
        Click <span className="font-medium text-foreground">Start</span> to fetch a streamed response.
      </p>
    );
  }

  if (isDone) {
    const paragraphs = text.split(/\n\n+/);
    return (
      <article className="rounded-lg border bg-card p-8 text-card-foreground">
        <div className="mx-auto max-w-prose space-y-4 text-base leading-7">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
    );
  }

  return (
    <div className="whitespace-pre-wrap rounded-lg border bg-card p-6 font-mono text-sm leading-relaxed text-card-foreground">
      {text}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse bg-foreground/70"
      />
    </div>
  );
}
