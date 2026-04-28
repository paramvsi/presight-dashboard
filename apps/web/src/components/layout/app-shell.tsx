import { NavLink, Outlet } from "react-router-dom";
import { Activity, ListFilter, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/people", label: "People", icon: ListFilter },
  { to: "/stream", label: "Stream", icon: Radio },
  { to: "/queue", label: "Queue", icon: Activity },
];

export function AppShell() {
  return (
    <div className="grid h-screen grid-cols-[220px_1fr] grid-rows-[1fr]">
      <aside className="border-r bg-muted/30 p-4">
        <div className="mb-6 px-2 text-sm font-semibold tracking-tight">Presight</div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
