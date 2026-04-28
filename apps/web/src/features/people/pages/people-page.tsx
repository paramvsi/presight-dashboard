import { FilterSidebar } from "@/features/people/components/filter-sidebar";
import { SearchBox } from "@/features/people/components/search-box";
import { PeopleList } from "@/features/people/components/people-list";

export function PeoplePage() {
  return (
    <div className="grid h-full grid-cols-[280px_1fr]">
      <aside className="border-r bg-background">
        <FilterSidebar />
      </aside>
      <section className="flex h-full flex-col">
        <header className="border-b p-4">
          <SearchBox />
        </header>
        <PeopleList />
      </section>
    </div>
  );
}
