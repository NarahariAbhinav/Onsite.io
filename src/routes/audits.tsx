import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Building2,
  FileText,
  ShieldCheck,
  Calendar,
  Layers,
  Printer,
  ChevronRight,
  UserCheck,
  Award,
  X,
  AlertOctagon,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
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
  PEOPLE,
  useSiteflow,
  type AuditRecord,
  type AuditFinding,
  type AuditType,
  type AuditFindingSeverity,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audits")({
  component: AuditsPage,
});

function AuditsPage() {
  const state = useSiteflow();

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Modal States
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [executingAudit, setExecutingAudit] = useState<AuditRecord | null>(null);
  const [viewingAudit, setViewingAudit] = useState<AuditRecord | null>(null);

  // New Audit Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<AuditType>("Internal QA/QC Audit");
  const [newProjectId, setNewProjectId] = useState(state.projects[0]?.id || "");
  const [newSopId, setNewSopId] = useState(state.sops[0]?.id || "");
  const [newAuditor, setNewAuditor] = useState("Quality Manager");
  const [newAuditee, setNewAuditee] = useState(CURRENT_USER.name);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0] ?? "");

  // Execution Checklist State
  const [executionFindings, setExecutionFindings] = useState<AuditFinding[]>([]);
  const [executionSummary, setExecutionSummary] = useState("");

  // Filtered audits
  const filteredAudits = state.audits.filter((a) => {
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    if (typeFilter !== "All" && a.audit_type !== typeFilter) return false;
    return true;
  });

  // Calculate KPIs
  const totalAudits = state.audits.length;
  const completedAudits = state.audits.filter((a) => a.status === "Completed");
  const passedAudits = completedAudits.filter((a) => a.passed);
  const totalFindings = state.audits.reduce(
    (acc, a) => acc + a.findings.filter((f) => !f.passed).length,
    0
  );
  const avgScore =
    completedAudits.length > 0
      ? Math.round(
          completedAudits.reduce((acc, a) => acc + (a.overall_score || 0), 0) /
            completedAudits.length
        )
      : 100;

  // Handle Schedule Submit
  const handleScheduleAudit = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter an audit inspection title.");
      return;
    }
    if (!newProjectId || !newSopId) {
      toast.error("Please select a project and SOP procedure.");
      return;
    }

    const id = actions.scheduleAudit({
      title: newTitle,
      audit_type: newType,
      project_id: newProjectId,
      sop_id: newSopId,
      auditor_name: newAuditor,
      lead_auditee: newAuditee,
      scheduled_date: newDate,
    });

    toast.success(`Quality Audit scheduled successfully.`);
    setScheduleModalOpen(false);
    setNewTitle("");
  };

  // Open Execution Modal
  const startExecution = (audit: AuditRecord) => {
    setExecutingAudit(audit);
    // Deep clone findings for editing
    setExecutionFindings(
      audit.findings.map((f) => ({
        ...f,
        observation: f.observation || "Compliant with specification.",
      }))
    );
    setExecutionSummary(audit.summary_notes || "");
  };

  // Submit Execution
  const handleSubmitExecution = () => {
    if (!executingAudit) return;

    actions.submitAuditExecution(
      executingAudit.id,
      executionFindings,
      executionSummary || "Quality audit inspection completed on site."
    );

    const nonCompliantCount = executionFindings.filter((f) => !f.passed).length;
    if (nonCompliantCount > 0) {
      toast.warning(
        `Audit completed! ${nonCompliantCount} Non-Conformance Reports (NCRs) auto-generated in Defect Tracker.`
      );
    } else {
      toast.success("Audit completed with 100% compliance! No deviations recorded.");
    }

    setExecutingAudit(null);
  };

  // Update Finding Status
  const updateFinding = (index: number, updates: Partial<AuditFinding>) => {
    setExecutionFindings((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  return (
    <AppShell>
      <PageHeader
        title="SOP Compliance & Quality Audit Management"
        subtitle="Mandatory ISO 9001:2015 Clause 9.2 internal audits, checklist execution, finding classification, and automatic NCR generation."
        actions={
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="size-4" /> Schedule New Audit
          </button>
        }
      />

      {/* Top Scorecard Stats Banner */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Audits
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <ClipboardCheck className="size-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 mt-2">
            {totalAudits}
          </p>
          <span className="text-xs font-semibold text-slate-500">
            {completedAudits.length} Completed · {totalAudits - completedAudits.length} Scheduled
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Audit Pass Rate
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-emerald-950 mt-2">
            {completedAudits.length > 0
              ? Math.round((passedAudits.length / completedAudits.length) * 100)
              : 100}
            %
          </p>
          <span className="text-xs text-emerald-700 font-medium">
            ≥80% Compliance Benchmark
          </span>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Average Adherence Score
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Award className="size-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-blue-950 mt-2">
            {avgScore}%
          </p>
          <span className="text-xs text-blue-700 font-medium">Across all inspected SOP steps</span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Audit Deviations & NCRs
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="size-4" />
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-rose-950 mt-2">
            {totalFindings}
          </p>
          <span className="text-xs text-rose-700 font-medium">Auto-generated NCR tickets</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 mr-2">Filter Status:</span>
          {["All", "Scheduled", "Completed", "Cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={cn(
                "rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer",
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">Audit Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 focus:border-primary focus:outline-hidden text-xs"
          >
            <option value="All">All Audit Types</option>
            <option value="Internal QA/QC Audit">Internal QA/QC Audit</option>
            <option value="Statutory Safety Audit">Statutory Safety Audit</option>
            <option value="Client Compliance Audit">Client Compliance Audit</option>
            <option value="Process Adherence Audit">Process Adherence Audit</option>
          </select>
        </div>
      </div>

      {/* Audits Card List */}
      <div className="space-y-4">
        {filteredAudits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-500">
            No audits matching the selected filter criteria.
          </div>
        ) : (
          filteredAudits.map((audit) => {
            const passedCount = audit.findings.filter((f) => f.passed).length;
            const deviationCount = audit.findings.filter((f) => !f.passed).length;

            return (
              <div
                key={audit.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                        {audit.audit_number}
                      </span>
                      <span className="rounded-full bg-primary/10 text-primary font-bold px-2.5 py-0.5 text-[10px]">
                        {audit.audit_type}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                        <Building2 className="size-3.5 text-slate-400" /> {audit.project_name}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900 leading-tight">
                      {audit.title}
                    </h3>
                  </div>

                  {/* Status & Score Pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    {audit.status === "Completed" ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5",
                            audit.passed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          )}
                        >
                          {audit.passed ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : (
                            <AlertTriangle className="size-3.5" />
                          )}
                          {audit.overall_score}% {audit.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                    ) : audit.status === "Scheduled" ? (
                      <span className="rounded-full bg-amber-100 text-amber-800 font-bold px-3 py-1 text-xs flex items-center gap-1.5">
                        <Clock className="size-3.5" /> Scheduled
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 text-slate-600 font-bold px-3 py-1 text-xs">
                        {audit.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Audit Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs mb-4">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Governed Procedure
                    </span>
                    <strong className="text-slate-900 block font-bold text-xs mt-0.5">
                      {audit.sop_name} ({audit.sop_version})
                    </strong>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Auditor & Auditee
                    </span>
                    <strong className="text-slate-900 block font-bold text-xs mt-0.5">
                      Auditor: {audit.auditor_name}
                    </strong>
                    <span className="text-slate-500 block text-[11px]">
                      Auditee: {audit.lead_auditee}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Inspection Schedule
                    </span>
                    <strong className="text-slate-900 block font-bold text-xs mt-0.5">
                      {audit.scheduled_date}
                    </strong>
                    <span className="text-slate-500 block text-[11px]">
                      {audit.completed_date ? `Completed: ${new Date(audit.completed_date).toLocaleDateString()}` : "Pending Field Execution"}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Finding Summary
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 font-bold">
                      <span className="text-emerald-700">{passedCount} Compliant</span>
                      <span className="text-slate-300">·</span>
                      <span className={deviationCount > 0 ? "text-rose-700" : "text-slate-400"}>
                        {deviationCount} Deviations
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audit Summary remarks if completed */}
                {audit.summary_notes && (
                  <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-200/80 text-xs text-slate-700 mb-4">
                    <strong>Auditor Remarks:</strong> {audit.summary_notes}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {audit.findings.length} Checkpoints Inspected
                  </span>

                  <div className="flex items-center gap-2">
                    {audit.status === "Scheduled" ? (
                      <button
                        type="button"
                        onClick={() => startExecution(audit)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                      >
                        <ClipboardCheck className="size-4" /> Execute Audit Checklist
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setViewingAudit(audit)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <FileText className="size-3.5" /> View Findings & Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SCHEDULE NEW AUDIT (BRD SECTION 7.13.1)                         */}
      {/* ========================================================================= */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-slate-900">
              Schedule Quality & Compliance Audit
            </DialogTitle>
            <DialogDescription className="text-xs">
              Plan an internal QA/QC or statutory compliance audit for a designated project and procedure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Audit Title / Inspection Focus *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Tower B Floor 14 Shoring & Reinforcement Check"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Audit Type *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as AuditType)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                >
                  <option value="Internal QA/QC Audit">Internal QA/QC Audit</option>
                  <option value="Statutory Safety Audit">Statutory Safety Audit</option>
                  <option value="Client Compliance Audit">Client Compliance Audit</option>
                  <option value="Process Adherence Audit">Process Adherence Audit</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Project Site *</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                >
                  {state.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Target SOP *</label>
                <select
                  value={newSopId}
                  onChange={(e) => setNewSopId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                >
                  {state.sops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.version_number || "V1.0"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Lead Auditor *</label>
                <select
                  value={newAuditor}
                  onChange={(e) => setNewAuditor(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                >
                  {PEOPLE.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Lead Auditee *</label>
                <select
                  value={newAuditee}
                  onChange={(e) => setNewAuditee(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                >
                  {PEOPLE.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleScheduleAudit}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
            >
              Schedule Audit
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: LIVE AUDIT EXECUTION CHECKLIST (BRD SECTION 7.13.2)             */}
      {/* ========================================================================= */}
      <Dialog open={!!executingAudit} onOpenChange={(open) => !open && setExecutingAudit(null)}>
        <DialogContent className="sm:max-w-3xl rounded-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          {executingAudit && (
            <>
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                      {executingAudit.audit_number}
                    </span>
                    <span className="text-xs text-slate-400">
                      {executingAudit.project_name} · {executingAudit.sop_name}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold">
                    Execute Audit: {executingAudit.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setExecutingAudit(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Scrollable Checkpoints */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-left">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-amber-950 flex items-start gap-2.5">
                  <AlertOctagon className="size-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Rule BR-07:</strong> Marking any checkpoint as <em>Minor Deviation</em>, <em>Major Non-Conformance</em>, or <em>Critical Safety Failure</em> will automatically generate an actionable <strong>NCR ticket</strong> in the Defects & CAPA Tracker upon submission.
                  </p>
                </div>

                <div className="space-y-4">
                  {executionFindings.map((finding, idx) => (
                    <div
                      key={finding.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all space-y-3",
                        finding.passed
                          ? "border-slate-200 bg-white"
                          : "border-rose-200 bg-rose-50/20 ring-1 ring-rose-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Checkpoint {idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {finding.step_title}
                          </h4>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() =>
                              updateFinding(idx, {
                                passed: true,
                                status: "Compliant",
                                severity: "Low",
                              })
                            }
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer",
                              finding.passed
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            )}
                          >
                            ✓ Compliant
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateFinding(idx, {
                                passed: false,
                                status: "Major Non-Conformance",
                                severity: "High",
                              })
                            }
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer",
                              !finding.passed
                                ? "bg-rose-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            )}
                          >
                            ✗ Deviation / NCR
                          </button>
                        </div>
                      </div>

                      {/* Observations Field */}
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Auditor Observations & Evidence Notes:
                        </label>
                        <textarea
                          rows={2}
                          value={finding.observation}
                          onChange={(e) =>
                            updateFinding(idx, { observation: e.target.value })
                          }
                          placeholder="Record physical measurements, cover block clearance, instrument numbers..."
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary focus:outline-hidden"
                        />
                      </div>

                      {/* Deviation Specific Fields */}
                      {!finding.passed && (
                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-rose-100">
                          <div>
                            <label className="font-bold text-rose-900 block mb-1">
                              Deviation Severity:
                            </label>
                            <select
                              value={finding.severity}
                              onChange={(e) =>
                                updateFinding(idx, {
                                  severity: e.target.value as AuditFindingSeverity,
                                })
                              }
                              className="w-full rounded-lg border border-rose-300 bg-white px-2 py-1.5 text-xs text-rose-950"
                            >
                              <option value="Low">Low (Minor Non-Conformance)</option>
                              <option value="Medium">Medium (Correction Required)</option>
                              <option value="High">High (Immediate Action Required)</option>
                              <option value="Critical">Critical Safety / Structural Stop</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-rose-900 block mb-1">
                              Corrective Action Required:
                            </label>
                            <input
                              type="text"
                              value={finding.corrective_action_required || ""}
                              onChange={(e) =>
                                updateFinding(idx, {
                                  corrective_action_required: e.target.value,
                                })
                              }
                              placeholder="e.g. Replace spacer blocks within 2 hours"
                              className="w-full rounded-lg border border-rose-300 px-2 py-1.5 text-xs focus:border-rose-500 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Overall Summary Notes */}
                <div className="pt-2">
                  <label className="font-bold text-slate-900 block mb-1">
                    Final Audit Conclusions & Remarks:
                  </label>
                  <textarea
                    rows={3}
                    value={executionSummary}
                    onChange={(e) => setExecutionSummary(e.target.value)}
                    placeholder="Enter comprehensive findings summary and sign-off notes..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between shrink-0">
                <div className="text-xs">
                  <span className="text-slate-500">Live Score: </span>
                  <strong className="text-slate-900 font-bold">
                    {executionFindings.length > 0
                      ? Math.round(
                          (executionFindings.filter((f) => f.passed).length /
                            executionFindings.length) *
                            100
                        )
                      : 100}
                    %
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExecutingAudit(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitExecution}
                    className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                  >
                    Complete & Sign Off Audit
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: AUDIT SUMMARY & PRINT REPORT DIALOG                              */}
      {/* ========================================================================= */}
      <Dialog open={!!viewingAudit} onOpenChange={(open) => !open && setViewingAudit(null)}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-6 text-left">
          {viewingAudit && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800">
                      {viewingAudit.audit_number}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {viewingAudit.audit_type}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mt-1">
                    {viewingAudit.title}
                  </h3>
                </div>

                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    viewingAudit.passed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  )}
                >
                  {viewingAudit.overall_score}% {viewingAudit.passed ? "PASSED" : "FAILED"}
                </span>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Project</span>
                  <strong>{viewingAudit.project_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">SOP</span>
                  <strong>{viewingAudit.sop_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Auditor</span>
                  <strong>{viewingAudit.auditor_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Auditee</span>
                  <strong>{viewingAudit.lead_auditee}</strong>
                </div>
              </div>

              {/* Remarks */}
              {viewingAudit.summary_notes && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                  <strong className="block font-bold text-slate-900 mb-0.5">Auditor Remarks:</strong>
                  {viewingAudit.summary_notes}
                </div>
              )}

              {/* Checkpoints Breakdown */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto text-xs pr-1">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Inspected Checkpoints ({viewingAudit.findings.length}):
                </span>

                {viewingAudit.findings.map((f, i) => (
                  <div
                    key={f.id}
                    className={cn(
                      "rounded-lg border p-3 flex flex-col justify-between",
                      f.passed
                        ? "border-slate-100 bg-slate-50/50"
                        : "border-rose-200 bg-rose-50/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">
                        {i + 1}. {f.step_title}
                      </strong>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold",
                          f.passed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        )}
                      >
                        {f.status}
                      </span>
                    </div>

                    <p className="text-slate-600 mt-1">{f.observation}</p>

                    {f.ncr_id && (
                      <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center justify-between text-rose-700 font-bold text-[11px]">
                        <span>NCR Created: {f.ncr_id}</span>
                        <Link
                          to="/issues"
                          className="hover:underline flex items-center gap-1 text-primary"
                        >
                          View in Defects Tracker →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Printer className="size-3.5" /> Print Audit Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setViewingAudit(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
