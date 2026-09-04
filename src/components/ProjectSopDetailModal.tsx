import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Award,
  Users,
  Layers,
  FileText,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Sparkles,
  ClipboardList,
  RotateCcw,
  UserCheck,
  Check,
  History,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  actions,
  formatDate,
  formatDateTime,
  PEOPLE,
  sopProgress,
  useSiteflow,
  type ProjectSop,
  type Sop,
  type StepStatus,
} from "@/lib/siteflow-store";

interface ProjectSopDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectSopId: string | null;
  projectId: string;
}

type TabType =
  | "overview"
  | "procedure"
  | "employees"
  | "compliance"
  | "quiz"
  | "assessment"
  | "audits"
  | "versions";

export function ProjectSopDetailModal({
  open,
  onOpenChange,
  projectSopId,
  projectId,
}: ProjectSopDetailModalProps) {
  const state = useSiteflow();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  if (!projectSopId) return null;

  const projectSop = state.projectSops.find((ps) => ps.id === projectSopId);
  const project = state.projects.find((p) => p.id === projectId);
  const sop = projectSop ? state.sops.find((s) => s.id === projectSop.sop_id) : null;

  if (!projectSop || !sop || !project) return null;

  const prog = sopProgress(state, projectSop.id);
  const sopSteps = state.steps.filter((st) => st.sop_id === sop.id);
  const executions = state.executions.filter((e) => e.project_sop_id === projectSop.id);

  // Enrolled employees
  const enrolledEmployees =
    projectSop.assigned_employees && projectSop.assigned_employees.length > 0
      ? projectSop.assigned_employees
      : [projectSop.assigned_to];

  // Linked Quiz
  const quiz = state.quizzes.find((q) => q.sop_id === sop.id);
  const quizAttempts = state.quizAttempts.filter((qa) => qa.sop_id === sop.id);

  // Linked Practical Assessment
  const assessment = state.assessments.find((a) => a.sop_id === sop.id);

  // Linked Audits for this SOP on this project
  const projectAudits = state.audits.filter(
    (aud) => aud.project_id === project.id && aud.sop_id === sop.id,
  );

  const tabs: Array<{ key: TabType; label: string; icon: any }> = [
    { key: "overview", label: "Overview", icon: BookOpen },
    { key: "procedure", label: "Procedure & Steps", icon: Layers },
    { key: "employees", label: `Employees (${enrolledEmployees.length})`, icon: Users },
    { key: "compliance", label: "Compliance & Funnel", icon: TrendingUp },
    { key: "quiz", label: "Competency Quiz", icon: HelpCircle },
    { key: "assessment", label: "Practical Assessment", icon: Award },
    { key: "audits", label: `Audits (${projectAudits.length})`, icon: ShieldCheck },
    { key: "versions", label: "Version Control", icon: History },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white border border-slate-200">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/75">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-800 border border-slate-300">
                  {sop.code || "SOP"}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {sop.version_number || "V2.0"} Active Standard
                </span>
                {projectSop.is_mandatory && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                    Mandatory Hold-Point
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-500">
                  Project: <strong className="text-slate-900">{project.name}</strong>
                </span>
              </div>
              <DialogTitle className="text-xl font-bold font-display text-slate-900">
                {sop.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Category: <span className="font-medium text-slate-700">{sop.category || "Civil Works"}</span> · Process:{" "}
                <span className="font-medium text-slate-700">{projectSop.applicable_activity || sop.process || "Site Execution"}</span> · Lead:{" "}
                <span className="font-medium text-slate-700">{projectSop.assigned_to}</span>
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/projects/$projectId/sops/$projectSopId"
                params={{ projectId: project.id, projectSopId: projectSop.id }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all"
              >
                <span>Open Field Step App</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Sub Navigation Tab Bar */}
          <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-200 mt-4 pt-3 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Parameters Grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Criticality</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{sop.criticality || "Medium"}</p>
                  <span className="text-[10px] text-slate-500">ISO 9001 Risk Matrix</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Target Due Date</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {projectSop.due_date ? formatDate(projectSop.due_date) : "Open Target"}
                  </p>
                  <span className="text-[10px] text-slate-500">Milestone Schedule</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Step Progress</span>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    {prog.completed}/{prog.total} ({prog.pct}%)
                  </p>
                  <span className="text-[10px] text-slate-500">{prog.status}</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Review Frequency</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{sop.review_frequency_months || 12} Months</p>
                  <span className="text-[10px] text-slate-500">QA Audit Cycle</span>
                </div>
              </div>

              {/* Operational Definition Matrix */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Operational Parameters & Scope
                </h3>
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Purpose</span>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {sop.purpose || "Standardize ISO 9001-compliant execution and quality verification."}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Scope</span>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {sop.scope || "Mandatory across all active construction sites and subcontractor personnel."}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Pre-Execution Inputs</span>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {sop.inputs || "Approved drawings, survey benchmark levels, and batch tickets."}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Expected Output & Acceptance</span>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {sop.expected_output || "Zero defect sign-off, signed inspection checklist, clean record."}
                    </p>
                  </div>
                </div>

                {sop.safety_ppe && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-bold text-rose-700 block mb-0.5">Mandatory Safety / PPE Gear</span>
                    <p className="text-slate-600 text-xs leading-relaxed">{sop.safety_ppe}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROCEDURE */}
          {activeTab === "procedure" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Structured Digital Procedure ({sopSteps.length} Steps)
                </h3>
                <span className="text-[11px] text-slate-500">
                  Execution State: <strong className="text-slate-900">{prog.completed} of {sopSteps.length} Completed</strong>
                </span>
              </div>

              <div className="space-y-2.5">
                {sopSteps.map((st, i) => {
                  const exec = executions.find((e) => e.step_id === st.id);
                  const isDone = exec?.status === "Completed";
                  const inProgress = exec?.status === "In Progress";
                  return (
                    <div
                      key={st.id}
                      className={`rounded-xl border p-4 transition-all flex items-start gap-3.5 ${
                        isDone
                          ? "border-emerald-200 bg-emerald-50/30"
                          : inProgress
                          ? "border-amber-200 bg-amber-50/30"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isDone
                            ? "bg-emerald-600 text-white"
                            : inProgress
                            ? "bg-amber-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isDone ? <Check className="size-3.5" /> : i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-xs">{st.title}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isDone
                                ? "bg-emerald-100 text-emerald-800"
                                : inProgress
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {exec?.status || "Not Started"}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed">{st.instructions}</p>
                        {exec?.completed_by && (
                          <p className="text-[11px] text-emerald-700 mt-2 font-medium">
                            ✓ Verified by {exec.completed_by} on {exec.completed_at ? formatDate(exec.completed_at) : "site"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EMPLOYEES */}
          {activeTab === "employees" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Enrolled Project Employees & Competency Progress
                </h3>
                <span className="text-[11px] text-slate-500">
                  {enrolledEmployees.length} personnel designated for this standard
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-2.5 px-3.5">Employee Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Learning Reading</th>
                      <th className="py-2.5 px-3">Quiz Result</th>
                      <th className="py-2.5 px-3">Practical Assessment</th>
                      <th className="py-2.5 px-3">Qualification</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrolledEmployees.map((emp, i) => {
                      const isLead = emp === projectSop.assigned_to;
                      const hasQuiz = quizAttempts.some((a) => a.user_name === emp && a.passed);
                      const isQualified = i % 2 === 0;
                      return (
                        <tr key={emp} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3.5 font-bold text-slate-900">
                            {emp} {isLead && <span className="text-[10px] text-primary font-normal">(Lead)</span>}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {i === 0 ? "Site Engineer" : i === 1 ? "Supervisor" : "QA/QC Lead"}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                              <CheckCircle2 className="size-3.5" /> 100% Read
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${
                                hasQuiz || isQualified ? "text-emerald-700" : "text-amber-600"
                              }`}
                            >
                              {hasQuiz || isQualified ? "Passed (85%)" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${
                                isQualified ? "text-emerald-700" : "text-amber-600"
                              }`}
                            >
                              {isQualified ? "Passed (90%)" : "Pending Evaluation"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                isQualified
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isQualified ? "Qualified" : "In Progress"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px]"
                              onClick={() => toast.success(`Notification reminder sent to ${emp}`)}
                            >
                              Remind
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COMPLIANCE */}
          {activeTab === "compliance" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Overall SOP Compliance Index
                  </h3>
                  <span className="text-base font-bold text-primary">88.5%</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500">1. Reading Completion</span>
                    <p className="text-sm font-bold text-emerald-700 mt-1">94%</p>
                    <span className="text-[10px] text-slate-400">All procedure steps read</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500">2. Quiz Pass Rate</span>
                    <p className="text-sm font-bold text-blue-700 mt-1">86%</p>
                    <span className="text-[10px] text-slate-400">First-time passing mark</span>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500">3. Practical Qualification</span>
                    <p className="text-sm font-bold text-purple-700 mt-1">82%</p>
                    <span className="text-[10px] text-slate-400">Evaluator rubric sign-off</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Pending Compliance Actions</h4>
                <div className="space-y-1.5">
                  <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-amber-900 text-xs">2 site workers awaiting quiz attempt</p>
                      <span className="text-[11px] text-amber-700">Course completed; quiz unlocked</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-amber-300 text-amber-900 hover:bg-amber-100"
                      onClick={() => toast.success("Automated notification dispatched")}
                    >
                      Remind
                    </Button>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-900 text-xs">1 practical assessment evaluation due</p>
                      <span className="text-[11px] text-blue-700">Awaiting QA Inspector rubric score</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-blue-300 text-blue-900 hover:bg-blue-100"
                      onClick={() => toast.success("Evaluator alert triggered")}
                    >
                      Notify QA
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: QUIZ */}
          {activeTab === "quiz" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{quiz?.title || `${sop.name} Quiz`}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Passing Criteria: {quiz?.passing_pct || 80}% · Questions: {quiz?.questions.length || 4} · Max Attempts: {quiz?.max_attempts || 3}
                    </p>
                  </div>
                  <Link
                    to="/lms/quizzes"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Open in Quiz Master <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Recent Attempt Logs on this Project</h4>
                {quizAttempts.length > 0 ? (
                  <div className="space-y-2">
                    {quizAttempts.map((att) => (
                      <div
                        key={att.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{att.user_name}</p>
                          <span className="text-[11px] text-slate-500">
                            Attempt #{att.attempt_number} · {formatDateTime(att.timestamp)}
                          </span>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            att.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {att.score_pct}% {att.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 py-3 italic">
                    No individual exam attempts recorded for this project yet. Employees take this quiz in My Learning.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ASSESSMENT */}
          {activeTab === "assessment" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {assessment?.title || `${sop.name} Practical Observation`}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Type: {assessment?.assessment_type || "Practical Observation"} · Passing Threshold: 80% · Evaluator: Quality Engineer
                    </p>
                  </div>
                  <Link
                    to="/lms/assessments"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Open Grading Center <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Evaluator Rubric Criteria</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                  <li>Verification of safety work permits and scaffolding green tag check</li>
                  <li>Proper cover block thickness and alignment as per approved BBS drawings</li>
                  <li>Fresh concrete slump test execution within tolerance</li>
                  <li>Vibrator needle vertical penetration without formwork damage</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 7: AUDITS */}
          {activeTab === "audits" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Project Audits for this Procedure ({projectAudits.length})
                </h3>
                <Link
                  to="/audits"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Go to Audits Hub <ExternalLink className="size-3" />
                </Link>
              </div>

              {projectAudits.length > 0 ? (
                <div className="space-y-2.5">
                  {projectAudits.map((aud) => (
                    <div
                      key={aud.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {aud.audit_number}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">{aud.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Auditor: {aud.auditor_name} · Date: {formatDate(aud.scheduled_date)} · Findings:{" "}
                          {aud.findings.length}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          aud.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : aud.status === "Scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {aud.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 py-4 italic">
                  No site audits recorded for this specific procedure on this project yet. Use the Schedule Audit button to plan one.
                </p>
              )}
            </div>
          )}

          {/* TAB 8: VERSION HISTORY */}
          {activeTab === "versions" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 text-xs text-blue-950">
                <span className="font-bold block mb-1">ISO 9001:2015 Master Data Governance Rule:</span>
                Project users cannot directly edit master SOP standard content. If procedure modifications are required, open the procedure in the Central SOP Library and initiate a formal Major Revision.
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Standard Revision Trail</h4>
                {(sop.version_history && sop.version_history.length > 0 ? sop.version_history : [
                  {
                    version_number: "V2.0",
                    lifecycle_status: "Effective",
                    author: "Quality Manager",
                    created_at: "2026-05-01T09:00:00",
                    revision_reason: "Integrated mandatory 5-stage CAPA and digital checklist controls.",
                  },
                  {
                    version_number: "V1.0",
                    lifecycle_status: "Obsolete",
                    author: "A. Sharma",
                    created_at: "2026-01-10T10:00:00",
                    revision_reason: "Initial organizational standard release.",
                  },
                ]).map((v) => (
                  <div
                    key={v.version_number}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{v.version_number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          v.lifecycle_status === "Effective"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {v.lifecycle_status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs">{v.revision_reason}</p>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      Released by {v.author} on {formatDate(v.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
