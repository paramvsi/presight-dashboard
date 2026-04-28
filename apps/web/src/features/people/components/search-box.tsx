import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFiltersStore } from "@/features/people/store/filters-store";

export function SearchBox() {
  const search = useFiltersStore((s) => s.search);
  const setSearch = useFiltersStore((s) => s.setSearch);
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by first or last name"
        className="pl-9"
      />
    </div>
  );
}
