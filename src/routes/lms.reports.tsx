import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useSiteflow, CURRENT_USER,
  type EmployeeQualification,
} from "@/lib/siteflow-store";
import {
  BarChart3, Search, Filter, Download, Printer, Award, ShieldCheck,
  CheckCircle2, XCircle, Clock, Calendar, AlertTriangle, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/lms/reports")({
  component: LmsReportsPage,
});

function LmsReportsPage() {
  const state = useSiteflow();
  const [activeSection, setActiveSection] = useState<"sop_learning" | "quiz_perf" | "competency">("sop_learning");
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Certificate Modal Preview State
  const [viewingCertificate, setViewingCertificate] = useState<EmployeeQualification | null>(null);

  // Departments list
  const departments = ["All", ...Array.from(new Set(state.sops.map((s) => s.department)))];

  // Helper: check qualification status
  const getLearnerSopRecords = () => {
    const records: Array<{
      id: string;
      user_name: string;
      sop_name: string;
      sop_version: string;
      department: string;
      progress_pct: number;
      quiz_score: number | null;
      quiz_passed: boolean;
      assessment_status: string;
      qualification: EmployeeQualification | null;
      status: "Qualified" | "In Progress" | "Pending Assessment" | "Exam Failed";
    }> = [];

    // Combine users and SOPs
    state.sops.forEach((sop) => {
      const attempts = state.quizAttempts.filter((a) => a.sop_id === sop.id);
      const passedAttempt = attempts.find((a) => a.passed);
      const assessment = state.assessments.find((a) => a.sop_id === sop.id);
      const qual = state.qualifications.find((q) => q.sop_id === sop.id);
      const progress = state.learningProgress.find((lp) => lp.sop_id === sop.id);

      const isQualified = Boolean(qual);
      const quizPassed = Boolean(passedAttempt);
      const quizScore = passedAttempt ? passedAttempt.score_pct : attempts[0]?.score_pct ?? null;

      let status: "Qualified" | "In Progress" | "Pending Assessment" | "Exam Failed" = "In Progress";
      if (isQualified) status = "Qualified";
      else if (quizPassed && assessment?.status === "Under Evaluation") status = "Pending Assessment";
      else if (attempts.length > 0 && !quizPassed) status = "Exam Failed";

      records.push({
        id: `${sop.id}-${qual?.user_name ?? CURRENT_USER.name}`,
        user_name: qual?.user_name ?? CURRENT_USER.name,
        sop_name: sop.name,
        sop_version: sop.version_number ?? "V1.0",
        department: sop.department,
        progress_pct: qual ? 100 : progress?.progress_pct ?? (quizPassed ? 70 : 30),
        quiz_score: quizScore,
        quiz_passed: quizPassed,
        assessment_status: assessment?.status ?? "Not Assigned",
        qualification: qual ?? null,
        status,
      });
    });

    return records;
  };

  const allRecords = getLearnerSopRecords();

  const filteredRecords = allRecords.filter((r) => {
    const matchSearch = `${r.user_name} ${r.sop_name}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "All" || r.department === filterDept;
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  // Quiz Performance Metrics
  const totalAttempts = state.quizAttempts.length;
  const passedAttempts = state.quizAttempts.filter((a) => a.passed).length;
  const avgScore = totalAttempts > 0
    ? Math.round(state.quizAttempts.reduce((acc, a) => acc + a.score_pct, 0) / totalAttempts)
    : 0;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const lockedUsersCount = state.quizAttempts.filter((a) => a.is_locked).length;

  // Competency Metrics
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const totalQuals = state.qualifications.length;
  const expiringCount = state.qualifications.filter((q) => {
    const exp = new Date(q.expires_at);
    return exp > now && exp <= thirtyDays;
  }).length;
  const expiredCount = state.qualifications.filter((q) => new Date(q.expires_at) < now).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">LMS Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit-grade compliance records, competency metrics, and learning completion statistics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="size-3.5" /> Print / Export
          </button>
        </div>
      </div>

      {/* Report Section Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection("sop_learning")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
            activeSection === "sop_learning"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          SOP Learning Report ({allRecords.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("quiz_perf")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
            activeSection === "quiz_perf"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          Quiz Performance Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("competency")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
            activeSection === "competency"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          Competency & Expiry Summary
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: SOP LEARNING REPORT (MASTER TABLE)                             */}
      {/* ========================================================================= */}
      {activeSection === "sop_learning" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Department:</span>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Qualified">Qualified</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Assessment">Pending Assessment</option>
                  <option value="Exam Failed">Exam Failed</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search report..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Learner</th>
                    <th className="px-4 py-3">SOP Name</th>
                    <th className="px-4 py-3">Dept / Ver</th>
                    <th className="px-4 py-3 text-center">Progress</th>
                    <th className="px-4 py-3 text-center">Quiz Result</th>
                    <th className="px-4 py-3 text-center">Assessment</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        No learning records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {r.user_name}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {r.sop_name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-slate-600 font-medium">{r.department}</span>
                          <span className="ml-1 text-[10px] font-mono text-slate-400">({r.sop_version})</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="w-20 mx-auto">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                              <span>{r.progress_pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  r.progress_pct >= 100 ? "bg-emerald-500" : "bg-primary"
                                )}
                                style={{ width: `${r.progress_pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {r.quiz_score !== null ? (
                            <span className={cn("font-bold", r.quiz_passed ? "text-emerald-700" : "text-rose-600")}>
                              {r.quiz_score}% ({r.quiz_passed ? "Pass" : "Fail"})
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Not Taken</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {r.assessment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {r.status === "Qualified" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                              <CheckCircle2 className="size-3" /> Qualified
                            </span>
                          ) : r.status === "Pending Assessment" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                              <Clock className="size-3" /> Assessment Pending
                            </span>
                          ) : r.status === "Exam Failed" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                              <XCircle className="size-3" /> Exam Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              In Progress
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {r.qualification ? (
                            <button
                              type="button"
                              onClick={() => setViewingCertificate(r.qualification)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <Award className="size-3" /> View Cert
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[11px] italic">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: QUIZ PERFORMANCE ANALYTICS                                    */}
      {/* ========================================================================= */}
      {activeSection === "quiz_perf" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Attempts</span>
              <p className="font-display text-2xl font-extrabold text-slate-900">{totalAttempts}</p>
              <span className="text-[11px] text-slate-400">Logged exam runs</span>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">Pass Rate</span>
              <p className="font-display text-2xl font-extrabold text-emerald-950">{passRate}%</p>
              <span className="text-[11px] text-emerald-700">{passedAttempts} successful</span>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-1">Average Score</span>
              <p className="font-display text-2xl font-extrabold text-blue-950">{avgScore}%</p>
              <span className="text-[11px] text-blue-700">Across all quizzes</span>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block mb-1">Locked Exhausted</span>
              <p className="font-display text-2xl font-extrabold text-rose-950">{lockedUsersCount}</p>
              <span className="text-[11px] text-rose-700">Needs QA unlock</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="font-display text-sm font-bold text-slate-900 mb-3">Quiz-by-Quiz Breakdown</h3>
            <div className="divide-y divide-slate-100">
              {state.quizzes.map((q) => {
                const attempts = state.quizAttempts.filter((a) => a.sop_id === q.sop_id || a.quiz_id === q.id);
                const passed = attempts.filter((a) => a.passed).length;
                const rate = attempts.length > 0 ? Math.round((passed / attempts.length) * 100) : 0;
                const sop = state.sops.find((s) => s.id === q.sop_id);

                return (
                  <div key={q.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{q.title}</p>
                      <span className="text-[11px] text-slate-400">{sop?.name} ({sop?.department}) · Pass mark: {q.passing_pct}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] font-bold mb-0.5">
                          <span>Pass Rate</span>
                          <span className="text-emerald-700">{rate}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                      <span className="text-slate-500 font-semibold">{passed} / {attempts.length} Passed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: COMPETENCY & QUALIFICATION EXPIRY SUMMARY                     */}
      {/* ========================================================================= */}
      {activeSection === "competency" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">Total Qualified</span>
              <p className="font-display text-2xl font-extrabold text-emerald-950">{totalQuals}</p>
              <span className="text-[11px] text-emerald-700">Valid ISO credentials</span>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Expiring in 30 Days</span>
              <p className="font-display text-2xl font-extrabold text-amber-950">{expiringCount}</p>
              <span className="text-[11px] text-amber-700">Needs re-certification</span>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block mb-1">Expired</span>
              <p className="font-display text-2xl font-extrabold text-rose-950">{expiredCount}</p>
              <span className="text-[11px] text-rose-700">Uncontrolled on site</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="font-display text-sm font-bold text-slate-900 mb-4">Official Qualifications Register</h3>
            {state.qualifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No digital certificates issued yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5">Learner</th>
                      <th className="px-3 py-2.5">Qualified SOP</th>
                      <th className="px-3 py-2.5">Certificate Number</th>
                      <th className="px-3 py-2.5 text-center">Exam Score</th>
                      <th className="px-3 py-2.5">Issued Date</th>
                      <th className="px-3 py-2.5">Valid Until</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.qualifications.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2.5 font-bold text-slate-900">{q.user_name}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{q.sop_title}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-500 text-[11px]">{q.certificate_number}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-emerald-700">{q.quiz_score_pct}%</td>
                        <td className="px-3 py-2.5 text-slate-600">{q.issued_at}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-700">{q.expires_at}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingCertificate(q)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <Award className="size-3 text-amber-500" /> Certificate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL DIGITAL QUALIFICATION CERTIFICATE                         */}
      {/* ========================================================================= */}
      <Dialog open={!!viewingCertificate} onOpenChange={(open) => !open && setViewingCertificate(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-0 shadow-2xl" style={{ borderRadius: "16px" }}>
          {viewingCertificate && (
            <div
              className="relative bg-white"
              style={{
                background: "linear-gradient(160deg, #fffdf5 0%, #ffffff 40%, #f8f9ff 100%)",
              }}
            >
              {/* Gold top stripe */}
              <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #b7791f, #d69e2e, #f6e05e, #d69e2e, #b7791f)" }} />

              {/* Outer decorative border */}
              <div className="m-4 rounded-xl border-2 border-amber-300/60 p-6 space-y-5">
                {/* Header: Logo + ISO badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-sm shadow-md">
                      SF
                    </div>
                    <div>
                      <p className="font-display text-[15px] font-extrabold text-slate-900 leading-tight">SiteFlow Global Construction</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Quality Compliance & Workforce Accreditation</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                      <ShieldCheck className="size-3" /> ISO 9001:2015
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">ACCREDITED</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-amber-200" />

                {/* Certificate Title */}
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em]">✦ Official Credential of Competency ✦</p>
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
                    Certificate of Technical Competency
                  </h2>
                  <p className="text-xs text-slate-500">This official document certifies that</p>
                </div>

                {/* Recipient Name */}
                <div className="text-center">
                  <p className="font-display text-3xl font-black text-primary" style={{ letterSpacing: "-0.02em" }}>
                    {viewingCertificate.user_name}
                  </p>
                  <div className="mt-1 h-0.5 w-32 mx-auto" style={{ background: "linear-gradient(90deg, transparent, #d69e2e, transparent)" }} />
                </div>

                {/* Description */}
                <div className="text-center">
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    has demonstrated rigorous mastery of engineering standards, safe execution controls, and quality verification checkpoints for:
                  </p>
                  <p className="font-display text-base font-bold text-slate-900 mt-2">
                    {viewingCertificate.sop_title}
                  </p>
                  <span className="inline-block mt-1 font-mono text-[10px] font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                    {viewingCertificate.version_number}
                  </span>
                </div>

                {/* Score badges */}
                <div className="grid grid-cols-3 gap-2 bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-center text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Exam Score</p>
                    <p className="text-lg font-extrabold text-emerald-700">{viewingCertificate.quiz_score_pct}%</p>
                  </div>
                  <div className="border-x border-amber-200">
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Certificate No.</p>
                    <p className="font-bold text-slate-900 font-mono text-[10px] leading-tight">{viewingCertificate.certificate_number}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Valid Until</p>
                    <p className="font-bold text-slate-900 text-[11px]">{viewingCertificate.expires_at}</p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex items-end justify-between border-t border-amber-200 pt-4 text-xs">
                  <div className="text-left">
                    <div className="h-8 border-b border-slate-400 w-28 mb-1" />
                    <p className="font-bold text-slate-800">K. Iyer</p>
                    <p className="text-[10px] text-slate-500">Head of Quality Assurance</p>
                  </div>
                  <div className="text-center">
                    <div className="size-12 mx-auto flex items-center justify-center">
                      <Award className="size-8 text-amber-500" />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Official Seal</p>
                  </div>
                  <div className="text-right">
                    <div className="h-8 border-b border-slate-400 w-28 mb-1 ml-auto" />
                    <p className="font-bold text-slate-800">{viewingCertificate.user_name}</p>
                    <p className="text-[10px] text-slate-500">Project Director & Admin</p>
                  </div>
                </div>
              </div>

              {/* Gold bottom stripe */}
              <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #b7791f, #d69e2e, #f6e05e, #d69e2e, #b7791f)" }} />

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
                >
                  <Printer className="size-3.5" /> Print / Save Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setViewingCertificate(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
