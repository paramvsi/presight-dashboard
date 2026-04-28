import { Badge } from "@/components/ui/badge";

const VISIBLE = 2;

export function HobbyChips({ hobbies }: { hobbies: string[] }) {
  if (hobbies.length === 0) return null;
  const visible = hobbies.slice(0, VISIBLE);
  const overflow = hobbies.length - visible.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((h) => (
        <Badge key={h} variant="secondary" className="font-normal">
          {h}
        </Badge>
      ))}
      {overflow > 0 ? (
        <Badge variant="outline" className="font-normal text-muted-foreground">
          +{overflow}
        </Badge>
      ) : null}
    </div>
  );
}
