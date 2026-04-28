import { useFacetsQuery } from "@/features/people/hooks/use-facets-query";
import { useFiltersStore } from "@/features/people/store/filters-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { FilterSection } from "@/features/people/components/filter-section";
import { Button } from "@/components/ui/button";

export function FilterSidebar() {
  const { data, isLoading } = useFacetsQuery();
  const hobbies = useFiltersStore((s) => s.hobbies);
  const nationalities = useFiltersStore((s) => s.nationalities);
  const toggleHobby = useFiltersStore((s) => s.toggleHobby);
  const toggleNationality = useFiltersStore((s) => s.toggleNationality);
  const clear = useFiltersStore((s) => s.clear);
  const hasActive = hobbies.length + nationalities.length > 0;

  if (isLoading || !data) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <FilterSection
        title="Hobbies"
        items={data.topHobbies}
        active={hobbies}
        onToggle={toggleHobby}
      />
      <Separator />
      <FilterSection
        title="Nationalities"
        items={data.topNationalities}
        active={nationalities}
        onToggle={toggleNationality}
      />
      {hasActive ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={clear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
