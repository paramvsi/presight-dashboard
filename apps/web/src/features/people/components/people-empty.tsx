import { UserSearch } from "lucide-react";

export function PeopleEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <UserSearch className="h-8 w-8" />
      <p className="text-sm">No people match these filters.</p>
    </div>
  );
}
