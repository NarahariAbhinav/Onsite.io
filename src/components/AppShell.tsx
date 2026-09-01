import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  FileText,
  HardHat,
  LayoutDashboard,
  Menu,
  Search,
  ClipboardList,
  Building2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { CURRENT_USER } from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/", label: "Projects", icon: Building2 },
  { to: "/sop-library", label: "SOP Library", icon: ClipboardList },
  { to: "/issues", label: "Issue Tracker", icon: AlertTriangle },
  { to: "/documents", label: "Documents", icon: FileText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => (to === "/" ? pathname === "/" || pathname.startsWith("/projects") : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          open ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary">
            <HardHat className="size-4.5 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">SiteFlow</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(to)
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/60">
          Site Blueprint · v1.0
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
          <button
            className="rounded-md p-2 hover:bg-secondary lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <Menu className="size-5" />
          </button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <input
              placeholder="Search projects, SOPs, issues…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full bg-steel/10 px-2.5 py-1 text-xs font-semibold text-steel sm:inline">
              {CURRENT_USER.role}
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-steel text-sm font-bold text-steel-foreground">
              RM
            </span>
          </div>
        </header>
        <main className="blueprint-grid min-h-[calc(100vh-4rem)] p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-steel lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
