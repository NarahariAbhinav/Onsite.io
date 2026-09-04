import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  FileText,
  HardHat,
  LayoutDashboard,
  Menu,
  X,
  ClipboardList,
  Building2,
  Plus,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Award,
  Home,
  ChevronRight,
  Sparkles,
  LogOut,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { CURRENT_USER, useSiteflow } from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";

// All navigation groups (used in sidebar)
export const NAV_GROUPS = [
  {
    title: "Overview & Analytics",
    items: [
      { to: "/", label: "Home", icon: Home, description: "Portal landing & standard tools" },
      { to: "/dashboard", label: "Executive & AI Dashboard", icon: LayoutDashboard, description: "Executive KPIs, COPQ, failure heatmap & AI risk advisory" },
    ],
  },
  {
    title: "Site Execution",
    items: [
      { to: "/projects", label: "Active Projects", icon: Building2, description: "Site scale, SOP execution & progress tracking" },
      { to: "/documents", label: "Quality Documents", icon: FileText, description: "Statutory drawings, certificates & test logs" },
    ],
  },
  {
    title: "SOP Governance & Quality",
    items: [
      { to: "/sop-library", label: "SOP Library & Versions", icon: ClipboardList, description: "Controlled master templates & revision lifecycle" },
      { to: "/audits", label: "SOP Audits & Findings", icon: CheckCircle2, description: "Site inspection checklists, deviations & scorecards" },
    ],
  },
  {
    title: "Learning & Competency (LMS)",
    items: [
      { to: "/lms", label: "LMS Portal & Dashboard", icon: GraduationCap, description: "Integrated learning, quizzes, assessments & reports" },
      { to: "/lms/my-learning", label: "My Learning", icon: BookOpen, description: "Assigned SOPs, study steps & exam gates" },
      { to: "/competency", label: "Competency Overview", icon: Award, description: "Qualifications & digital certificates" },
    ],
  },
  {
    title: "Continuous Improvement",
    items: [
      { to: "/issues", label: "Defects & CAPA Tracker", icon: AlertTriangle, description: "Non-conformance root cause & corrective action" },
    ],
  },
] as const;

// Quick links visible directly in the top navbar
const QUICK_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/projects", label: "Projects", icon: Building2 },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sop-library", label: "SOP Library", icon: ClipboardList },
  { to: "/lms", label: "LMS", icon: GraduationCap },
] as const;

