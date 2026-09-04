import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  ArrowRight,
  Layers,
  Home,
  Maximize2,
  CheckCircle2,
  LayoutGrid,
  List,
  AlertCircle,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ProjectFormDrawer } from "@/components/ProjectFormDrawer";
import {
  ProjectStatusBadge,
  ProgressBar,
} from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  actions,
  projectProgress,
  useSiteflow,
  type ProjectStatus,
} from "@/lib/siteflow-store";

export const Route = createFileRoute("/projects/")({
  component: ProjectsListPage,
});

function ProjectsListPage() {
  const state = useSiteflow();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredProjects = state.projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <PageHeader
        title="Active Construction Projects"
        subtitle="Manage active construction sites, track department-wise SOP compliance, and monitor project milestones."
        actions={
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all"
          >
            <Plus className="size-4" /> Add New Project
          </button>
        }
      />

      {/* Filter & Search Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
          <Input
            placeholder="Search by project name, code, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-white border-slate-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(["All", "In Progress", "Planning", "Completed"] as const).map((s) => {
              const count =
                s === "All"
                  ? state.projects.length
                  : state.projects.filter((p) => p.status === s).length;
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {s} <span className="opacity-70 text-[11px]">({count})</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle: Cards vs List */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/90 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Compact List View"
            >
              <List className="size-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display: Cards vs List Table */}
      {filteredProjects.length > 0 ? (
        viewMode === "cards" ? (
          /* Cards Grid View */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const prog = projectProgress(state, project.id);
              const openIssues = state.issues.filter(
                (i) =>
                  i.project_id === project.id &&
                  (i.status === "Open" || i.status === "Assigned" || i.status === "In Progress"),
              ).length;

              return (
                <Link
                  key={project.id}
                  to="/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs card-hover"
                >
                  <div>
                    {/* Top Bar inside Card */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 font-mono border border-slate-200">
                        {project.code}
                      </span>
                      <ProjectStatusBadge status={project.status} />
                    </div>

                    <h2 className="font-display text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {project.name}
                    </h2>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-4">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>

                    {/* Scale Stats Row */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 text-center mb-4 border border-slate-100">
                      <div>
                        <span className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                          <Maximize2 className="size-3" /> Area
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{project.area} ac</p>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                          <Layers className="size-3" /> Floors
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{project.floors}</p>
                      </div>
                      <div>
                        <span className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                          <Home className="size-3" /> Flats
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{project.flats}</p>
                      </div>
                    </div>

                    {/* Amenities Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.amenities.slice(0, 3).map((a) => (
                        <span
                          key={a}
                          className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {a}
                        </span>
                      ))}
                      {project.amenities.length > 3 && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 font-medium">
                          +{project.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar and Footer */}
                  <div className="border-t border-slate-100 pt-3.5 space-y-2 mt-auto">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        SOP Progress: <strong className="text-slate-900">{prog.completed}/{prog.sops}</strong>
                      </span>
                      <span className="font-bold text-primary">{prog.pct}%</span>
                    </div>
                    <ProgressBar pct={prog.pct} />

                    <div className="flex items-center justify-between pt-1">
                      {openIssues > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                          ● {openIssues} {openIssues === 1 ? "issue" : "issues"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 className="size-3.5" /> Clean record
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                        View Site <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Sleek Table List View */
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Code & Project</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Scale</th>
                    <th className="py-3 px-4 min-w-[180px]">SOP Progress</th>
                    <th className="py-3 px-4">NCR Issues</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProjects.map((project) => {
                    const prog = projectProgress(state, project.id);
                    const openIssues = state.issues.filter(
                      (i) =>
                        i.project_id === project.id &&
                        (i.status === "Open" || i.status === "Assigned" || i.status === "In Progress"),
                    ).length;

                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 font-mono border border-slate-200">
                              {project.code}
                            </span>
                            <div>
                              <Link
                                to="/projects/$projectId"
                                params={{ projectId: project.id }}
                                className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm hover:underline"
                              >
                                {project.name}
                              </Link>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Admin: {project.admin}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="size-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{project.location}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-800">{project.area} ac</span>
                            <span className="text-slate-300">·</span>
                            <span>{project.floors} fl</span>
                            <span className="text-slate-300">·</span>
                            <span>{project.flats} flats</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5 max-w-[200px]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">
                                {prog.completed} of {prog.sops} SOPs
                              </span>
                              <span className="font-bold text-slate-800">{prog.pct}%</span>
                            </div>
                            <ProgressBar pct={prog.pct} />
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {openIssues > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                              <AlertCircle className="size-3 text-rose-600" />
                              {openIssues} Open
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              Clean
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <ProjectStatusBadge status={project.status} />
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              to="/projects/$projectId"
                              params={{ projectId: project.id }}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-primary hover:text-white transition-all shadow-2xs"
                            >
                              View Site
                              <ChevronRight className="size-3.5" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete construction project "${project.name}" and all associated records?`)) {
                                  actions.deleteProject(project.id);
                                  toast.success(`Project "${project.name}" deleted`);
                                }
                              }}
                              className="inline-flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-2xs"
                              title="Delete Project"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-md mx-auto">
          <Building2 className="size-10 text-slate-400 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-900">No projects found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {search || statusFilter !== "All"
              ? "No construction projects matched your filter criteria."
              : "Get started by creating your first construction project."}
          </p>
          <button
            onClick={() => setDrawerOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
          >
            <Plus className="size-4" /> Add Project
          </button>
        </div>
      )}

      {/* Create Project Drawer */}
      <ProjectFormDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </AppShell>
  );
}
