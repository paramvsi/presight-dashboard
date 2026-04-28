import { useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Person } from "@presight/shared";
import { PersonCard } from "@/features/people/components/person-card";
import { PeopleEmpty } from "@/features/people/components/people-empty";
import { PeopleSkeleton } from "@/features/people/components/people-skeleton";
import { PeopleListError } from "@/features/people/components/people-list-error";
import { usePeopleQuery } from "@/features/people/hooks/use-people-query";
import { useFiltersStore } from "@/features/people/store/filters-store";
import { useDebouncedValue } from "@/features/people/hooks/use-debounced-value";

const ROW_HEIGHT = 128;
const PREFETCH_GAP = 5;

export function PeopleList() {
  const search = useFiltersStore((s) => s.search);
  const hobbies = useFiltersStore((s) => s.hobbies);
  const nationalities = useFiltersStore((s) => s.nationalities);
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    usePeopleQuery({ search: debouncedSearch, hobbies, nationalities });

  const items: Person[] = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastIndex = virtualItems.at(-1)?.index ?? 0;

  useEffect(() => {
    // virtualizer reports the range — fetch next page when within 5 of the end
    if (!hasNextPage || isFetchingNextPage) return;
    if (lastIndex >= items.length - PREFETCH_GAP) fetchNextPage();
  }, [lastIndex, items.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <PeopleSkeleton />;
  if (isError) return <PeopleListError error={error} />;
  if (items.length === 0) return <PeopleEmpty />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <span>
          {items.length.toLocaleString()} of {total.toLocaleString()}
        </span>
        {isFetchingNextPage ? <span>Loading more…</span> : null}
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto px-4 pb-6">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualItems.map((row) => {
            const person = items[row.index];
            if (!person) return null;
            return (
              <div
                key={person.id}
                ref={virtualizer.measureElement}
                data-index={row.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${row.start}px)`,
                  paddingBottom: 12,
                }}
              >
                <PersonCard person={person} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
