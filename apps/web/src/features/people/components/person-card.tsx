import { memo } from "react";
import type { Person } from "@presight/shared";
import { Card, CardContent } from "@/components/ui/card";
import { HobbyChips } from "@/features/people/components/hobby-chips";

type Props = { person: Person };

function PersonCardImpl({ person }: Props) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full gap-4 p-4">
        <img
          src={person.avatar}
          alt=""
          loading="lazy"
          decoding="async"
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium leading-tight">
                {person.first_name} {person.last_name}
              </div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{person.nationality}</div>
            </div>
            <div className="text-xs tabular-nums text-muted-foreground">{person.age}</div>
          </div>
          <HobbyChips hobbies={person.hobbies} />
        </div>
      </CardContent>
    </Card>
  );
}

export const PersonCard = memo(PersonCardImpl);
