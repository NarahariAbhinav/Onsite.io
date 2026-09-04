import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Paperclip,
  Check,
  Send,
  MessageSquare,
  Clock,
  UserCheck,
  UserPlus,
  Trash2,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Upload,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { CapaLifecycleSuite } from "@/components/CapaLifecycleSuite";
import {
  IssueStatusBadge,
  PriorityBadge,
} from "@/components/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  actions,
  CURRENT_USER,
  formatDate,
  formatDateTime,
  PEOPLE,
  useSiteflow,
  type IssueStatus,
} from "@/lib/siteflow-store";

export const Route = createFileRoute("/issues/$issueId")({
  component: IssueDetailPage,
});

const LIFECYCLE_STAGES: IssueStatus[] = [
  "Open",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
];

function IssueDetailPage() {
  const { issueId } = Route.useParams();
  const navigate = useNavigate();
  const state = useSiteflow();
  const [commentText, setCommentText] = useState("");

  // Modals state
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignMode, setReassignMode] = useState("");
  const [reassignCustom, setReassignCustom] = useState("");

  const [startProgressModalOpen, setStartProgressModalOpen] = useState(false);
  const [startProgressNotes, setStartProgressNotes] = useState("");

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolvedByMode, setResolvedByMode] = useState(CURRENT_USER.name);
  const [resolvedByCustom, setResolvedByCustom] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionAttachment, setResolutionAttachment] = useState("");

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closedBy, setClosedBy] = useState(CURRENT_USER.name);
  const [closingRemarks, setClosingRemarks] = useState(
    "Verified rectifications on site. Quality and structural integrity approved according to ISO 9001:2015 standard.",
  );

  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const issue = state.issues.find((i) => i.id === issueId);

  if (!issue) {
    return (
      <AppShell>
        <div className="py-16 text-center max-w-md mx-auto">
          <h2 className="font-display text-2xl font-bold text-slate-900">Issue Not Found</h2>
          <p className="mt-1 text-xs text-slate-500">The requested defect report does not exist.</p>
          <Link
            to="/issues"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            <ArrowLeft className="size-4" /> Back to Tracker
          </Link>
        </div>
      </AppShell>
    );
  }

  const project = state.projects.find((p) => p.id === issue.project_id);
  const sop = issue.sop_id ? state.sops.find((s) => s.id === issue.sop_id) : null;
  const step = issue.step_id ? state.steps.find((st) => st.id === issue.step_id) : null;

  const currentStageIdx = LIFECYCLE_STAGES.indexOf(issue.status);

  // Status transitions
  const handleOpenResolve = () => {
    setResolvedByMode(issue.assigned_to ? (PEOPLE.includes(issue.assigned_to) ? issue.assigned_to : "OTHER") : CURRENT_USER.name);
    setResolvedByCustom(issue.assigned_to && !PEOPLE.includes(issue.assigned_to) ? issue.assigned_to : "");
    setResolutionNotes("");
    setResolutionAttachment("");
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      toast.error("Please provide corrective action / resolution notes");
      return;
    }

    const finalResolvedBy = resolvedByMode === "OTHER" ? resolvedByCustom.trim() || "Contractor" : resolvedByMode;

    actions.resolveIssue(issue.id, {
      resolved_by: finalResolvedBy,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes.trim(),
      resolution_attachment: resolutionAttachment.trim() || null,
    });

    toast.success(`NCR resolved by ${finalResolvedBy}`);
    setResolveModalOpen(false);
  };

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    actions.closeIssue(issue.id, {
      closed_by: closedBy,
      closed_at: new Date().toISOString(),
      closing_remarks: closingRemarks.trim() || undefined,
    });
    toast.success("NCR approved and closed with QA sign-off");
    setCloseModalOpen(false);
  };

  const handleConfirmReopen = (e: React.FormEvent) => {
    e.preventDefault();
    actions.reopenIssue(issue.id, reopenReason.trim() || undefined);
    toast.info("NCR re-opened for containment / re-work");
    setReopenModalOpen(false);
    setReopenReason("");
  };

  const handleConfirmStartProgress = () => {
    actions.startIssueProgress(issue.id, CURRENT_USER.name, startProgressNotes.trim() || undefined);
    toast.success("Containment work started on site");
    setStartProgressModalOpen(false);
    setStartProgressNotes("");
  };

  const handleConfirmReassign = () => {
    const finalAssignee = reassignMode === "OTHER" ? reassignCustom.trim() : reassignMode;
    if (!finalAssignee) {
      toast.error("Please specify an assignee");
      return;
    }
    actions.reassignIssue(issue.id, finalAssignee);
    toast.success(`Reassigned NCR to ${finalAssignee}`);
    setReassignModalOpen(false);
  };

  const handleDeleteIssue = () => {
    actions.deleteIssue(issue.id);
    toast.success("Defect record deleted");
    navigate({ to: "/issues" });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    actions.addIssueComment(issue.id, commentText.trim());
    toast.success("Update note added to activity log");
    setCommentText("");
  };

  const handleDeleteComment = (commentId: string) => {
    actions.deleteIssueComment(issue.id, commentId);
    toast.info("Comment removed");
  };

  return (
    <AppShell>
      {/* Top Navigation & Action Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Issue Tracker
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">ID: {issue.id}</span>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            title="Delete this defect record"
          >
            <Trash2 className="size-3.5" /> Delete NCR
          </button>
        </div>
      </div>

      {/* Breadcrumb Line */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        {project && (
          <Link
            to="/projects/$projectId"
            params={{ projectId: project.id }}
            className="font-semibold text-slate-800 hover:text-primary transition-colors"
          >
            {project.name}
          </Link>
        )}
        {sop && (
          <>
            <span>→</span>
            <span className="font-semibold text-slate-800">{sop.name}</span>
          </>
        )}
        {step && (
          <>
            <span>→</span>
            <span>Step {step.step_number}: {step.title}</span>
          </>
        )}
      </div>

      {/* Header Card with Interactive Flow Actions */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={issue.priority} />
              <IssueStatusBadge status={issue.status} />
              {issue.resolved_at && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  <CheckCircle2 className="size-3" /> Resolved on {formatDate(issue.resolved_at)}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              {issue.title}
            </h1>
          </div>

          {/* Quick Flow Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {issue.status === "Open" && (
              <button
                onClick={() => {
                  setReassignMode(PEOPLE[0] ?? "R. Menon");
                  setReassignCustom("");
                  setReassignModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 transition-all hover:scale-105 active:scale-95"
              >
                <UserPlus className="size-3.5" /> Assign Lead
              </button>
            )}

            {issue.status === "Assigned" && (
              <button
                onClick={() => setStartProgressModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Clock className="size-3.5" /> Start Containment
              </button>
            )}

            {issue.status === "In Progress" && (
              <button
                onClick={handleOpenResolve}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95"
              >
                <CheckCircle2 className="size-3.5" /> Resolve Defect
              </button>
            )}

            {issue.status === "Resolved" && (
              <>
                <button
                  onClick={() => setCloseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                >
                  <ShieldCheck className="size-3.5" /> QA Sign-off & Close
                </button>
                <button
                  onClick={() => setReopenModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="size-3" /> Re-open
                </button>
              </>
            )}

            {issue.status === "Closed" && (
              <button
                onClick={() => setReopenModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="size-3.5" /> Re-open Defect
              </button>
            )}
          </div>
        </div>

        {/* 5-Stage Lifecycle Stepper */}
        <div className="border-t border-slate-100 pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Resolution Lifecycle Progression:
          </span>
          <div className="grid grid-cols-5 gap-2 text-center">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div key={stage} className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (stage === "Resolved") handleOpenResolve();
                      else if (stage === "Closed") setCloseModalOpen(true);
                      else if (stage === "In Progress") setStartProgressModalOpen(true);
                      else if (stage === "Assigned") {
                        setReassignMode(issue.assigned_to);
                        setReassignModalOpen(true);
                      } else {
                        actions.setIssueStatus(issue.id, stage);
                      }
                    }}
                    className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isPast
                        ? "bg-emerald-600 text-white shadow-xs"
                        : isCurrent
                          ? "bg-primary text-white shadow-xs ring-4 ring-primary/20 scale-105"
                          : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                    }`}
                    title={`Click to set stage to ${stage}`}
                  >
                    {isPast ? <Check className="size-4" /> : idx + 1}
                  </button>
                  <span
                    className={`mt-1.5 text-[11px] font-bold ${
                      isCurrent
                        ? "text-primary font-extrabold"
                        : isPast
                          ? "text-slate-800"
                          : "text-slate-400"
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Columns: Issue Details & Full Audit Flow */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Details, Resolution Proof, and Context */}
        <div className="lg:col-span-2 space-y-6">
          {/* Defect Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Defect Description & Site Context
            </h2>

            <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
              {issue.description}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs space-y-1">
                <span className="text-slate-500 font-medium">Assigned Lead / Person:</span>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">{issue.assigned_to}</p>
                  <button
                    onClick={() => {
                      setReassignMode(PEOPLE.includes(issue.assigned_to) ? issue.assigned_to : "OTHER");
                      setReassignCustom(PEOPLE.includes(issue.assigned_to) ? "" : issue.assigned_to);
                      setReassignModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Reassign
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs space-y-1">
                <span className="text-slate-500 font-medium">Logged By & Date:</span>
                <p className="font-bold text-slate-900">
                  {issue.created_by} · {formatDateTime(issue.created_at)}
                </p>
              </div>
            </div>

            {/* Evidence Attachment */}
            {issue.attachment && (
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Initial Evidence Record / Photo:
                </span>
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 font-mono">
                  <Paperclip className="size-3.5 text-primary" />
                  <span>{issue.attachment}</span>
                </div>
              </div>
            )}
          </div>

          {/* 5-Stage CAPA & Root Cause Lifecycle Engine */}
          <CapaLifecycleSuite issue={issue} />

          {/* Resolution & Corrective Action Card (Visible when Resolved or Closed) */}
          {(issue.resolved_at || issue.resolution_notes) && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileCheck className="size-5 text-emerald-600" />
                  <h2 className="font-display text-base font-bold text-emerald-950">
                    Corrective Action & Rectification Sign-off
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                  RESOLVED
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-slate-600 font-semibold block">Rectification Notes:</span>
                <p className="bg-white p-4 rounded-xl border border-emerald-200/80 text-slate-800 leading-relaxed font-medium">
                  {issue.resolution_notes || "Corrective action completed and verified by engineering team."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                <div className="rounded-xl bg-white p-3 border border-emerald-100 text-xs">
                  <span className="text-slate-500 font-medium block">Executed / Resolved By:</span>
                  <strong className="text-slate-900">{issue.resolved_by ?? issue.assigned_to}</strong>
                </div>

                <div className="rounded-xl bg-white p-3 border border-emerald-100 text-xs">
                  <span className="text-slate-500 font-medium block">Resolution Timestamp:</span>
                  <strong className="text-slate-900">{formatDateTime(issue.resolved_at)}</strong>
                </div>
              </div>

              {issue.resolution_attachment && (
                <div className="border-t border-emerald-100 pt-2.5">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    Proof of Fix / Lab Re-Test Certificate:
                  </span>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs text-emerald-900 font-mono">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>{issue.resolution_attachment}</span>
                  </div>
                </div>
              )}

              {/* QA Sign-off Remarks */}
              {issue.closed_at && (
                <div className="rounded-xl border border-slate-200 bg-slate-900 text-white p-4 space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="size-4" /> QA Sign-off Closed
                    </span>
                    <span className="text-slate-400 text-[11px]">{formatDateTime(issue.closed_at)}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {issue.closing_remarks || "Verified and approved on site by Quality Auditor."}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Sign-off Authority: <strong className="text-white">{issue.closed_by ?? CURRENT_USER.name}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Resolution Audit Trail & Activity Comments */}
        <div className="space-y-6">
          {/* Resolution Lifecycle Audit Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5">
            <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Lifecycle Audit Trail
            </h3>

            <div className="space-y-3 text-xs">
              {/* 1. Logged */}
              <div className="flex items-start gap-2.5">
                <span className="size-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">1. Logged & Reported</p>
                  <p className="text-[11px] text-slate-500">
                    By <strong>{issue.created_by}</strong> on {formatDateTime(issue.created_at)}
                  </p>
                </div>
              </div>

              {/* 2. Assigned */}
              {issue.assigned_at ? (
                <div className="flex items-start gap-2.5">
                  <span className="size-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">2. Assigned to Lead</p>
                    <p className="text-[11px] text-slate-500">
                      Assigned to <strong>{issue.assigned_to}</strong> on {formatDateTime(issue.assigned_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 opacity-60">
                  <span className="size-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-600">2. Assigned to Lead</p>
                    <p className="text-[11px] text-slate-400">{issue.assigned_to}</p>
                  </div>
                </div>
              )}

              {/* 3. In Progress */}
              {issue.in_progress_at ? (
                <div className="flex items-start gap-2.5">
                  <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">3. Containment Started</p>
                    <p className="text-[11px] text-slate-500">
                      By <strong>{issue.in_progress_by ?? issue.assigned_to}</strong> on {formatDateTime(issue.in_progress_at)}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* 4. Resolved */}
              {issue.resolved_at ? (
                <div className="flex items-start gap-2.5">
                  <span className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">4. Rectification Completed</p>
                    <p className="text-[11px] text-slate-500">
                      By <strong>{issue.resolved_by ?? issue.assigned_to}</strong> on {formatDateTime(issue.resolved_at)}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* 5. Closed */}
              {issue.closed_at ? (
                <div className="flex items-start gap-2.5">
                  <span className="size-2 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">5. QA Sign-off & Closed</p>
                    <p className="text-[11px] text-slate-500">
                      By <strong>{issue.closed_by ?? CURRENT_USER.name}</strong> on {formatDateTime(issue.closed_at)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Activity Notes & Comments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Investigation & Progress Notes ({issue.comments.length})
                </h3>
              </div>
            </div>

            {/* Comment List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {issue.comments.length > 0 ? (
                issue.comments.map((c) => (
                  <div
                    key={c.id}
                    className="group rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-1 relative"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-900">{c.author}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">{formatDateTime(c.created_at)}</span>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity"
                          title="Delete note"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 text-center py-4">No notes posted yet</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <Textarea
                placeholder="Post an investigation update, lab test result, or note..."
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="text-xs rounded-xl"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="size-3" /> Post Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODALS ─── */}

      {/* 1. Resolve Defect Modal */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="font-display text-slate-900">Resolve Defect / NCR</DialogTitle>
                <DialogDescription className="text-xs">
                  Record corrective action details, who performed the rectification, and attach verification proofs.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleConfirmResolve} className="space-y-3.5 py-2">
            {/* Who is done */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Who executed / resolved this? *</Label>
              <Select value={resolvedByMode} onValueChange={setResolvedByMode}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {PEOPLE.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      👤 {p}
                    </SelectItem>
                  ))}
                  <SelectItem value="OTHER" className="text-xs font-semibold text-primary">
                    ➕ Other Contractor / Engineer...
                  </SelectItem>
                </SelectContent>
              </Select>

              {resolvedByMode === "OTHER" && (
                <Input
                  placeholder="Enter Name & Subcontractor Role..."
                  value={resolvedByCustom}
                  onChange={(e) => setResolvedByCustom(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              )}
            </div>

            {/* Corrective Action Notes */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Corrective Action Taken *</Label>
              <Textarea
                placeholder="Describe how the defect was rectified (e.g. Rebar re-aligned, epoxy injection applied, re-tested to 28 MPa)..."
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            {/* Proof Attachment */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Proof of Fix File / Certificate (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="e.g. QA-RETEST-PASS-CERT.pdf"
                  value={resolutionAttachment}
                  onChange={(e) => setResolutionAttachment(e.target.value)}
                  className="text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const code = project?.code ?? "SITE";
                    setResolutionAttachment(`QA-FIX-${code}-RETEST-PASS.pdf`);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-200 whitespace-nowrap"
                >
                  + Sample Doc
                </button>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all"
              >
                Submit Resolution
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. QA Sign-off & Close Modal */}
      <Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <ShieldCheck className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="font-display text-slate-900">QA Sign-off & Close NCR</DialogTitle>
                <DialogDescription className="text-xs">
                  Final engineering closure. This certifies the defect is fully rectified according to ISO standards.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleConfirmClose} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Signing Quality Auditor</Label>
              <Input
                value={closedBy}
                onChange={(e) => setClosedBy(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-800">Closing Remarks & Verification Statement</Label>
              <Textarea
                rows={3}
                value={closingRemarks}
                onChange={(e) => setClosingRemarks(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setCloseModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
              >
                Approve & Close Defect
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Reassign Lead Modal */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-primary">
                <UserCheck className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="font-display text-slate-900">Reassign Defect Responsibility</DialogTitle>
                <DialogDescription className="text-xs">
                  Transfer resolution assignment to another engineer or subcontractor.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-bold text-slate-800">Assign To</Label>
              <Select value={reassignMode} onValueChange={setReassignMode}>
                <SelectTrigger className="h-9 text-xs">
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
              <Input
                placeholder="Enter Name & Subcontractor Role..."
                value={reassignCustom}
                onChange={(e) => setReassignCustom(e.target.value)}
                className="text-xs"
                required
              />
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
              onClick={handleConfirmReassign}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
            >
              Save Reassignment
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Start Containment Modal */}
      <Dialog open={startProgressModalOpen} onOpenChange={setStartProgressModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">Start Containment Work</DialogTitle>
            <DialogDescription className="text-xs">
              Mark this defect as In Progress. This updates the site telemetry and logs when work began.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-xs font-bold text-slate-800">Initial Containment Notes (Optional)</Label>
            <Textarea
              placeholder="e.g. Scaffolding assembled, area cordoned off, structural consultant notified..."
              rows={3}
              value={startProgressNotes}
              onChange={(e) => setStartProgressNotes(e.target.value)}
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setStartProgressModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmStartProgress}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
            >
              Start Containment
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Reopen Modal */}
      <Dialog open={reopenModalOpen} onOpenChange={setReopenModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <RotateCcw className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="font-display text-slate-900">Re-open Defect</DialogTitle>
                <DialogDescription className="text-xs">
                  Re-opens this defect and sets status back to In Progress for additional work.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleConfirmReopen} className="space-y-3 py-2">
            <Label className="text-xs font-bold text-slate-800">Reason for Re-opening</Label>
            <Textarea
              placeholder="e.g. Compression test results did not meet specifications; rework required..."
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="text-xs"
              required
            />

            <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setReopenModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700"
              >
                Re-open NCR
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="font-display text-slate-900">Delete Defect Record</DialogTitle>
                <DialogDescription className="text-xs">
                  Are you sure you want to permanently delete this NCR record? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
            <p className="font-bold text-slate-900">{issue.title}</p>
            <p className="text-slate-500 mt-0.5">{issue.description}</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteIssue}
              className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
            >
              Confirm Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