export function AppShell({
  children,
  onAddProjectClick,
  fluid = false,
}: {
  children: ReactNode;
  onAddProjectClick?: () => void;
  fluid?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const state = useSiteflow();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  };

  // Badge counts
  const openIssuesCount = state.issues.filter(
    (i) => i.status === "Open" || i.status === "Assigned" || i.status === "In Progress"
  ).length;
  const pendingDocsCount = state.documents.filter((d) => !d.file_name).length;

  const activePage =
    pathname === "/"
      ? "Portal Home"
      : pathname.startsWith("/projects")
      ? "Project Operations"
      : pathname.startsWith("/dashboard")
      ? "Operations Dashboard"
      : pathname.startsWith("/sop-library")
      ? "SOP Governance Library"
      : pathname.startsWith("/issues")
      ? "Defect & CAPA Tracker"
      : pathname.startsWith("/documents")
      ? "Quality Document Repository"
      : pathname.startsWith("/audits")
      ? "Audit & Findings"
      : pathname.startsWith("/lms")
      ? "LMS & Workforce Learning"
      : pathname.startsWith("/competency")
      ? "Workforce Competency"
      : "SiteFlow Governance";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* ================================================================== */}
      {/* TOP HEADER                                                          */}
      {/* ================================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-15 max-w-[1400px] items-center px-4 sm:px-6 relative">

          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="size-4.5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm group-hover:shadow-md transition-shadow">
                <HardHat className="size-4.5" />
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-display text-[17px] font-bold tracking-tight text-slate-900 leading-tight">
                  SiteFlow
                </span>
                <span className="hidden sm:block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  SOP Governance
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Quick Nav Links — absolutely centered */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5">
            {QUICK_NAV.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all",
                    active
                      ? "text-primary bg-primary/8"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Spacer on small screens */}
          <div className="flex-1 lg:hidden" />

          {/* Right Actions */}
          <div className="ml-auto flex items-center gap-2.5 shrink-0">
            {/* Page Indicator Pill — visible on medium screens */}
            <div className="hidden md:flex lg:hidden items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>{activePage}</span>
            </div>

            {/* Add Project CTA */}
            {onAddProjectClick && (
              <button
                onClick={onAddProjectClick}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="size-3.5" /> Add Project
              </button>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Avatar */}
            <Link
              to="/login"
              className="flex items-center gap-2 group cursor-pointer"
              title={`${CURRENT_USER.name} · ${CURRENT_USER.role} · Click to switch account`}
            >
              <div className="relative flex size-8.5 items-center justify-center rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 text-white font-bold text-[11px] shadow-sm ring-2 ring-white border border-slate-200 group-hover:ring-primary/50 transition-all group-hover:scale-105">
                {CURRENT_USER.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs leading-tight">
                <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{CURRENT_USER.name}</span>
                <span className="text-[10px] text-slate-500">{CURRENT_USER.role}</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* PREMIUM DARK SIDEBAR                                               */}
      {/* ================================================================== */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300",
          sidebarOpen
            ? "bg-slate-950/60 backdrop-blur-sm pointer-events-auto"
            : "bg-transparent pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-[60px] items-center justify-between px-5 shrink-0 border-b border-slate-200 bg-[#FAF7F2]">
          <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5 group">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <HardHat className="size-4" />
            </span>
            <div className="leading-none">
              <span className="font-display text-[17px] font-bold tracking-tight text-slate-900 block leading-tight">SiteFlow</span>
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                <ShieldCheck className="size-2.5 text-emerald-500" />ISO 9001:2015
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex size-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 px-2.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon, description }) => {
                  const active = isActive(to);

                  let badge: ReactNode = null;
                  if (to === "/issues" && openIssuesCount > 0) {
                    badge = (
                      <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 text-white font-bold px-1.5 text-[9px]">
                        {openIssuesCount}
                      </span>
                    );
                  } else if (to === "/documents" && pendingDocsCount > 0) {
                    badge = (
                      <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-amber-500 text-white font-bold px-1.5 text-[9px]">
                        {pendingDocsCount}
                      </span>
                    );
                  } else if (to === "/sop-library") {
                    badge = (
                      <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold px-1.5 text-[9px]">
                        {state.sops.length}
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                        active
                          ? "bg-primary/8 text-primary"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {/* Active left bar */}
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary" />
                      )}

                      {/* Icon */}
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                          active
                            ? "bg-primary text-white shadow-sm"
                            : "bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>

                      {/* Label + Description */}
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-[12px] font-semibold leading-tight truncate", active ? "text-primary" : "text-slate-800")}>
                          {label}
                        </p>
                        <p className="text-[10px] truncate mt-0.5 text-slate-400">
                          {description}
                        </p>
                      </div>

                      {/* Badge */}
                      {badge && <div className="shrink-0">{badge}</div>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="shrink-0 p-3 border-t border-slate-200 bg-[#FAF7F2]">
          <Link
            to="/login"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 group transition-all hover:border-primary/40 hover:bg-primary/4"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white text-[11px] font-bold">
              {CURRENT_USER.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-bold text-slate-800 group-hover:text-primary transition-colors truncate">{CURRENT_USER.name}</p>
              <p className="text-[10px] text-slate-500">{CURRENT_USER.role}</p>
            </div>
            <LogOut className="size-3.5 text-slate-400 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </aside>

      {/* ================================================================== */}
      {/* MAIN CONTENT                                                        */}
      {/* ================================================================== */}
      <main className={cn("flex-1 w-full", fluid ? "pb-8" : "mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8")}>
        {children}
      </main>

      {/* ================================================================== */}
      {/* FOOTER                                                              */}
      {/* ================================================================== */}
      <footer className="border-t border-border bg-white text-slate-600 mt-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="flex size-6 items-center justify-center rounded bg-primary text-white">
              <HardHat className="size-3.5" />
            </span>
            <span>SiteFlow Construction SOP Management</span>
          </div>
          <p className="text-slate-500">
            © {new Date().getFullYear()} SiteFlow. Enforcing engineering quality & compliance across active sites.
          </p>
        </div>
      </footer>
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
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
