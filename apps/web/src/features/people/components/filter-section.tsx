import type { FacetItem } from "@presight/shared";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  items: FacetItem[];
  active: string[];
  onToggle: (value: string) => void;
};

export function FilterSection({ title, items, active, onToggle }: Props) {
  const set = new Set(active);
  return (
    <section>
      <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const isActive = set.has(item.value);
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onToggle(item.value)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                isActive
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.value}
              <span className="ml-1.5 tabular-nums opacity-60">{item.count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
