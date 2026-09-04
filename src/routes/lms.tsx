import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { LayoutDashboard, BookOpen, ClipboardList, Award, BarChart3, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lms")({
  component: LmsLayout,
});

const NAV_ITEMS = [
  { to: "/lms/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/lms/my-learning", label: "My Learning", icon: BookOpen },
  { to: "/lms/quizzes", label: "Quiz Master", icon: ClipboardList },
  { to: "/lms/assessments", label: "Assessments", icon: GraduationCap },
  { to: "/lms/reports", label: "Reports", icon: BarChart3 },
];

function LmsLayout() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <AppShell>
      <div className="flex gap-6">
        {/* LMS Sidebar */}
        <aside className="w-52 shrink-0">
          <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-white">
                  <GraduationCap className="size-4" />
                </div>
                <span className="font-display text-sm font-bold text-slate-900">LMS Portal</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Learning & Assessment</p>
            </div>
            <nav className="p-2 space-y-0.5">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const isActive = to === "/lms/"
                  ? currentPath === "/lms" || currentPath === "/lms/"
                  : currentPath.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                      isActive
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* LMS Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}
