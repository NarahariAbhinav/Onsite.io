import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  ClipboardList,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Clock,
  Activity,
  AlertCircle,
  Sparkles,
  Bot,
  Brain,
  ShieldCheck,
  Send,
  RotateCcw,
  Award,
  Users,
  Check,
  Filter,
  ExternalLink,
  ChevronDown,
  Compass,
  GraduationCap,
  Calendar,
  XCircle,
  CheckCircle,
  Layers,
  Search,
  Bell,
  ArrowUpRight,
  FolderKanban,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { IssueStatusBadge, ProgressBar, ProjectStatusBadge } from "@/components/StatusBadge";
import {
  formatDate,
  formatRelativeTime,
  getOverdueProjectSops,
  projectProgress,
  useSiteflow,
  type Project,
  type Issue,
  type AuditRecord,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";
import { callAiAdvisory, buildSiteflowContext } from "@/lib/ai-client";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type RolePerspective = "management" | "quality_mgr" | "project_mgr" | "employee";
type PeriodFilter = "month" | "quarter" | "ytd" | "all";

export function DashboardPage() {
  const state = useSiteflow();

  /* ─── Filter & Perspective State ─── */
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("month");
  const [selectedRole, setSelectedRole] = useState<RolePerspective>("management");
  const [activeTab, setActiveTab] = useState<"control_center" | "ai_studio">("control_center");

  /* ─── AI Query & Copilot State ─── */
  const [inlineAiQuery, setInlineAiQuery] = useState("");
  const [inlineAiAnswer, setInlineAiAnswer] = useState<string | null>(null);
  const [inlineAiLoading, setInlineAiLoading] = useState(false);

  // Full AI Studio chat messages
  const [chatMessages, setChatMessages] = useState<
    {
      id: string;
      sender: "user" | "ai";
      text: string;
      timestamp: string;
      suggestions?: string[];
    }[]
  >([
    {
      id: "msg-0",
      sender: "ai",
      text: "Hello! I am your Construction Quality & Compliance Advisory Copilot. I monitor live SOP executions, site deviations, 5-stage CAPA lifecycles, and audit telemetry across all active sites. How can I assist you today?",
      timestamp: "Just now",
      suggestions: [
        "Which projects have SOP compliance below 80%?",
        "Show overdue CAPA for Clubhouse.",
        "Which employees haven't completed mandatory SOPs?",
        "Which SOPs have the most audit failures?",
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const streamingMsgIdRef = useRef<string | null>(null);

  /* ─── Projects & Derived Scope ─── */
  const allProjects = state.projects;
  const currentProject =
    selectedProjectId !== "all" ? allProjects.find((p) => p.id === selectedProjectId) : null;

  // Filtered ProjectSOPs
  const relevantProjectSops = state.projectSops.filter((ps) => {
    if (selectedProjectId !== "all" && ps.project_id !== selectedProjectId) return false;
    if (selectedDept !== "all") {
      const sop = state.sops.find((s) => s.id === ps.sop_id);
      if (sop && sop.department !== selectedDept) return false;
    }
    return true;
  });

  // Filtered Issues
  const relevantIssues = state.issues.filter((i) => {
    if (selectedProjectId !== "all" && i.project_id !== selectedProjectId) return false;
    return true;
  });

  // Filtered Audits
  const relevantAudits = (state.audits || []).filter((a) => {
    if (selectedProjectId !== "all" && a.project_id !== selectedProjectId) return false;
    return true;
  });

  /* ─── 1. Core KPI Metrics ─── */
  const totalProjectsCount = selectedProjectId === "all" ? allProjects.length : 1;
  const activeSopsCount = state.sops.length;
  
  // Total workers / site personnel tracked
  const siteWorkersCount = selectedProjectId === "all" ? 326 : 28;

  // SOP Coverage
  let sopsCompleted = 0;
  let sopsInProgress = 0;
  let sopsNotStarted = 0;

  relevantProjectSops.forEach((ps) => {
    const execs = state.executions.filter((e) => e.project_sop_id === ps.id);
    const hasStarted = execs.some((e) => e.status === "Completed" || e.status === "In Progress");
    const isAllDone = execs.length > 0 && execs.every((e) => e.status === "Completed");
    if (isAllDone) sopsCompleted++;
    else if (hasStarted) sopsInProgress++;
    else sopsNotStarted++;
  });

  const overdueProjectSops = getOverdueProjectSops(state).filter((item) =>
    selectedProjectId === "all" ? true : item.project.id === selectedProjectId
  );
  const sopsOverdueCount = overdueProjectSops.length || 7;

  const totalAssignedSops = relevantProjectSops.length || 1;
  const sopCoveragePct = Math.round(
    ((sopsCompleted + sopsInProgress) / Math.max(1, sopsCompleted + sopsInProgress + sopsNotStarted)) * 100
  ) || 87;
  const overallSopCompletionPct = Math.round((sopsCompleted / Math.max(1, totalAssignedSops)) * 100) || 87;

  // Employee Competency KPIs
  const qualifications = state.qualifications || [];
  const qualifiedCount = qualifications.filter((q) => q.status === "Qualified").length || 24;
  const pendingAssessmentsCount = (state.assessments || []).filter(
    (a) => a.status === "Not Submitted" || a.status === "Under Evaluation"
  ).length || 4;
  const qualifiedPct = 78;
  const pendingAssessmentPct = 15;
  const failedPct = 7;

  // Issues & CAPA KPIs
  const openIssues = relevantIssues.filter((i) => i.status !== "Resolved" && i.status !== "Closed");
  const inProgressIssues = relevantIssues.filter((i) => i.status === "In Progress");
  const closedIssues = relevantIssues.filter((i) => i.status === "Resolved" || i.status === "Closed");
  const openCapas = relevantIssues.filter(
    (i) => !!i.capa_stage && i.capa_stage !== "5_Effectiveness"
  );
  const overdueCapasCount = 3; // Prominent overdue CAPAs

  // Audits KPIs
  const scheduledAudits = relevantAudits.filter((a) => a.status === "Scheduled" || a.status === "In Progress");
  const completedAudits = relevantAudits.filter((a) => a.status === "Completed");
  const failedAudits = completedAudits.filter((a) => a.passed === false);
  const scheduledAuditsCount = scheduledAudits.length || 12;
  const completedAuditsCount = completedAudits.length || 42;
  const failedAuditsCount = failedAudits.length || 5;
  const overdueAuditsCount = 2;

  /* ─── Top Pending Employees Mock/Enriched Feed ─── */
  const topPendingEmployees = [
    {
      name: "Rahul K.",
      project: "KNS Clubhouse",
      sop: "Excavation & Shoring SOP",
      stage: "Quiz Pending",
      statusColor: "bg-amber-100 text-amber-800 border-amber-200",
      actionLink: "/lms/quizzes",
      actionLabel: "Take Quiz",
    },
    {
      name: "Priya M.",
      project: "Plot Development",
      sop: "Reinforced Concrete & Shuttering",
      stage: "Practical Assessment",
      statusColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      actionLink: "/lms/assessments",
      actionLabel: "Evaluate",
    },
    {
      name: "Vikram S.",
      project: "Cricket Ground",
      sop: "Waterproofing & Ponding Test",
      stage: "Under Evaluation",
      statusColor: "bg-purple-100 text-purple-800 border-purple-200",
      actionLink: "/lms/assessments",
      actionLabel: "Review",
    },
    {
      name: "Suresh N.",
      project: "Godrej Woods",
      sop: "PPE & Site Safety SOP",
      stage: "Re-test Scheduled",
      statusColor: "bg-rose-100 text-rose-800 border-rose-200",
      actionLink: "/lms/quizzes",
      actionLabel: "Schedule",
    },
    {
      name: "Ananya D.",
      project: "Sunrise Towers",
      sop: "Electrical Conduiting SOP",
      stage: "Practical Assessment",
      statusColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      actionLink: "/lms/assessments",
      actionLabel: "Evaluate",
    },
  ];

  /* ─── Project Compliance League Data ─── */
  const projectLeagueData = allProjects.map((prj) => {
    const prog = projectProgress(state, prj.id);
    const prjIssues = state.issues.filter(
      (i) => i.project_id === prj.id && i.status !== "Resolved" && i.status !== "Closed"
    ).length;
    const prjAudits = (state.audits || []).filter((a) => a.project_id === prj.id);
    const auditsPassRate = prjAudits.length > 0 ? 94 : 90;

    // Harmonize realistic construction rates matching user prompt
    const isClubhouse = prj.name.toLowerCase().includes("clubhouse");
    const isPlotDev = prj.name.toLowerCase().includes("plot");
    const isGround = prj.name.toLowerCase().includes("ground");

    const coverage = isClubhouse ? 92 : isPlotDev ? 77 : isGround ? 93 : prog.pct || 85;
    const quizPass = isClubhouse ? 94 : isPlotDev ? 81 : isGround ? 96 : 89;
    const assessment = isClubhouse ? 88 : isPlotDev ? 72 : isGround ? 91 : 84;
    const issues = isClubhouse ? 3 : isPlotDev ? 7 : isGround ? 1 : prjIssues || 2;
    const sops = isClubhouse ? 42 : isPlotDev ? 35 : isGround ? 28 : prog.sops || 24;
    const completed = isClubhouse ? 38 : isPlotDev ? 27 : isGround ? 26 : prog.completed || 20;

    return {
      id: prj.id,
      name: prj.name,
      code: prj.code,
      location: prj.location,
      status: prj.status,
      sops,
      completed,
      coverage,
      quizPass,
      assessment,
      auditsPassRate,
      issues,
      statusTier: coverage >= 90 ? "High Compliance" : coverage >= 75 ? "Moderate Watchlist" : "Critical Risk",
    };
  });

  /* ─── AI Query Handler ─── */
  const executeAiQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setInlineAiLoading(true);
    setInlineAiAnswer("");

    try {
      const context = buildSiteflowContext({
        projects: state.projects.map((p) => ({ name: p.name, status: p.status, code: p.code })),
        openIssues: state.issues
          .filter((i) => i.status !== "Resolved" && i.status !== "Closed")
          .map((i) => ({
            title: i.title,
            severity: i.priority,
            status: i.status as string,
            ...(state.projects.find((p) => p.id === i.project_id)?.name
              ? { project: state.projects.find((p) => p.id === i.project_id)!.name }
              : {}),
          })),
        openCapas: state.issues
          .filter((i) => !!i.capa_stage && i.capa_stage !== "5_Effectiveness")
          .map((i) => ({
            title: i.title,
            capa_stage: (i.capa_stage as string) ?? null,
            severity: i.priority,
          })),
        scheduledAudits: (state.audits || [])
          .filter((a) => a.status === "Scheduled" || a.status === "In Progress")
          .map((a) => ({ title: a.title, status: a.status, sop_name: a.sop_name, project_name: a.project_name })),
        failedAudits: (state.audits || [])
          .filter((a) => a.status === "Completed" && a.passed === false)
          .map((a) => ({ title: a.title, sop_name: a.sop_name, project_name: a.project_name })),
        sops: state.sops.map((s) => ({
          name: s.name,
          lifecycle_status: s.lifecycle_status ?? "Active",
          department: s.department,
        })),
        qualifications: (state.qualifications ?? []).map((q) => ({
          user_name: q.user_name,
          sop_title: q.sop_title,
          status: q.status,
        })),
      });

      let accumulated = "";
      await callAiAdvisory(q, context, (chunk) => {
        accumulated += chunk;
        setInlineAiAnswer(accumulated);
      });
    } catch (err) {
      console.error("AI Error:", err);
      const msg = err instanceof Error ? err.message : "Unable to reach AI advisor";
      setInlineAiAnswer(`⚠️ ${msg}. Please verify network connection or try again.`);
      toast.error("AI Advisory unavailable", { description: msg });
    } finally {
      setInlineAiLoading(false);
    }
  };

  /* ─── Studio Chat Handler ─── */
  const handleSendStudioAiQuery = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isAiThinking) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "user" as const,
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsAiThinking(true);

    const aiMsgId = `msg-${Date.now() + 1}`;
    streamingMsgIdRef.current = aiMsgId;
    setChatMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        sender: "ai" as const,
        text: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    try {
      const context = buildSiteflowContext({
        projects: state.projects.map((p) => ({ name: p.name, status: p.status, code: p.code })),
        openIssues: state.issues
          .filter((i) => i.status !== "Resolved" && i.status !== "Closed")
          .map((i) => ({
            title: i.title,
            severity: i.priority,
            status: i.status as string,
          })),
        openCapas: state.issues
          .filter((i) => !!i.capa_stage && i.capa_stage !== "5_Effectiveness")
          .map((i) => ({
            title: i.title,
            capa_stage: (i.capa_stage as string) ?? null,
            severity: i.priority,
          })),
        scheduledAudits: (state.audits || [])
          .filter((a) => a.status === "Scheduled" || a.status === "In Progress")
          .map((a) => ({ title: a.title, status: a.status, sop_name: a.sop_name, project_name: a.project_name })),
        failedAudits: (state.audits || [])
          .filter((a) => a.status === "Completed" && a.passed === false)
          .map((a) => ({ title: a.title, sop_name: a.sop_name, project_name: a.project_name })),
        sops: state.sops.map((s) => ({
          name: s.name,
          lifecycle_status: s.lifecycle_status ?? "Active",
          department: s.department,
        })),
        qualifications: (state.qualifications ?? []).map((q) => ({
          user_name: q.user_name,
          sop_title: q.sop_title,
          status: q.status,
        })),
      });

      await callAiAdvisory(q, context, (chunk) => {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: m.text + chunk } : m))
        );
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error contacting AI";
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, text: `⚠️ AI Advisory unavailable: ${msg}\nPlease try again.` }
            : m
        )
      );
    } finally {
      setIsAiThinking(false);
      streamingMsgIdRef.current = null;
    }
  };

  return (
    <AppShell>
      {/* ─── 1. TOP HEADER & FILTER BAR ─── */}
      <div className="mb-6 space-y-4 text-left">
        {/* Title, Greeting & Direct Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase">
                Construction MVP Control Center
              </span>
              {selectedProjectId !== "all" && (
                <span className="rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200 px-2 py-0.5 text-[11px] font-bold">
                  Project Drill-Down Active
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl font-display flex items-center gap-3">
              {currentProject ? `${currentProject.name} Dashboard` : "Management Control Center"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {currentProject
                ? `Active Site Command: ${currentProject.code} · ${currentProject.location} · Site Admin: ${currentProject.admin}`
                : "Good Morning, Admin · Real-time governance across projects, SOP compliance, employee competency, audits, and CAPA."}
            </p>
          </div>

          {/* Quick Right Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {selectedProjectId !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedProjectId("all")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
              >
                ← Back to All Projects
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "control_center" ? "ai_studio" : "control_center")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer",
                activeTab === "ai_studio"
                  ? "bg-slate-900 text-white"
                  : "bg-primary text-white hover:bg-primary/90"
              )}
            >
              <Bot className="size-4" />
              {activeTab === "ai_studio" ? "Return to Dashboard" : "AI Advisory Studio"}
            </button>
          </div>
        </div>

        {/* Multi-Filter Bar: Project, Department, Date Range, Role Perspective */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Project Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500 flex items-center gap-1">
                <Building2 className="size-3.5 text-slate-400" /> Project:
              </span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-primary focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Projects (Overview)</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500">Dept:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-primary focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Departments</option>
                <option value="Civil">Civil & Concrete</option>
                <option value="Safety">Safety & HSE</option>
                <option value="Electrical">Electrical & MEP</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Finishing">Finishing & Facade</option>
              </select>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="size-3.5 text-slate-400" /> Period:
              </span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as PeriodFilter)}
                className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-primary focus:outline-hidden cursor-pointer"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="ytd">Year to Date</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Role Persona Perspective Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 px-2">Role:</span>
            <button
              type="button"
              onClick={() => setSelectedRole("management")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                selectedRole === "management" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Management
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("quality_mgr")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                selectedRole === "quality_mgr" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Quality Mgr
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("project_mgr")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                selectedRole === "project_mgr" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Project Mgr
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("employee")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                selectedRole === "employee" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Employee
            </button>
          </div>
        </div>

        {/* Role Highlight Banner if Employee is selected */}
        {selectedRole === "employee" && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4.5 text-amber-700" />
              <span>
                <strong>Employee Mode:</strong> You are viewing personal learning & assessment progress. Jump to your courses, active quizzes, and certifications.
              </span>
            </div>
            <Link
              to="/lms/my-learning"
              className="inline-flex items-center gap-1 rounded-lg bg-amber-700 text-white font-bold px-3 py-1.5 text-xs hover:bg-amber-800 transition-colors"
            >
              My Learning Portal <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ─── FULL AI STUDIO VIEW (IF ACTIVE) ─── */}
      {activeTab === "ai_studio" && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Brain className="size-5 text-primary" /> AI Quality & Compliance Advisory Studio
              </h2>
              <p className="text-xs text-slate-500">
                Grounded in live construction telemetry, active SOP executions, audit deviations, and CAPA lifecycles.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setChatMessages([
                  {
                    id: `msg-${Date.now()}`,
                    sender: "ai",
                    text: "Advisory session reset. Ask any compliance, audit, CAPA, or contractor question.",
                    timestamp: "Just now",
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <RotateCcw className="size-3.5" /> Clear History
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col h-[560px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-2xl",
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    <span>{msg.sender === "user" ? "You (Executive)" : "SiteFlow AI Advisory"}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl p-4 text-xs leading-relaxed space-y-2",
                      msg.sender === "user"
                        ? "bg-primary text-white font-medium rounded-br-xs"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs"
                    )}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {msg.suggestions && (
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSendStudioAiQuery(sug)}
                            className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          >
                            ✨ {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="mr-auto flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl animate-pulse">
                  <Brain className="size-4 text-primary animate-spin" />
                  <span>Synthesizing cross-project quality telemetry & ISO guidelines...</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-3 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendStudioAiQuery();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask SiteFlow AI (e.g. 'Show overdue CAPA for Clubhouse', 'Which SOPs have the most audit failures')..."
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:border-primary focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isAiThinking}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="size-3.5" /> Ask AI
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTROL CENTER VIEW ─── */}
      {activeTab === "control_center" && (
        <div className="space-y-8 text-left">
          {/* ─── 2. KPI CARDS (6-8 CARDS MAX) ─── */}
          <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            {/* 1. Total Projects */}
            <Link
              to="/projects"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Projects
                </span>
                <Building2 className="size-4 text-slate-400" />
              </div>
              <div className="mt-2">
                <span className="font-display text-2xl font-black text-slate-900">
                  {totalProjectsCount}
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Active Sites</p>
              </div>
            </Link>

            {/* 2. Active SOPs */}
            <Link
              to="/sop-library"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Active SOPs
                </span>
                <ClipboardList className="size-4 text-slate-400" />
              </div>
              <div className="mt-2">
                <span className="font-display text-2xl font-black text-slate-900">
                  {activeSopsCount}
                </span>
                <p className="text-[10px] text-emerald-600 font-bold">100% Effective</p>
              </div>
            </Link>

            {/* 3. Employees / Site Users */}
            <Link
              to="/competency"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Employees
                </span>
                <Users className="size-4 text-slate-400" />
              </div>
              <div className="mt-2">
                <span className="font-display text-2xl font-black text-slate-900">
                  {siteWorkersCount}
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Tracked Users</p>
              </div>
            </Link>

            {/* 4. SOP Coverage */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  SOP Coverage
                </span>
                <ShieldCheck className="size-4 text-emerald-600" />
              </div>
              <div className="mt-2">
                <span className="font-display text-2xl font-black text-slate-900">
                  {sopCoveragePct}%
                </span>
                <p className="text-[10px] text-emerald-600 font-bold">Target ≥85%</p>
              </div>
            </div>

            {/* 5. Pending Assessments */}
            <Link
              to="/lms/assessments"
              className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  Pending Assess.
                </span>
                <GraduationCap className="size-4 text-amber-600" />
              </div>
              <div className="mt-2">
                <span className="font-display text-2xl font-black text-amber-950">
                  {pendingAssessmentsCount}
                </span>
                <p className="text-[10px] text-amber-800 font-bold">Awaiting Evaluator</p>
              </div>
            </Link>

            {/* 6. Qualified Employees */}
            <Link
              to="/lms"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Qualified
                </span>
                <Award className="size-4 text-indigo-600" />
              </div>
              <div className="mt-2">
                <span className="font-display text-2xl font-black text-slate-900">
                  {qualifiedCount}
                </span>
                <p className="text-[10px] text-indigo-700 font-bold">Certified Staff</p>
              </div>
            </Link>

            {/* 7. Open Issues */}
            <Link
              to="/issues"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Open Issues
                </span>
                <AlertTriangle className="size-4 text-amber-600" />
              </div>
              <div className="mt-2">
                <span className="font-display text-2xl font-black text-slate-900">
                  {openIssues.length || 18}
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Under Investigation</p>
              </div>
            </Link>

            {/* 8. Overdue CAPA (Highlighted) */}
            <Link
              to="/issues"
              className="rounded-2xl border border-rose-300 bg-rose-50/70 p-4 shadow-2xs hover:border-rose-400 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-rose-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-950">
                  Overdue CAPA
                </span>
                <Clock className="size-4 text-rose-600" />
              </div>
              <div className="mt-2">
                <span className="font-display text-2xl font-black text-rose-950">
                  {overdueCapasCount}
                </span>
                <p className="text-[10px] text-rose-700 font-bold">Action Overdue 🔴</p>
              </div>
            </Link>
          </div>

          {/* ─── 3 & 4. SOP COMPLIANCE & EMPLOYEE COMPETENCY ROW ─── */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 3. SOP Compliance Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="size-5 text-emerald-600" /> SOP Compliance & Completion
                    </h3>
                    <p className="text-xs text-slate-500">
                      Overall SOP procedure completion and active milestone adherence.
                    </p>
                  </div>
                  <Link
                    to="/projects"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    View All Assignments <ChevronRight className="size-3" />
                  </Link>
                </div>

                <div className="py-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600">Overall SOP Completion</span>
                    <span className="font-display text-3xl font-black text-slate-900">
                      {overallSopCompletionPct}%
                    </span>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex gap-0.5">
                    <div
                      style={{ width: `${Math.max(10, overallSopCompletionPct - 15)}%` }}
                      className="bg-emerald-600 transition-all"
                      title="Completed"
                    />
                    <div
                      style={{ width: "12%" }}
                      className="bg-blue-500 transition-all"
                      title="In Progress"
                    />
                    <div
                      style={{ width: "8%" }}
                      className="bg-slate-300 transition-all"
                      title="Not Started"
                    />
                    <div
                      style={{ width: "5%" }}
                      className="bg-rose-500 transition-all"
                      title="Overdue"
                    />
                  </div>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="size-2.5 rounded-full bg-slate-400" />
                        <span className="text-slate-500 text-[11px] font-medium">Not Started</span>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">12 SOPs</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="size-2.5 rounded-full bg-blue-500" />
                        <span className="text-blue-800 text-[11px] font-medium">In Progress</span>
                      </div>
                      <span className="font-bold text-blue-950 text-sm">18 SOPs</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="size-2.5 rounded-full bg-emerald-600" />
                        <span className="text-emerald-800 text-[11px] font-medium">Completed</span>
                      </div>
                      <span className="font-bold text-emerald-950 text-sm">128 SOPs</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="size-2.5 rounded-full bg-rose-500" />
                        <span className="text-rose-800 text-[11px] font-medium">Overdue</span>
                      </div>
                      <span className="font-bold text-rose-950 text-sm">{sopsOverdueCount} SOPs</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Directly navigate to compliance matrices</span>
                <Link
                  to="/sop-library"
                  className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  SOP Assignment & Employee Compliance <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* 4. Employee Competency Section (LMS Integration) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="size-5 text-indigo-600" /> Employee Competency (LMS)
                  </h3>
                  <p className="text-xs text-slate-500">
                    SOP learning, competency quizzes, and practical evaluator assessments.
                  </p>
                </div>
                <Link
                  to="/lms"
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  LMS Portal <ChevronRight className="size-3" />
                </Link>
              </div>

              {/* Competency Summary Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Competency Progression</span>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <span className="text-emerald-700">Qualified 78%</span>
                    <span className="text-amber-700">Assessment 15%</span>
                    <span className="text-rose-700">Not Qualified 7%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex gap-0.5">
                  <div style={{ width: `${qualifiedPct}%` }} className="bg-emerald-600" />
                  <div style={{ width: `${pendingAssessmentPct}%` }} className="bg-amber-500" />
                  <div style={{ width: `${failedPct}%` }} className="bg-rose-500" />
                </div>
              </div>

              {/* Top Pending Employees Actionable Table */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Top Pending Employees (Requires Action)
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                        <th className="py-2 pr-3">Employee</th>
                        <th className="py-2 px-2">Project</th>
                        <th className="py-2 px-2">SOP</th>
                        <th className="py-2 px-2">Status</th>
                        <th className="py-2 pl-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topPendingEmployees.slice(0, 3).map((emp) => (
                        <tr key={emp.name} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 pr-3 font-bold text-slate-900">{emp.name}</td>
                          <td className="py-2.5 px-2 text-slate-600">{emp.project}</td>
                          <td className="py-2.5 px-2 text-slate-700 font-medium max-w-[140px] truncate">
                            {emp.sop}
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-md border text-[10px] font-bold inline-block",
                                emp.statusColor
                              )}
                            >
                              {emp.stage}
                            </span>
                          </td>
                          <td className="py-2.5 pl-2 text-right">
                            <Link
                              to={emp.actionLink as any}
                              className="font-bold text-primary hover:underline text-[11px]"
                            >
                              {emp.actionLabel} →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 5 & 6. AUDIT STATUS & ISSUES/CAPA ROW ─── */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 5. Audit Overview Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="size-5 text-indigo-600" /> Audit Overview & Governance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Connects standard operating procedures directly to formal site audits.
                  </p>
                </div>
                <Link
                  to="/audits"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Audit Register <ChevronRight className="size-3" />
                </Link>
              </div>

              {/* 4 Status Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Scheduled
                  </span>
                  <span className="font-display text-2xl font-black text-slate-900">
                    {scheduledAuditsCount}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Upcoming</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
                    Completed
                  </span>
                  <span className="font-display text-2xl font-black text-emerald-950">
                    {completedAuditsCount}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Approved</span>
                </div>

                {/* Clickable Failed Audits Card */}
                <Link
                  to="/audits"
                  className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 hover:border-rose-300 transition-colors group cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 block mb-1">
                      Failed
                    </span>
                    <ArrowUpRight className="size-3.5 text-rose-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <span className="font-display text-2xl font-black text-rose-950">
                    {failedAuditsCount}
                  </span>
                  <span className="text-[10px] text-rose-700 font-bold block mt-0.5 underline">
                    Failed Audits →
                  </span>
                </Link>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                    Overdue
                  </span>
                  <span className="font-display text-2xl font-black text-amber-950">
                    {overdueAuditsCount}
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Needs Action</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>First-Time Audit Pass Rate: <strong className="text-slate-900">89.4%</strong></span>
                <Link to="/audits" className="font-bold text-primary hover:underline">
                  Schedule Audit Checkpoint →
                </Link>
              </div>
            </div>

            {/* 6. Issue & CAPA Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="size-5 text-amber-600" /> Issues & CAPA Governance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Non-conformance reports (NCR) and 5-stage corrective action tracking.
                  </p>
                </div>
                <Link
                  to="/issues"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Issue Tracker <ChevronRight className="size-3" />
                </Link>
              </div>

              {/* Prominent Overdue CAPA Alert Banner */}
              <Link
                to="/issues"
                className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100/70 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="size-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span className="text-xs font-black text-rose-950">
                    🔴 {overdueCapasCount} CAPA actions overdue past target date
                  </span>
                </div>
                <span className="text-xs font-bold text-rose-700 group-hover:underline flex items-center gap-1">
                  Resolve CAPAs <ChevronRight className="size-3.5" />
                </span>
              </Link>

              {/* Dual Breakdown Table */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs pt-1">
                {/* Issues Breakdown */}
                <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 text-xs block">Deficiencies & Issues</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Open</span>
                      <strong className="text-slate-900">18</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">In Progress</span>
                      <strong className="text-amber-700">12</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Closed</span>
                      <strong className="text-emerald-700">84</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Overdue</span>
                      <strong className="text-rose-700">4</strong>
                    </div>
                  </div>
                </div>

                {/* CAPA Breakdown */}
                <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 text-xs block">5-Stage CAPA Lifecycles</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Active Open</span>
                      <strong className="text-slate-900">9</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Pending Verification</span>
                      <strong className="text-indigo-700">5</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Overdue</span>
                      <strong className="text-rose-700">3</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Closed & Verified</span>
                      <strong className="text-emerald-700">21</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 7. PROJECT COMPLIANCE LEAGUE TABLE (CONSTRUCTION MVP) ─── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="size-5 text-primary" /> Project Compliance League (Construction Executive View)
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-project benchmarking: which project is actually compliant across SOPs, quizzes, assessments, audits, and open defects?
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                {projectLeagueData.length} Projects Tracked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                    <th className="py-2.5 pr-4">Project</th>
                    <th className="py-2.5 px-3 text-center">Active SOPs</th>
                    <th className="py-2.5 px-3 text-center">Completed</th>
                    <th className="py-2.5 px-3 text-center">SOP Coverage</th>
                    <th className="py-2.5 px-3 text-center">Quiz Pass</th>
                    <th className="py-2.5 px-3 text-center">Assessment</th>
                    <th className="py-2.5 px-3 text-center">Audits Pass</th>
                    <th className="py-2.5 px-3 text-center">Issues</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectLeagueData.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "hover:bg-slate-50/80 transition-colors",
                        selectedProjectId === row.id && "bg-primary/5"
                      )}
                    >
                      <td className="py-3 pr-4">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          {row.name}
                          {selectedProjectId === row.id && (
                            <span className="rounded-full bg-primary text-white text-[9px] px-1.5 py-0.2">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {row.code} · {row.location}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {row.sops}
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-emerald-700">
                        {row.completed}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-display font-black text-slate-900 text-xs">
                          {row.coverage}%
                        </span>
                        <div className="w-16 mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            style={{ width: `${row.coverage}%` }}
                            className={cn(
                              "h-full rounded-full",
                              row.coverage >= 90 ? "bg-emerald-600" : row.coverage >= 75 ? "bg-amber-500" : "bg-rose-500"
                            )}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {row.quizPass}%
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {row.assessment}%
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {row.auditsPassRate}%
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black inline-block",
                            row.issues > 5
                              ? "bg-rose-100 text-rose-800"
                              : row.issues > 2
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {row.issues}
                        </span>
                      </td>

                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectId(row.id);
                            toast.success(`Switched to ${row.name} drill-down`);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer"
                        >
                          Drill Down <ChevronRight className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── 8. PENDING ACTIONS ("REQUIRES ATTENTION") & RECENT ACTIVITY ─── */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 8A: Requires Attention */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="size-5 text-rose-600" /> Pending Actions · Requires Attention
                </h3>
                <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  High Priority
                </span>
              </div>

              <div className="space-y-2.5">
                {/* 1. SOP Overdue */}
                <Link
                  to="/projects"
                  className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-2 rounded-full bg-rose-600" />
                    <span className="text-xs font-bold text-slate-900">
                      🔴 7 SOP assignments overdue for execution sign-off
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 group-hover:underline flex items-center gap-0.5">
                    Resolve <ChevronRight className="size-3" />
                  </span>
                </Link>

                {/* 2. Assessments Pending */}
                <Link
                  to="/lms/assessments"
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-900">
                      🟠 4 practical learner assessments awaiting evaluator review
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 group-hover:underline flex items-center gap-0.5">
                    Review <ChevronRight className="size-3" />
                  </span>
                </Link>

                {/* 3. CAPA Overdue */}
                <Link
                  to="/issues"
                  className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-2 rounded-full bg-rose-600" />
                    <span className="text-xs font-bold text-slate-900">
                      🔴 3 CAPA corrective actions overdue target closure date
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 group-hover:underline flex items-center gap-0.5">
                    Update <ChevronRight className="size-3" />
                  </span>
                </Link>

                {/* 4. SOP Revision Approval */}
                <Link
                  to="/sop-library"
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-900">
                      🟠 2 SOP revisions (V2.0) awaiting QA engineering sign-off
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 group-hover:underline flex items-center gap-0.5">
                    Approve <ChevronRight className="size-3" />
                  </span>
                </Link>

                {/* 5. Audits Due */}
                <Link
                  to="/audits"
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-900">
                      🟡 5 quality & statutory audits due this week
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 group-hover:underline flex items-center gap-0.5">
                    Schedule <ChevronRight className="size-3" />
                  </span>
                </Link>
              </div>
            </div>

            {/* 8B: Recent Activity Feed */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="size-5 text-primary" /> Recent Activity & Audit Trail
                </h3>
                <span className="text-xs font-bold text-slate-400">Live Telemetry</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs">
                  <span className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-900 font-bold">Safety SOP V2.0 approved</p>
                    <span className="text-[11px] text-slate-400">10:42 AM · Quality Director</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Approved
                  </span>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <span className="size-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-900 font-bold">Abhinav completed Quality SOP quiz</p>
                    <span className="text-[11px] text-slate-400">10:18 AM · Score: 100% (Passed)</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    Quiz
                  </span>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <span className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-900 font-bold">Clubhouse audit completed</p>
                    <span className="text-[11px] text-slate-400">09:52 AM · Lead Auditor K. Iyer</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Audit
                  </span>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <span className="size-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-900 font-bold">New deviation raised on Beam #12</p>
                    <span className="text-[11px] text-slate-400">09:40 AM · Concrete rebar cover check</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    NCR
                  </span>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <span className="size-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-900 font-bold">CAPA assigned to Project Engineer</p>
                    <span className="text-[11px] text-slate-400">09:20 AM · Immediate containment active</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    CAPA Stage 1
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 9. EMBEDDED AI ADVISORY SEARCH BOX ─── */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/30 via-white to-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bot className="size-5 text-indigo-600" /> AI Compliance Advisory Assistant
                </h3>
                <p className="text-xs text-slate-500">
                  Ask about your projects, SOP compliance, overdue CAPA, or competency bottlenecks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("ai_studio")}
                className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                Open Full Advisory Studio <ChevronRight className="size-3" />
              </button>
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="flex flex-wrap gap-2">
              {[
                "Which projects have SOP compliance below 80%?",
                "Show overdue CAPA for Clubhouse.",
                "Which employees haven't completed mandatory SOPs?",
                "Which SOPs have the most audit failures?",
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInlineAiQuery(prompt);
                    executeAiQuery(prompt);
                  }}
                  className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                >
                  ✨ {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeAiQuery(inlineAiQuery);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inlineAiQuery}
                  onChange={(e) => setInlineAiQuery(e.target.value)}
                  placeholder="Ask about your projects, SOPs or compliance (e.g. 'Show overdue CAPA for Clubhouse')..."
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-primary focus:outline-hidden bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={!inlineAiQuery.trim() || inlineAiLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="size-3.5" /> Ask AI
              </button>
            </form>

            {/* AI Streaming Response Card */}
            {(inlineAiAnswer !== null || inlineAiLoading) && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-white shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 pb-2">
                  <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-indigo-600" /> SiteFlow AI Advisory Analysis
                  </span>
                  {inlineAiLoading && (
                    <span className="text-indigo-600 font-bold flex items-center gap-1 animate-pulse">
                      <Brain className="size-3 animate-spin" /> Thinking...
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {inlineAiAnswer || "Consulting ISO 9001:2015 database & live project telemetry..."}
                </div>
              </div>
            )}
          </div>

          {/* ─── 10. PROJECT DRILL-DOWN SPECIFIC SECTION (WHEN PROJECT SELECTED) ─── */}
          {currentProject && (
            <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/20 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-200 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                    Dedicated Project View
                  </span>
                  <h3 className="font-display text-lg font-black text-slate-900 mt-1">
                    {currentProject.name} — Operational Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    Location: {currentProject.location} · Code: {currentProject.code} · Area: {currentProject.area} Acres
                  </p>
                </div>

                {/* Project-Specific Quick Jump Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: currentProject.id }}
                    className="inline-flex items-center gap-1 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs"
                  >
                    <ClipboardList className="size-3.5 text-primary" /> SOPs
                  </Link>
                  <Link
                    to="/documents"
                    className="inline-flex items-center gap-1 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs"
                  >
                    <FileText className="size-3.5 text-blue-600" /> Documents
                  </Link>
                  <Link
                    to="/issues"
                    className="inline-flex items-center gap-1 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs"
                  >
                    <AlertTriangle className="size-3.5 text-amber-600" /> Issues
                  </Link>
                  <Link
                    to="/audits"
                    className="inline-flex items-center gap-1 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs"
                  >
                    <CheckCircle className="size-3.5 text-indigo-600" /> Audits
                  </Link>
                </div>
              </div>

              {/* Project Specific Detail Cards */}
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SOP Coverage</span>
                  <span className="font-display text-xl font-black text-slate-900">92%</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Site Crew</span>
                  <span className="font-display text-xl font-black text-slate-900">28 Personnel</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Active SOPs</span>
                  <span className="font-display text-xl font-black text-slate-900">42 SOPs</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed SOPs</span>
                  <span className="font-display text-xl font-black text-emerald-700">38 SOPs</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Quiz Pass Rate</span>
                  <span className="font-display text-xl font-black text-slate-900">94%</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Qualified Users</span>
                  <span className="font-display text-xl font-black text-indigo-700">24 Users</span>
                </div>
              </div>

              {/* Project-Specific SOP Execution Checklist */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Assigned SOP Execution Milestones on {currentProject.name}
                  </h4>
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: currentProject.id }}
                    className="text-primary font-bold text-xs hover:underline"
                  >
                    Open Full Site Execution Matrix →
                  </Link>
                </div>

                <div className="space-y-2">
                  {relevantProjectSops.slice(0, 4).map((ps) => {
                    const sop = state.sops.find((s) => s.id === ps.sop_id);
                    return (
                      <div
                        key={ps.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60"
                      >
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {sop?.name ?? "SOP Procedure"}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Assigned to: <strong>{ps.assigned_to}</strong> · Due: {formatDate(ps.due_date)}
                          </span>
                        </div>
                        <Link
                          to="/projects/$projectId/sops/$projectSopId"
                          params={{ projectId: currentProject.id, projectSopId: ps.id }}
                          className="font-bold text-primary text-xs hover:underline"
                        >
                          Execute Step →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
