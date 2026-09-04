import {
  Award,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CURRENT_USER,
  formatDate,
  projectProgress,
  sopProgress,
  useSiteflow,
  type Project,
} from "@/lib/siteflow-store";

export function ProjectAuditModal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}) {
  const state = useSiteflow();
  const prog = projectProgress(state, project.id);

  const assignedSops = state.projectSops.filter((ps) => ps.project_id === project.id);
  const projectIssues = state.issues.filter((i) => i.project_id === project.id);
  const openIssues = projectIssues.filter(
    (i) => i.status === "Open" || i.status === "Assigned" || i.status === "In Progress",
  );
  const resolvedIssues = projectIssues.filter(
    (i) => i.status === "Resolved" || i.status === "Closed",
  );
  const projectDocs = state.documents.filter((d) => d.project_id === project.id);
  const uploadedDocs = projectDocs.filter((d) => Boolean(d.file_name));

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <DialogTitle className="font-display text-base font-bold text-slate-900">
                  Project QA Handover & Audit Report
                </DialogTitle>
                <p className="text-xs text-slate-500">ISO 9001:2015 Quality Compliance Summary</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Printer className="size-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Printable Report Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="rounded bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                  Official QA Record · {project.code}
                </span>
                <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
                  {project.name}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">{project.location}</p>
              </div>

              <div className="text-right text-xs">
                <p className="text-slate-400 font-medium">Audit Generated Date</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Lead Auditor: <strong>{CURRENT_USER.name}</strong>
                </p>
              </div>
            </div>

            {/* Executive Summary Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SOP Compliance
                </p>
                <p className="font-display text-2xl font-bold text-slate-900 mt-1">
                  {prog.pct}%
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {prog.completed}/{prog.sops} SOPs Complete
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Defect Resolution
                </p>
                <p className="font-display text-2xl font-bold text-slate-900 mt-1">
                  {projectIssues.length > 0
                    ? `${Math.round((resolvedIssues.length / projectIssues.length) * 100)}%`
                    : "100%"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {resolvedIssues.length}/{projectIssues.length} NCRs Closed
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quality Documents
                </p>
                <p className="font-display text-2xl font-bold text-slate-900 mt-1">
                  {uploadedDocs.length}/{projectDocs.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {projectDocs.length - uploadedDocs.length === 0
                    ? "Complete"
                    : "Pending Attachments"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Project Status
                </p>
                <p className="font-display text-xl font-bold text-emerald-700 mt-1">
                  {project.status}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Admin: {project.admin}
                </p>
              </div>
            </div>

            {/* Assigned SOPs Inspection Checklist */}
            <div className="space-y-2">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Standard Operating Procedure (SOP) Audit
              </h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-200 text-xs">
                <div className="grid grid-cols-12 bg-slate-50 px-3.5 py-2 font-bold text-slate-700">
                  <span className="col-span-5">Procedure Name</span>
                  <span className="col-span-3">Department</span>
                  <span className="col-span-2">Supervisor</span>
                  <span className="col-span-2 text-right">Progress</span>
                </div>
                {assignedSops.map((ps) => {
                  const sop = state.sops.find((s) => s.id === ps.sop_id);
                  const sProg = sopProgress(state, ps.id);
                  return (
                    <div
                      key={ps.id}
                      className="grid grid-cols-12 px-3.5 py-2.5 items-center bg-white"
                    >
                      <span className="col-span-5 font-semibold text-slate-900">
                        {sop?.name ?? "SOP"}
                      </span>
                      <span className="col-span-3 text-slate-600">
                        {sop?.department}
                      </span>
                      <span className="col-span-2 text-slate-600">
                        {ps.assigned_to}
                      </span>
                      <span className="col-span-2 text-right font-bold text-slate-900">
                        {sProg.pct}% ({sProg.completed}/{sProg.total})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Non-Conformance & Defect Log */}
            <div className="space-y-2">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Non-Conformance Reports (NCR) & Corrective Action Log
              </h3>
              {projectIssues.length > 0 ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-200 text-xs">
                  <div className="grid grid-cols-12 bg-slate-50 px-3.5 py-2 font-bold text-slate-700">
                    <span className="col-span-3">Defect ID</span>
                    <span className="col-span-5">Description</span>
                    <span className="col-span-2">Priority</span>
                    <span className="col-span-2 text-right">Status</span>
                  </div>
                  {projectIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="grid grid-cols-12 px-3.5 py-2.5 items-center bg-white"
                    >
                      <span className="col-span-3 font-mono font-bold text-slate-800">
                        {issue.id}
                      </span>
                      <span className="col-span-5 truncate text-slate-700 pr-2">
                        {issue.title}
                      </span>
                      <span className="col-span-2 font-semibold text-slate-800">
                        {issue.priority}
                      </span>
                      <span
                        className={`col-span-2 text-right font-bold ${
                          issue.status === "Closed" || issue.status === "Resolved"
                            ? "text-emerald-700"
                            : "text-rose-600"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Zero defect non-conformances reported for this project.</span>
                </div>
              )}
            </div>

            {/* Statutory Quality Assurance Seal Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Award className="size-4 text-emerald-600" />
                <span>Statutory Handover & Compliance Declaration</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                This quality report certifies that standard construction operating procedures,
                testing records, and inspections have been carried out in accordance with ISO
                9001:2015 quality management principles and project specifications.
              </p>
              <div className="pt-3 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-200">
                <span>Verified by: <strong>{CURRENT_USER.name} ({CURRENT_USER.role})</strong></span>
                <span>Verification Timestamp: <strong>{new Date().toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
