import { AlertCircle } from "lucide-react";

export function PeopleListError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "unknown error";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-6 w-6" />
      <p>Failed to load people: {message}</p>
    </div>
  );
}
