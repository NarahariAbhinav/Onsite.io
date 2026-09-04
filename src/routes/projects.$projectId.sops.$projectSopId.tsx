import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  Upload,
  Play,
  Check,
  MessageSquare,
  Plus,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Award,
  Layers,
  Download,
  ChevronDown,
  Circle,
  UserCheck,
  UserPlus,
  Calendar,
  CalendarDays,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AddDocumentModal } from "@/components/AddDocumentModal";
import { DocPreviewModal } from "@/components/DocPreviewModal";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import { StepStatusBadge } from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  actions,
  CURRENT_USER,
  formatDate,
  formatDateTime,
  getSopStageDependency,
  isSopOverdue,
  PEOPLE,
  sopProgress,
  useSiteflow,
  type Document,
  type StepExecution,
} from "@/lib/siteflow-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute(
  "/projects/$projectId/sops/$projectSopId",
)({
  component: SopExecutionPage,
});

function SopExecutionPage() {
  const { projectId, projectSopId } = Route.useParams();
  const state = useSiteflow();

  const project = state.projects.find((p) => p.id === projectId);
  const projectSop = state.projectSops.find((ps) => ps.id === projectSopId);
  const sop = projectSop
    ? state.sops.find((s) => s.id === projectSop.sop_id)
    : null;

  const executions = state.executions.filter(
    (e) => e.project_sop_id === projectSopId,
  );
  const sopSteps = state.steps.filter(
    (st) => st.sop_id === projectSop?.sop_id,
  );

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [activeExec, setActiveExec] = useState<StepExecution | null>(null);
  const [completionComment, setCompletionComment] = useState("");
  const [reportIssueStepId, setReportIssueStepId] = useState<string | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [addDocModalOpen, setAddDocModalOpen] = useState(false);

  // Reassignment & Completion End Date Modals
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignMode, setReassignMode] = useState<string>(projectSop?.assigned_to ?? (PEOPLE[0] ?? "R. Menon"));
  const [reassignCustom, setReassignCustom] = useState<string>("");
  const [dueDateModalOpen, setDueDateModalOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState<string>(projectSop?.due_date ?? "");

  const firstOpenStep = sopSteps.find((st) => {
    const exec = executions.find((e) => e.step_id === st.id);
    return exec?.status !== "Completed";
  });
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(
    () => new Set(firstOpenStep ? [firstOpenStep.id] : [sopSteps[0]?.id ?? ""]),
  );

  if (!project || !projectSop || !sop) {
    return (
      <AppShell>
        <div className="py-20 text-center max-w-sm mx-auto">
          <Layers className="size-8 text-slate-300 mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-slate-900">SOP Not Found</h2>
          <p className="mt-1 text-xs text-slate-500">This execution record does not exist.</p>
          <Link
            to="/projects/$projectId"
            params={{ projectId }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Project
          </Link>
        </div>
      </AppShell>
    );
  }

  const sProg = sopProgress(state, projectSop.id);
  const isOverdue = isSopOverdue(projectSop, state);
  const stageDep = getSopStageDependency(projectSop.id, state);
  const sopDocs = state.documents.filter(
    (d) => d.project_id === projectId && d.sop_id === sop.id,
  );
  const uploadedDocs = sopDocs.filter((d) => !!d.file_name).length;
  const sopIssues = state.issues.filter(
    (i) => i.project_id === projectId && i.sop_id === sop.id,
  );
  const activeIssueCount = sopIssues.filter(
    (i) => i.status === "Open" || i.status === "Assigned" || i.status === "In Progress",
  ).length;

  const allProjectSops = state.projectSops.filter((ps) => ps.project_id === projectId);
  const currentIdx = allProjectSops.findIndex((ps) => ps.id === projectSopId);
  const prevSop = currentIdx > 0 ? allProjectSops[currentIdx - 1] : null;
  const nextSop = currentIdx < allProjectSops.length - 1 ? allProjectSops[currentIdx + 1] : null;

  const toggleStep = (id: string) =>
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleStartStep = (execId: string, title: string) => {
    actions.setStepStatus(execId, "In Progress");
    toast.info(`"${title}" started`);
  };

  const handleOpenCompleteModal = (exec: StepExecution) => {
    setActiveExec(exec);
    setCompletionComment(exec.comments ?? "");
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = () => {
    if (!activeExec) return;
    actions.setStepStatus(activeExec.id, "Completed", completionComment.trim() || undefined);
    toast.success("Step signed off", {
      description: `${CURRENT_USER.name} · ${new Date().toLocaleTimeString()}`,
    });
    setCompleteModalOpen(false);
    setActiveExec(null);
    setCompletionComment("");
  };

  const handleResetStep = (execId: string) => {
    actions.setStepStatus(execId, "In Progress");
    toast.info("Step re-opened");
  };

  const handleSaveReassign = () => {
    const finalAssignee = reassignMode === "OTHER" ? reassignCustom.trim() : reassignMode;
    if (!finalAssignee) {
      toast.error("Please enter assignee name");
      return;
    }
    actions.updateProjectSop(projectSop.id, { assigned_to: finalAssignee });
    toast.success(`Assigned Quality Lead to ${finalAssignee}`);
    setReassignModalOpen(false);
  };

  const handleSaveDueDate = () => {
    actions.updateProjectSop(projectSop.id, { due_date: newDueDate || null });
    toast.success("Target completion end date updated", {
      description: newDueDate ? `Target: ${formatDate(newDueDate)}` : "Target deadline removed",
    });
    setDueDateModalOpen(false);
  };

  const handleSetPresetDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setNewDueDate(d.toISOString().split("T")[0] ?? "");
  };

  const handleOpenDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setDocModalOpen(true);
  };

  return (
    <AppShell fluid>
      {/* ─── Breadcrumb bar ─── */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <nav className="flex min-w-0 items-center gap-2 text-xs">
            <Link
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="inline-flex shrink-0 items-center gap-1 font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              {project.name}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="truncate font-semibold text-slate-800">{sop.name}</span>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            {prevSop && (
              <Link
                to="/projects/$projectId/sops/$projectSopId"
                params={{ projectId: project.id, projectSopId: prevSop.id }}
                className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="size-3" /> Prev
              </Link>
            )}
            {nextSop && (
              <Link
                to="/projects/$projectId/sops/$projectSopId"
                params={{ projectId: project.id, projectSopId: nextSop.id }}
                className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Next <ChevronRight className="size-3" />
              </Link>
            )}
            <button
              onClick={() => { setReportIssueStepId(null); setIssueModalOpen(true); }}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
            >
              <AlertTriangle className="size-3.5" /> Report NCR
            </button>
          </div>
        </div>
      </div>

      {/* ─── Page body ─── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-12">

          {/* ═══════════════════════════
              SIDEBAR  (4 cols)
          ═══════════════════════════ */}
          <aside className="space-y-px lg:col-span-4 lg:sticky lg:top-28">

            {/* SOP card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              {/* Title block */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {sop.department}
                  </span>
                  <span className="text-slate-200">·</span>
                  <StepStatusBadge status={sProg.status} />
                </div>
                <h2 className="font-display text-base font-bold text-slate-900 leading-snug">
                  {sop.name}
                </h2>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {sop.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Completion</span>
                  <span className="font-bold text-slate-900">{sProg.completed}/{sProg.total} steps</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${sProg.pct === 100 ? "bg-emerald-500" : "bg-primary"}`}
                    style={{ width: `${sProg.pct}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right">{sProg.pct}%</div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Meta rows */}
              <div className="space-y-2.5 text-xs">
                {/* Quality Lead */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Quality Lead</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">{projectSop.assigned_to}</span>
                    <button
                      onClick={() => {
                        const isPreset = PEOPLE.includes(projectSop.assigned_to);
                        setReassignMode(isPreset ? projectSop.assigned_to : "OTHER");
                        setReassignCustom(isPreset ? "" : projectSop.assigned_to);
                        setReassignModalOpen(true);
                      }}
                      className="inline-flex items-center gap-0.5 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-primary hover:bg-orange-100 transition-colors"
                      title="Reassign to another person or subcontractor"
                    >
                      <UserPlus className="size-2.5" /> Reassign
                    </button>
                  </div>
                </div>

                {/* Target Completion End Date */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Target End Date</span>
                  <div className="flex items-center gap-1.5">
                    {projectSop.due_date ? (
                      <span className={`font-semibold ${isOverdue ? "text-rose-600 font-bold" : "text-slate-800"}`}>
                        {formatDate(projectSop.due_date)}
                        {isOverdue && " ⚠️"}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Not set</span>
                    )}
                    <button
                      onClick={() => {
                        setNewDueDate(projectSop.due_date ?? "");
                        setDueDateModalOpen(true);
                      }}
                      className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Update target completion end date"
                    >
                      <Calendar className="size-2.5" /> {projectSop.due_date ? "Edit" : "+ Set"}
                    </button>
                  </div>
                </div>

                {/* Stage Dependency Link */}
                {stageDep.hasDependency && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-400 font-medium inline-flex items-center gap-1">
                      <Link2 className="size-3 text-slate-400" /> Preceding Stage
                    </span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                        stageDep.level === "success"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : stageDep.level === "danger"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {stageDep.status}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Site Location</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[160px] text-right">{project.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Standard</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                    <ShieldCheck className="size-3 text-slate-400" /> ISO 9001:2015
                  </span>
                </div>
              </div>

              {sProg.pct === 100 && (
                <button
                  onClick={() => setCertModalOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Award className="size-3.5 text-emerald-600" /> View QA Certificate
                </button>
              )}
            </div>

            {/* Documents */}
            <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <FileText className="size-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">Documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {uploadedDocs}/{sopDocs.length} uploaded
                  </span>
                  <button
                    onClick={() => setAddDocModalOpen(true)}
                    className="size-5 rounded flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>

              {sopDocs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {sopDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className={`size-1.5 shrink-0 rounded-full ${doc.file_name ? "bg-emerald-500" : "bg-amber-400"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-slate-800">{doc.document_name}</p>
                        <p className={`truncate text-[10px] ${doc.file_name ? "font-mono text-slate-400" : "italic text-amber-600"}`}>
                          {doc.file_name ?? "Pending upload"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenDoc(doc)}
                        className="shrink-0 text-[10px] font-semibold text-slate-500 hover:text-primary transition-colors"
                      >
                        {doc.file_name ? "View" : "Attach"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-[11px] text-slate-400">No documents attached</p>
                  <button
                    onClick={() => setAddDocModalOpen(true)}
                    className="mt-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    + Add document
                  </button>
                </div>
              )}
            </div>

            {/* NCR / Issues */}
            <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">NCR Observations</span>
                </div>
                {activeIssueCount > 0 && (
                  <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                    {activeIssueCount} active
                  </span>
                )}
              </div>

              {sopIssues.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {sopIssues.slice(0, 5).map((issue) => (
                    <Link
                      key={issue.id}
                      to="/issues/$issueId"
                      params={{ issueId: issue.id }}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                    >
                      <span className={`mt-1 size-1.5 shrink-0 rounded-full ${
                        issue.status === "Resolved" || issue.status === "Closed" ? "bg-emerald-500" : "bg-rose-500"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[11px] font-medium text-slate-800 group-hover:text-primary transition-colors">
                          {issue.title}
                        </p>
                        <p className="text-[10px] text-slate-400">{issue.priority} · {issue.status}</p>
                      </div>
                    </Link>
                  ))}
                  {sopIssues.length > 5 && (
                    <div className="px-4 py-2 text-center text-[10px] text-slate-400">
                      +{sopIssues.length - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-[11px] text-slate-400">No NCRs on this SOP</p>
                </div>
              )}
            </div>

            {/* Prev / Next */}
            {(prevSop || nextSop) && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {prevSop ? (
                  <Link
                    to="/projects/$projectId/sops/$projectSopId"
                    params={{ projectId: project.id, projectSopId: prevSop.id }}
                    className="flex flex-col gap-0.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                      <ChevronLeft className="size-3" /> Previous
                    </span>
                    <span className="line-clamp-1 font-semibold text-slate-700 text-[11px]">
                      {state.sops.find((s) => s.id === prevSop.sop_id)?.name ?? "SOP"}
                    </span>
                  </Link>
                ) : <div />}

                {nextSop ? (
                  <Link
                    to="/projects/$projectId/sops/$projectSopId"
                    params={{ projectId: project.id, projectSopId: nextSop.id }}
                    className="flex flex-col items-end gap-0.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                      Next <ChevronRight className="size-3" />
                    </span>
                    <span className="line-clamp-1 text-right font-semibold text-slate-700 text-[11px]">
                      {state.sops.find((s) => s.id === nextSop.sop_id)?.name ?? "SOP"}
                    </span>
                  </Link>
                ) : <div />}
              </div>
            )}
          </aside>

          {/* ═══════════════════════════
              MAIN AREA  (8 cols)
          ═══════════════════════════ */}
          <div className="lg:col-span-8 space-y-4">

            {/* Stage Sequence & Dependency Notice Banner */}
            {stageDep.hasDependency && (
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4.5 shadow-xs transition-all ${
                  stageDep.level === "success"
                    ? "bg-emerald-50/90 border-emerald-200/90 text-emerald-950"
                    : stageDep.level === "danger"
                      ? "bg-rose-50/90 border-rose-200/90 text-rose-950"
                      : "bg-amber-50/90 border-amber-200/90 text-amber-950"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {stageDep.level === "success" ? (
                    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                      <CheckCircle2 className="size-4" />
                    </div>
                  ) : stageDep.level === "danger" ? (
                    <div className="flex size-7 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs animate-pulse">
                      <AlertTriangle className="size-4" />
                    </div>
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                      <Clock className="size-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {stageDep.level === "success"
                        ? "Stage Handover Verified"
                        : stageDep.level === "danger"
                          ? "Critical Stage Dependency Overdue"
                          : "Preceding Stage Pending Handover"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                        stageDep.level === "success"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : stageDep.level === "danger"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {stageDep.prevSop?.name ?? "Previous Stage"}: {stageDep.status} ({stageDep.progressPct}%)
                    </span>
                  </div>

                  <p className="text-xs mt-1.5 leading-relaxed font-medium">
                    {stageDep.message}
                  </p>

                  {stageDep.prevProjectSop && (
                    <div className="mt-2.5 flex items-center gap-3 text-[11px] font-semibold flex-wrap">
                      <Link
                        to="/projects/$projectId/sops/$projectSopId"
                        params={{ projectId: project.id, projectSopId: stageDep.prevProjectSop.id }}
                        className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80"
                      >
                        <span>View Preceding SOP ({stageDep.prevSop?.name})</span>
                        <ChevronRight className="size-3" />
                      </Link>
                      <span className="opacity-75">· Responsible: <strong>{stageDep.assignedTo}</strong></span>
                      {stageDep.dueDate && (
                        <span className="opacity-75">· Target End Date: <strong>{formatDate(stageDep.dueDate)}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-lg font-bold text-slate-900">Execution Workflow</h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {sopSteps.length} steps · execute in order
                </p>
              </div>
              {sopDocs.length > 0 && uploadedDocs < sopDocs.length && (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                  <AlertTriangle className="size-3" />
                  {sopDocs.length - uploadedDocs} doc{sopDocs.length - uploadedDocs !== 1 ? "s" : ""} pending
                </span>
              )}
            </div>

            {/* 100% done banner */}
            {sProg.pct === 100 && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <Award className="size-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">All steps completed</p>
                    <p className="text-[11px] text-slate-500">Procedure sign-off recorded. Ready for QA certificate.</p>
                  </div>
                </div>
                <button
                  onClick={() => setCertModalOpen(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Download className="size-3.5" /> Export
                </button>
              </div>
            )}

            {/* Steps list */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
              {sopSteps.map((step, idx) => {
                const exec = executions.find((e) => e.step_id === step.id);
                const status = exec?.status ?? "Not Started";
                const isDone = status === "Completed";
                const isInProg = status === "In Progress";
                const isExpanded = expandedSteps.has(step.id);

                return (
                  <div key={step.id}>
                    {/* Step header row — always visible */}
                    <button
                      onClick={() => toggleStep(step.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/60 ${isExpanded ? "bg-slate-50/40" : ""}`}
                    >
                      {/* Status indicator */}
                      <span className={`shrink-0 flex size-6 items-center justify-center rounded-full text-[10px] font-bold ${
                        isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : isInProg
                            ? "bg-primary/10 text-primary"
                            : "bg-slate-100 text-slate-400"
                      }`}>
                        {isDone ? <Check className="size-3.5" /> : step.step_number}
                      </span>

                      {/* Title block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-medium text-slate-400">Step {step.step_number}</span>
                          <StepStatusBadge status={status} />
                          {isDone && exec?.completed_by && (
                            <span className="text-[10px] text-slate-400">{exec.completed_by}</span>
                          )}
                        </div>
                        <p className="font-semibold text-sm text-slate-900 mt-0.5 truncate">{step.title}</p>
                      </div>

                      {/* Expand chevron */}
                      <ChevronDown className={`size-4 text-slate-300 shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {/* Expanded body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-slate-100 bg-slate-50/30">

                        {/* Instructions */}
                        <p className="pt-3 text-xs text-slate-600 leading-relaxed">
                          {step.instructions}
                        </p>

                        {/* Completed sign-off row */}
                        {isDone && (
                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-slate-700">
                              <ShieldCheck className="size-3.5 text-emerald-500" />
                              <span className="font-semibold">{exec?.completed_by ?? CURRENT_USER.name}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Clock className="size-3" />
                              {formatDateTime(exec?.completed_at)}
                            </span>
                            {exec?.comments && (
                              <p className="w-full text-[11px] text-slate-500 italic border-t border-slate-100 pt-1.5 mt-0.5">
                                "{exec.comments}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {status === "Not Started" && exec && (
                              <button
                                onClick={() => handleStartStep(exec.id, step.title)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all active:scale-95"
                              >
                                <Play className="size-3" /> Start
                              </button>
                            )}

                            {isInProg && exec && (
                              <>
                                <button
                                  onClick={() => handleOpenCompleteModal(exec)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-95"
                                >
                                  <CheckCircle2 className="size-3" /> Sign Off
                                </button>
                                <button
                                  onClick={() => handleOpenCompleteModal(exec)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  <MessageSquare className="size-3" /> Remark
                                </button>
                              </>
                            )}

                            {isDone && exec && (
                              <>
                                <button
                                  onClick={() => handleOpenCompleteModal(exec)}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleResetStep(exec.id)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-amber-600 transition-colors px-1"
                                >
                                  <RotateCcw className="size-3" /> Re-open
                                </button>
                              </>
                            )}
                          </div>

                          <button
                            onClick={() => { setReportIssueStepId(step.id); setIssueModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                          >
                            <AlertTriangle className="size-3" /> Flag NCR
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ MODALS ═══════════ */}

      {/* Sign-off */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <CheckCircle2 className="size-4" />
              </span>
              <div>
                <DialogTitle className="font-display text-base text-slate-900">
                  Sign Off Step
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Your identity and timestamp will be logged.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Signing as</span>
                <strong className="text-slate-900">{CURRENT_USER.name} · {CURRENT_USER.role}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Timestamp</span>
                <strong className="text-slate-900">{new Date().toLocaleString()}</strong>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Remarks (optional)
              </label>
              <Textarea
                placeholder="e.g. Slump 110mm verified, rebar per BBS-CIV-04..."
                rows={3}
                value={completionComment}
                onChange={(e) => setCompletionComment(e.target.value)}
                className="text-xs rounded-lg"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => setCompleteModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmComplete}
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Authorize & Complete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QA Certificate */}
      <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Award className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                ISO 9001:2015 Compliance
              </p>
              <h2 className="font-display text-lg font-bold text-slate-900 mt-1">
                Execution Certificate
              </h2>
              <p className="text-xs text-slate-500">{sop.name}</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 text-left divide-y divide-slate-200">
              {[
                ["Project", `${project.name} (${project.code})`],
                ["Steps Verified", `${sopSteps.length} / ${sopSteps.length}`],
                ["QA Lead", projectSop.assigned_to],
                ["Seal Date", new Date().toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between px-3.5 py-2.5 text-xs">
                  <span className="text-slate-500">{label}</span>
                  <strong className="text-slate-900">{value}</strong>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                toast.success("Certificate downloaded");
                setCertModalOpen(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Download className="size-3.5" /> Download PDF
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign Lead / Assign Other Modal */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-primary">
                <UserCheck className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="font-display text-slate-900">Reassign Quality Lead</DialogTitle>
                <DialogDescription className="text-xs">
                  Transfer procedure ownership to another engineer or third-party contractor.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Select Assignee or Other
              </Label>
              <Select value={reassignMode} onValueChange={setReassignMode}>
                <SelectTrigger className="h-9 text-xs rounded-lg">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {PEOPLE.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      👤 {p}
                    </SelectItem>
                  ))}
                  <SelectItem value="OTHER" className="text-xs font-semibold text-primary">
                    ➕ Other / Custom Assignee...
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reassignMode === "OTHER" && (
              <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Custom Assignee Name & Organization:
                </Label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kulkarni - Geotechnical Consultant"
                  value={reassignCustom}
                  onChange={(e) => setReassignCustom(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-primary focus:outline-hidden"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setReassignModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveReassign}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
            >
              Save Reassignment
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Target Completion End Date Modal */}
      <Dialog open={dueDateModalOpen} onOpenChange={setDueDateModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-primary">
                <CalendarDays className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="font-display text-slate-900">Set Target Completion End Date</DialogTitle>
                <DialogDescription className="text-xs">
                  Set milestone delivery target. Downstream stages and leads are alerted when this deadline approaches.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Target Completion End Date
              </Label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-primary focus:outline-hidden"
              />
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() => handleSetPresetDueDate(7)}
                className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-200"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetDueDate(14)}
                className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-200"
              >
                +14 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetDueDate(30)}
                className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-200"
              >
                +1 Month
              </button>
              {newDueDate && (
                <button
                  type="button"
                  onClick={() => setNewDueDate("")}
                  className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 ml-auto"
                >
                  Clear Deadline
                </button>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setDueDateModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDueDate}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
            >
              Update End Date
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReportIssueModal
        open={issueModalOpen}
        onOpenChange={setIssueModalOpen}
        projectId={project.id}
        sopId={sop.id}
        stepId={reportIssueStepId}
      />

      <AddDocumentModal
        open={addDocModalOpen}
        onOpenChange={setAddDocModalOpen}
        projectId={project.id}
        sopId={sop.id}
      />

      <DocPreviewModal
        open={docModalOpen}
        onOpenChange={setDocModalOpen}
        document={selectedDoc}
      />
    </AppShell>
  );
}
