import { FilterSidebar } from "@/features/people/components/filter-sidebar";
import { SearchBox } from "@/features/people/components/search-box";
import { PeopleList } from "@/features/people/components/people-list";

export function PeoplePage() {
  return (
    <div className="grid h-full grid-cols-[280px_1fr] grid-rows-[1fr]">
      <aside className="min-h-0 border-r bg-background">
        <FilterSidebar />
      </aside>
      <section className="flex min-h-0 flex-col">
        <header className="border-b p-4">
          <SearchBox />
        </header>
        <PeopleList />
      </section>
    </div>
  );
}
