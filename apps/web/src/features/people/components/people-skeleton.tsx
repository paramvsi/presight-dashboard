import { Skeleton } from "@/components/ui/skeleton";

export function PeopleSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-[112px] w-full" />
      ))}
    </div>
  );
}
