import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Search,
  Plus,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import {
  Chip,
  IssueStatusBadge,
  PriorityBadge,
} from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  actions,
  formatDate,
  useSiteflow,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/siteflow-store";
import { exportIssuesToCSV } from "@/lib/export-utils";

export const Route = createFileRoute("/issues/")({
  component: IssueTrackerPage,
});

function IssueTrackerPage() {
  const state = useSiteflow();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const openCount = state.issues.filter((i) => i.status === "Open").length;
  const assignedCount = state.issues.filter((i) => i.status === "Assigned").length;
  const inProgressCount = state.issues.filter((i) => i.status === "In Progress").length;
  const resolvedCount = state.issues.filter((i) => i.status === "Resolved").length;
  const closedCount = state.issues.filter((i) => i.status === "Closed").length;

  const priorityWeight: Record<IssuePriority, number> = { High: 3, Medium: 2, Low: 1 };

  const filteredIssues = state.issues
    .filter((issue) => {
      const matchSearch =
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.description.toLowerCase().includes(search.toLowerCase()) ||
        issue.assigned_to.toLowerCase().includes(search.toLowerCase());
      const matchProject = projectFilter === "All" || issue.project_id === projectFilter;
      const matchPriority = priorityFilter === "All" || issue.priority === priorityFilter;
      const matchStatus = statusFilter === "All" || issue.status === statusFilter;
      return matchSearch && matchProject && matchPriority && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleExportCSV = () => {
    const filterLabel =
      projectFilter !== "All"
        ? (state.projects.find((p) => p.id === projectFilter)?.name ?? "Project")
        : "All-Projects";
    exportIssuesToCSV(filteredIssues, state, filterLabel);
    toast.success(`Exported ${filteredIssues.length} issues to CSV`);
  };

  return (
    <AppShell>
      <PageHeader
        title="Central Issue & Defect Tracker"
        subtitle="Manage quality observations, safety compliance, and execution defects across all active projects."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
              title="Download Excel/CSV Report"
            >
              <Download className="size-3.5 text-slate-500" /> Export CSV
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-all active:scale-95"
            >
              <Plus className="size-4" /> Report Issue
            </button>
          </div>
        }
      />

      {/* Summary Chips Strip */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Defect Status:
        </span>
        <Chip label="Open" value={openCount} toneKey="red" />
        <Chip label="Assigned" value={assignedCount} toneKey="amber" />
        <Chip label="In Progress" value={inProgressCount} toneKey="orange" />
        <Chip label="Resolved" value={resolvedCount} toneKey="green" />
        <Chip label="Closed" value={closedCount} toneKey="gray" />
      </div>

      {/* Filters Toolbar */}
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
            <Input
              placeholder="Search defects, supervisor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-md bg-slate-50 border-slate-200 text-xs shadow-xs"
            />
          </div>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-9 text-xs w-[160px] rounded-md border-slate-200 bg-white">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Projects</SelectItem>
              {state.projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 text-xs w-[130px] rounded-md border-slate-200 bg-white">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs w-[130px] rounded-md border-slate-200 bg-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={() => setSortBy(sortBy === "date" ? "priority" : "date")}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowUpDown className="size-3.5" />
          {sortBy === "date" ? "Recent Date" : "High Priority"}
        </button>
      </div>

      {/* Issues Table */}
      {filteredIssues.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-200">
                <TableHead className="font-bold text-slate-900 text-xs">Issue Description</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Project & SOP</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Responsible Lead</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Priority</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Quick Status</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs">Reported Date</TableHead>
                <TableHead className="font-bold text-slate-900 text-xs text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => {
                const project = state.projects.find((p) => p.id === issue.project_id);
                const sop = issue.sop_id ? state.sops.find((s) => s.id === issue.sop_id) : null;

                return (
                  <TableRow
                    key={issue.id}
                    onClick={() =>
                      navigate({
                        to: "/issues/$issueId",
                        params: { issueId: issue.id },
                      })
                    }
                    className="cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <TableCell className="font-medium text-slate-900 text-xs max-w-xs py-3.5">
                      <div className="font-bold text-slate-900 hover:text-primary transition-colors">
                        {issue.title}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {issue.description}
                      </p>
                    </TableCell>

                    <TableCell className="text-xs">
                      <span className="font-semibold text-slate-900">{project?.name ?? "Project"}</span>
                      {sop && (
                        <span className="block text-[11px] text-slate-400">
                          {sop.name}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-slate-800">
                      {issue.assigned_to}
                    </TableCell>

                    <TableCell>
                      <PriorityBadge priority={issue.priority} />
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={issue.status}
                        onValueChange={(val) =>
                          actions.setIssueStatus(issue.id, val as IssueStatus)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs w-[120px] rounded-md border-slate-200 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["Open", "Assigned", "In Progress", "Resolved", "Closed"] as const).map(
                            (st) => (
                              <SelectItem key={st} value={st} className="text-xs">
                                {st}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {formatDate(issue.created_at)}
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to="/issues/$issueId"
                          params={{ issueId: issue.id }}
                          className="inline-flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete defect "${issue.title}"?`)) {
                              actions.deleteIssue(issue.id);
                              toast.success("Defect record deleted");
                            }
                          }}
                          className="inline-flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Defect"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-xs">
          <CheckCircle2 className="size-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-display text-base font-bold text-slate-900">No matching issues</h3>
          <p className="text-xs text-slate-500 mt-1">
            No defect or safety records match your current filter settings.
          </p>
        </div>
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        projectId={projectFilter !== "All" ? projectFilter : undefined}
      />
    </AppShell>
  );
}
