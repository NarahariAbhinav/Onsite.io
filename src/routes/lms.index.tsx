import { createFileRoute, Link } from "@tanstack/react-router";
import { useSiteflow, CURRENT_USER, PEOPLE } from "@/lib/siteflow-store";
import {
  Users, BookOpen, CheckCircle2, Clock, BarChart3, Award, AlertTriangle,
  TrendingUp, Calendar, ChevronRight, GraduationCap, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lms/")({
  component: LmsDashboard,
});

function LmsDashboard() {
  const state = useSiteflow();

  const totalLearners = PEOPLE.length;
  const totalSops = state.sops.length;
  const totalAssignments = state.projectSops.length;

  // Quiz analytics
  const totalAttempts = state.quizAttempts.length;
  const passedAttempts = state.quizAttempts.filter((a) => a.passed).length;
  const failedAttempts = totalAttempts - passedAttempts;
  const quizPassPct = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  // Assessment analytics
  const assessmentPending = state.assessments.filter((a) => a.status === "Under Evaluation").length;
  const assessmentPassed = state.assessments.filter((a) => a.status === "Passed").length;

  // Qualifications
  const qualified = state.qualifications.filter((q) => q.status === "Qualified").length;
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoon = state.qualifications.filter((q) => {
    const exp = q.expires_at ? new Date(q.expires_at) : null;
    return exp && exp > now && exp <= thirtyDays;
  }).length;

  // Department completion
  const departments = Array.from(new Set(state.sops.map((s) => s.department)));
  const deptData = departments.map((dept) => {
    const deptSops = state.sops.filter((s) => s.department === dept);
    const deptQuals = state.qualifications.filter((q) =>
      deptSops.some((s) => s.id === q.sop_id)
    );
    const pct = deptSops.length > 0 ? Math.round((deptQuals.length / (deptSops.length * 2)) * 100) : 0;
    return { dept, sops: deptSops.length, qualified: deptQuals.length, pct: Math.min(pct, 100) };
  });

  const kpis = [
    { label: "Total Learners", value: totalLearners, icon: Users, color: "blue", sub: "Active employees" },
    { label: "SOPs Available", value: totalSops, icon: BookOpen, color: "slate", sub: "In SOP Library" },
    { label: "SOP Assignments", value: totalAssignments, icon: Target, color: "violet", sub: "Across all projects" },
    { label: "Quiz Pass Rate", value: `${quizPassPct}%`, icon: TrendingUp, color: "emerald", sub: `${passedAttempts} of ${totalAttempts} attempts` },
    { label: "Assessment Pending", value: assessmentPending, icon: Clock, color: "amber", sub: "Awaiting QA evaluation" },
    { label: "Qualified Staff", value: qualified, icon: Award, color: "emerald", sub: "Certificates issued" },
    { label: "Quiz Failures", value: failedAttempts, icon: AlertTriangle, color: "rose", sub: `${totalAttempts - passedAttempts} failed attempts` },
    { label: "Expiring Soon", value: expiringSoon, icon: Calendar, color: "orange", sub: "Within 30 days" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    violet: "bg-violet-50 border-violet-200 text-violet-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">LMS Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Learning & competency analytics across all construction projects.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <span className={cn("flex size-7 items-center justify-center rounded-lg border text-xs", colorMap[kpi.color])}>
                <kpi.icon className="size-3.5" />
              </span>
            </div>
            <p className="font-display text-2xl font-extrabold text-slate-900">{kpi.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quiz Performance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="font-display text-sm font-bold text-slate-900 mb-4">Quiz Performance</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-700">Pass Rate</span>
                <span className="font-bold text-emerald-700">{quizPassPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${quizPassPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-rose-600">Fail Rate</span>
                <span className="font-bold text-rose-600">{100 - quizPassPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-400 transition-all"
                  style={{ width: `${100 - quizPassPct}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
              <div>
                <p className="font-bold text-slate-900 text-base">{totalAttempts}</p>
                <p className="text-slate-400">Total Attempts</p>
              </div>
              <div>
                <p className="font-bold text-emerald-700 text-base">{passedAttempts}</p>
                <p className="text-slate-400">Passed</p>
              </div>
              <div>
                <p className="font-bold text-rose-600 text-base">{failedAttempts}</p>
                <p className="text-slate-400">Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Completion */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="font-display text-sm font-bold text-slate-900 mb-4">Department-wise Qualification</h3>
          <div className="space-y-3">
            {deptData.map((d) => (
              <div key={d.dept}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{d.dept}</span>
                  <span className="text-slate-400">{d.qualified} qualified / {d.sops} SOPs</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Qualifications + Upcoming Expiry */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-bold text-slate-900">Recent Qualifications</h3>
            <Link to="/lms/reports" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1">
              All Reports <ChevronRight className="size-3" />
            </Link>
          </div>
          {state.qualifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No qualifications issued yet.</p>
          ) : (
            <div className="space-y-2">
              {state.qualifications.slice(0, 5).map((q) => (
                <div key={q.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                  <div>
                    <p className="font-semibold text-slate-900">{q.user_name}</p>
                    <p className="text-slate-400 truncate max-w-[180px]">{q.sop_title}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 font-bold text-[10px]">
                      <CheckCircle2 className="size-2.5" /> {q.quiz_score_pct}%
                    </span>
                    <p className="text-slate-400 mt-0.5">{q.issued_at}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
          <h3 className="font-display text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Calendar className="size-4 text-amber-600" />
            Upcoming Expiry Alerts
          </h3>
          {expiringSoon === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 py-3">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span className="font-semibold">All qualifications valid for 30+ days.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {state.qualifications
                .filter((q) => {
                  const exp = q.expires_at ? new Date(q.expires_at) : null;
                  return exp && exp > now && exp <= thirtyDays;
                })
                .map((q) => (
                  <div key={q.id} className="flex items-center justify-between text-xs bg-white rounded-xl p-2 border border-amber-200">
                    <div>
                      <p className="font-semibold text-slate-900">{q.user_name}</p>
                      <p className="text-slate-500">{q.sop_title}</p>
                    </div>
                    <span className="font-bold text-amber-700">{q.expires_at}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
