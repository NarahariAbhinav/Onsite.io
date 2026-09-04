import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  ArrowLeft,
  Share2,
  GitBranch,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  History,
  AlertTriangle,
  FileText,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  HardHat,
  Eye,
  Calendar,
  GraduationCap,
  Download,
  Printer,
  Sparkles,
  BookOpen,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
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
  getSopBlastRadius,
  useSiteflow,
  formatDate,
  type Sop,
  type SopStep,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sop-library/$sopId")({
  component: SopDetailPage,
});

export function SopDetailPage() {
  const { sopId } = Route.useParams();
  const state = useSiteflow();
  const navigate = useNavigate();

  const sop = state.sops.find((s) => s.id === sopId);
  const steps = state.steps.filter((st) => st.sop_id === sopId);
  const blast = getSopBlastRadius(state, sopId);

  // Active multidisciplinary inspection tab (9 tabs)
  const [activeTab, setActiveTab] = useState<
    "overview" | "steps" | "versions" | "used_in" | "checklist" | "quiz" | "assessment" | "documents" | "audits"
  >("overview");

  // Modals state
  const [showBlastRadiusModal, setShowBlastRadiusModal] = useState(false);
  const [showBatchMappingModal, setShowBatchMappingModal] = useState(false);
  const [selectedProjectsToMap, setSelectedProjectsToMap] = useState<string[]>([]);
  const [batchAssignee, setBatchAssignee] = useState<string>("Vikram Sharma");
  const [batchDueDate, setBatchDueDate] = useState<string>("2026-06-30");

  // Revision Modal state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionSteps, setRevisionSteps] = useState<SopStep[]>([]);

  // Snapshot Inspector state
  const [snapshotVersion, setSnapshotVersion] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handle batch mapping open
  const handleOpenBatchMapping = () => {
    if (!sop) return;
    const existingMappings = state.projectSops.filter((ps) => ps.sop_id === sop.id).map((ps) => ps.project_id);
    const unmapped = state.projects.filter((p) => !existingMappings.includes(p.id)).map((p) => p.id);
    setSelectedProjectsToMap(unmapped.length > 0 ? unmapped : []);
    setShowBatchMappingModal(true);
  };

  const handleSaveBatchMapping = () => {
    if (!sop) return;
    if (selectedProjectsToMap.length === 0) {
      toast.error("Please select at least one project to map.");
      return;
    }

    actions.batchMapSopToProjects(
      sop.id,
      selectedProjectsToMap,
      batchAssignee,
      batchDueDate
    );

    toast.success(
      `Master SOP ${sop.code || sop.name} successfully mapped to ${selectedProjectsToMap.length} projects without record duplication!`
    );
    setShowBatchMappingModal(false);
  };

  // Handle revision open
  const handleOpenRevision = () => {
    if (!sop) return;
    setRevisionReason("");
    setRevisionSteps(steps.length > 0 ? steps : []);
    setShowRevisionModal(true);
  };

  const handlePublishRevision = () => {
    if (!sop) return;
    if (!revisionReason.trim()) {
      toast.error("ISO 9001 governance requires a documented Change Reason.");
      return;
    }

    const currentMajor = parseInt(sop.version_number?.replace(/[^\d]/g, "") || "1", 10) || 1;
    const nextVersionNum = currentMajor + 1;
    const nextVersionLabel = `V${nextVersionNum}.0`;

    const updatedSop: Sop = {
      ...sop,
      version_number: nextVersionLabel,
      lifecycle_status: "Effective",
      effective_date: new Date().toISOString().split("T")[0],
      version_history: [
        {
          version_number: nextVersionLabel,
          lifecycle_status: "Effective",
          effective_date: new Date().toISOString().split("T")[0] || "2026-03-01",
          revision_reason: revisionReason.trim(),
          change_summary: "Major periodic standard revision.",
          author: CURRENT_USER.name,
          created_at: new Date().toISOString(),
        },
        ...(sop.version_history || []),
      ],
    };

    actions.saveMasterSop(updatedSop, revisionSteps);
    toast.success(`SOP ${updatedSop.code || updatedSop.name} upgraded to ${nextVersionLabel}. Version propagated centrally across consuming projects!`);
    setShowRevisionModal(false);
  };

  // Handle Delete SOP
  const handleDeleteSop = () => {
    if (!sop) return;
    const sopCode = sop.code || sop.name;
    actions.deleteSop(sop.id);
    toast.success(`Master standard ${sopCode} deleted from library.`);
    navigate({ to: "/sop-library" });
  };

  // If SOP not found
  if (!sop) {
    return (
      <AppShell>
        <div className="py-16 text-center">
          <ClipboardList className="mx-auto size-12 text-slate-300 mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Master SOP Standard Not Found</h2>
          <p className="text-sm text-slate-500 mt-1">The requested SOP ID `{sopId}` does not exist in the central repository.</p>
          <div className="mt-6">
            <Link
              to="/sop-library"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-primary/90"
            >
              <ArrowLeft className="size-4" /> Back to Master SOP Library
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const criticality = sop.criticality || "High";
  const status = sop.lifecycle_status || "Approved";

  return (
    <AppShell>
      <div className="space-y-6 pb-16">
        {/* ========================================================= */}
        {/* TOP BREADCRUMB & BACK NAVIGATION                          */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link
              to="/sop-library"
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="size-3.5 text-primary" /> SOP Library
            </Link>
            <ChevronRight className="size-3.5 text-slate-300" />
            <span className="font-mono font-bold text-primary">{sop.code || `SOP-${sop.id.slice(-4)}`}</span>
            <ChevronRight className="size-3.5 text-slate-300" />
            <span className="text-slate-900 truncate max-w-xs sm:max-w-md">{sop.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <Printer className="size-3.5" /> Print / Export
            </button>
            <button
              type="button"
              onClick={handleOpenBatchMapping}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <Building2 className="size-3.5 text-indigo-600" /> Map to Projects
            </button>
            <button
              type="button"
              onClick={handleOpenRevision}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-2xs cursor-pointer"
            >
              <GitBranch className="size-3.5 text-amber-400" /> Revise SOP Standard
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs transition-colors cursor-pointer"
              title="Delete Master SOP Standard"
            >
              <Trash2 className="size-3.5 text-rose-600" /> Delete
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* AUTHORITATIVE MASTER SOP HEADER CARD                      */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-sm bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-lg">
                  {sop.code || `SOP-${sop.id.slice(-4)}`}
                </span>

                <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {sop.category || "Civil Works"}
                </span>

                <span
                  className={cn(
                    "rounded-lg px-2 py-0.5 font-mono text-[10px] font-bold uppercase",
                    criticality === "Critical"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : criticality === "High"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {criticality}
                </span>

                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-700">
                  <GitBranch className="size-3.5" />
                  {sop.version_number || "V1.0"}
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                    status === "Effective" || status === "Approved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  )}
                >
                  <CheckCircle2 className="size-3" />
                  {status}
                </span>
              </div>

              <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                {sop.name}
              </h1>

              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                {sop.purpose || sop.description || "Authoritative operational standardized construction procedure."}
              </p>
            </div>

            {/* Blast radius button on header */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setShowBlastRadiusModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-100 shadow-2xs transition-all cursor-pointer"
              >
                <Building2 className="size-4 text-indigo-600" />
                <span>Used in {blast.totalProjects} Projects</span>
                <span className="rounded-full bg-indigo-200/60 px-1.5 py-0.2 font-mono text-[10px]">
                  Blast Radius
                </span>
              </button>
              <span className="text-[10px] text-slate-400">
                Effective: {formatDate(sop.effective_date)}
              </span>
            </div>
          </div>

          {/* QUICK SPECIFICATION STRIP */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Process / Sub-Category</span>
              <div className="font-semibold text-slate-800 mt-0.5">{sop.process || "General Construction"}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Owner / Department</span>
              <div className="font-semibold text-slate-800 mt-0.5">{sop.owner_name || "Central QA/QC"} ({sop.department})</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Approver Authority</span>
              <div className="font-semibold text-slate-800 mt-0.5">QA/QC Director</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Review Cycle</span>
              <div className="font-semibold text-slate-800 mt-0.5">{sop.review_frequency_months || 12} Months (Annual)</div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4 KEY OPERATIONAL METRIC TILES                            */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => setActiveTab("used_in")}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Consuming Sites</span>
              <Building2 className="size-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{blast.totalProjects}</div>
            <p className="text-[10px] text-indigo-600 font-medium mt-0.5">Active Project Deployments →</p>
          </div>

          <div
            onClick={() => setActiveTab("quiz")}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs cursor-pointer hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Enrolled Trainees</span>
              <GraduationCap className="size-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700">{blast.activeWorkersImpacted}</div>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Workforce in LMS →</p>
          </div>

          <div
            onClick={() => setActiveTab("audits")}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs cursor-pointer hover:border-amber-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Audits & NCRs</span>
              <AlertTriangle className="size-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-700">{blast.auditsImpacted}</div>
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">Compliance Records →</p>
          </div>

          <div
            onClick={() => setActiveTab("steps")}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Procedure Steps</span>
              <ClipboardList className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{steps.length}</div>
            <p className="text-[10px] text-primary font-medium mt-0.5">Detailed Execution Steps →</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 9-TAB MULTIDISCIPLINARY MASTER SOP DETAIL SUITE           */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Tab Navigation Strip */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/75 px-3 overflow-x-auto scrollbar-none gap-1 py-1.5">
            {[
              { id: "overview", label: "Overview & Specs", icon: BookOpen },
              { id: "steps", label: `Procedure (${steps.length})`, icon: ClipboardList },
              { id: "versions", label: `Version Log (${sop.version_history?.length || 1})`, icon: History },
              { id: "used_in", label: `Used in Projects (${blast.totalProjects})`, icon: Building2 },
              { id: "checklist", label: "Checklists (6)", icon: FileCheck },
              { id: "quiz", label: "Competency Quiz (10)", icon: GraduationCap },
              { id: "assessment", label: "Practical Evaluation", icon: ShieldCheck },
              { id: "documents", label: "Required Docs (4)", icon: FileText },
              { id: "audits", label: `Audits & NCRs (${blast.auditsImpacted})`, icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer",
                    isActive
                      ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className={cn("size-3.5", isActive ? "text-primary" : "text-slate-400")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS */}
          <div className="p-6">
            {/* 1. OVERVIEW & BUSINESS DEFINITION */}
            {activeTab === "overview" && (
              <div className="space-y-6 text-xs text-slate-700">
                {/* Purpose & Scope */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40">
                    <span className="font-bold text-slate-900 block mb-1 text-sm">Purpose & Intent</span>
                    <p className="leading-relaxed">
                      {sop.purpose ||
                        "Standardize field operational execution across all construction sites to achieve zero structural non-conformances and maintain 100% adherence to national standards."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40">
                    <span className="font-bold text-slate-900 block mb-1 text-sm">Operational Scope</span>
                    <p className="leading-relaxed">
                      {sop.scope ||
                        "Applies to all cast-in-place structural members, precast connections, and civil foundations across commercial, residential, and infrastructure sites."}
                    </p>
                  </div>
                </div>

                {/* Applicability Matrix */}
                <div className="rounded-xl border border-slate-200 p-4 bg-white">
                  <span className="font-bold text-slate-900 block mb-3 text-sm">
                    Applicability Matrix (Where & Who Uses This SOP)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Applicable Industries</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(sop.applicable_industries || ["Commercial", "Residential", "Industrial"]).map((ind: string) => (
                          <span key={ind} className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Applicable Project Types</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(sop.applicable_project_types || ["High-Rise", "Villa", "Precast"]).map((pt: string) => (
                          <span key={pt} className="rounded-md bg-indigo-50 text-indigo-700 px-2 py-0.5 font-semibold">
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Target Job Roles</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(sop.applicable_roles || ["Site Engineer", "QA/QC Inspector", "Safety Officer"]).map((r: string) => (
                          <span key={r} className="rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 font-semibold">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mandatory Safety, PPE, Inputs & Outputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                      <HardHat className="size-4 text-amber-700" /> Mandatory Safety & PPE Requirements
                    </div>
                    <p className="leading-relaxed text-amber-950">
                      {sop.safety_ppe ||
                        "Mandatory EN 397 / IS 2925 Industrial Safety Helmet, S3 steel-toe footwear, high-visibility reflective vest, cut-resistant gloves, and full-body harness for work above 2m height."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                      <CheckCircle className="size-4 text-emerald-700" /> Expected Output & Acceptance Criteria
                    </div>
                    <p className="leading-relaxed text-emerald-950">
                      {sop.expected_output ||
                        "Dimensional tolerance ±5mm, 100% cover block verification, zero cold joints, slump test within 120±25mm, 28-day characteristic strength verified by 6 test cubes."}
                    </p>
                  </div>
                </div>

                {/* Reference Standards & Materials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40">
                    <span className="font-bold text-slate-900 block mb-1">Inputs & Input Materials</span>
                    <p className="text-slate-600">
                      {sop.inputs || "GFC Approved Drawings, BBS Schedule"} • {sop.materials || "TMT Fe550D Rebars, Cover Blocks"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/40">
                    <span className="font-bold text-slate-900 block mb-1">Controlled Reference Standards</span>
                    <p className="font-mono text-slate-800">
                      {sop.references || "IS 456:2000, IS 1199, IS 10262, NBC 2016"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROCEDURE & STEPS */}
            {activeTab === "steps" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Standard Procedural Execution Checklist ({steps.length} Steps)
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenRevision}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    <GitBranch className="size-3.5" /> Propose Step Modification
                  </button>
                </div>

                <div className="space-y-3">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-white font-mono font-bold text-xs">
                            {step.step_number}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{step.title}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-8">
                        {step.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. VERSION HISTORY & CHANGELOG */}
            {activeTab === "versions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">ISO 9001 Clause 7.5 Controlled Revision Audit Trail</h4>
                    <p className="text-xs text-slate-500">Every change reason, author, and date is permanently recorded for regulatory audit integrity.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenRevision}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-2xs cursor-pointer"
                  >
                    <GitBranch className="size-3.5" /> Issue New Revision
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                  {(sop.version_history || [
                    {
                      version_number: sop.version_number || "V1.0",
                      lifecycle_status: "Effective" as const,
                      effective_date: sop.effective_date || "2026-01-15",
                      author: sop.owner_name || "Central QA/QC",
                      revision_reason: "Initial publication of company standard across all construction projects.",
                      change_summary: "Initial master release.",
                      created_at: new Date().toISOString(),
                    },
                  ]).map((rev, i) => (
                    <div key={i} className="p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3 bg-white hover:bg-slate-50/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded">
                            {rev.version_number}
                          </span>
                          <span className="font-semibold text-slate-800">Effective: {formatDate(rev.effective_date)}</span>
                          {i === 0 && (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.2 font-bold text-[10px] border border-emerald-200">
                              Current Active Standard
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-1">
                          <strong>Change Rationale:</strong> {rev.revision_reason || rev.change_summary}
                        </p>
                        <div className="text-[11px] text-slate-400">
                          Author: {rev.author}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSnapshotVersion(rev.version_number)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
                      >
                        <Eye className="size-3.5 text-slate-400" /> Inspect Snapshot
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. USED IN PROJECTS / BLAST RADIUS */}
            {activeTab === "used_in" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Consuming Construction Projects ({blast.totalProjects})</h4>
                    <p className="text-xs text-slate-500">Live projects that have adopted this master SOP into their project execution schedules.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenBatchMapping}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                  >
                    <Share2 className="size-3.5 text-primary" /> Map to More Projects
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-[11px] uppercase">
                      <tr>
                        <th className="p-3">Project Name</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Site Lead</th>
                        <th className="p-3">Progress / Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {blast.usedIn.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            Not yet mapped to any construction projects.
                          </td>
                        </tr>
                      ) : (
                        blast.usedIn.map((item) => {
                          return (
                            <tr key={item.projectSopId} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-slate-900">{item.projectName}</td>
                              <td className="p-3 text-slate-500">{item.location || "Bengaluru, KA"}</td>
                              <td className="p-3 text-slate-700">{item.assignedTo || "Vikram Sharma"}</td>
                              <td className="p-3">
                                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                  {item.complianceStatus || "Active"}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <Link
                                  to="/projects/$projectId"
                                  params={{ projectId: item.projectId }}
                                  className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
                                >
                                  Open Project <ExternalLink className="size-3" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. CHECKLIST */}
            {activeTab === "checklist" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Master Field Verification Checklist Items</span>
                  <span className="text-slate-400">Inherited dynamically by all consuming site pour cards</span>
                </div>
                {[
                  "GFC drawing revision verified against architectural coordination drawings.",
                  "Rebar cover blocks placed at minimum 1m centers with approved grade matching slab concrete.",
                  "Formwork release agent applied in uniform thin coat with zero pooling in bottom corners.",
                  "Embedded electrical conduits, junction boxes, and plumbing sleeves securely tied to rebars.",
                  "Pre-pour debris, binding wire cut-offs, and sawdust flushed with industrial compressed air.",
                  "Transit mixer slump test verified within 120±25mm tolerance and batch slip logged before pour.",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/40">
                    <CheckCircle className="size-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 6. COMPETENCY QUIZ */}
            {activeTab === "quiz" && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">LMS Qualification Quiz Engine (10 Questions)</h4>
                    <p className="text-xs text-slate-500">
                      Standard passing mark: 80% • Required before field engineers can sign off structural pour cards.
                    </p>
                  </div>
                  <Link
                    to="/lms/quizzes"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-2xs"
                  >
                    <GraduationCap className="size-3.5" /> Launch LMS Quiz Master
                  </Link>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/30 space-y-3">
                  <div className="font-bold text-slate-800 text-xs">Sample Controlled Assessment Items:</div>
                  {[
                    { q: "What is the minimum curing period required for concrete under normal weather as per IS 456?", a: "7 days minimum for OPC; 10 days for mineral admixtures." },
                    { q: "What is the maximum permissible free fall height for concrete during placement?", a: "1.5 meters to prevent aggregate segregation." },
                    { q: "When must concrete test cubes be crushed for compressive strength acceptance?", a: "3 cubes at 7 days, 3 cubes at 28 days." },
                  ].map((qa, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 space-y-1">
                      <div className="font-bold text-slate-900">Q{i + 1}: {qa.q}</div>
                      <div className="text-emerald-700 font-semibold text-[11px]">✓ Answer: {qa.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. PRACTICAL EVALUATION */}
            {activeTab === "assessment" && (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Practical On-Site Simulation & Rubric</h4>
                  <p className="text-xs text-slate-500">Conducted by QA/QC Lead prior to issuing digital qualification certificate.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3 bg-white">
                    <span className="font-bold text-slate-800 block mb-1">1. PPE & Risk Assessment</span>
                    <p className="text-slate-600">Verifies mandatory safety gear, task briefing, and emergency stop protocol.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-white">
                    <span className="font-bold text-slate-800 block mb-1">2. Slump & Sampling</span>
                    <p className="text-slate-600">Demonstrates cone filling in 4 layers with 25 strokes each and cube compaction.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 bg-white">
                    <span className="font-bold text-slate-800 block mb-1">3. Pour Card Execution</span>
                    <p className="text-slate-600">Completes stage-wise inspection sign-offs and attaches timestamped photos.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 8. REQUIRED DOCUMENTS */}
            {activeTab === "documents" && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">Mandatory Technical Deliverables (Inherited by Projects)</span>
                {[
                  { name: "Good For Construction (GFC) Structural Drawing", type: "PDF / DWG", lead: "Design Office" },
                  { name: "Approved Concrete Mix Design Approval Sheet", type: "PDF Report", lead: "Chief Quality Inspector" },
                  { name: "Batch Plant Calibration Certificate (Quarterly)", type: "Calibration Sheet", lead: "RMC Vendor" },
                  { name: "Signed Digital Pour Card & Inspection Checklist", type: "System Generated", lead: "Site QA/QC Engineer" },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <div>
                        <div className="font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">Required format: {doc.type}</div>
                      </div>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                      {doc.lead}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 9. AUDITS & NCRS */}
            {activeTab === "audits" && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Audits & Non-Conformance Reports Referencing {sop.code || sop.name}</h4>
                    <p className="text-xs text-slate-500">Live feed of compliance audits across all construction sites.</p>
                  </div>
                  <Link
                    to="/audits"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-2xs"
                  >
                    <AlertTriangle className="size-3.5 text-amber-400" /> Open Audits Portal
                  </Link>
                </div>

                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {blast.auditsImpacted === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No non-conformances or open audit findings currently logged against this standard.
                    </div>
                  ) : (
                    <div className="p-4 flex items-center justify-between bg-white">
                      <div>
                        <div className="font-bold text-slate-800">AUD-2026-042: Concrete Pour Pre-Inspection Audit</div>
                        <div className="text-[11px] text-slate-500">Finding: Honeycombing observed at column junction C-12 due to under-vibration.</div>
                      </div>
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 font-bold text-amber-700">
                        Under CAPA Resolution
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL 1: BLAST RADIUS MODAL                               */}
        {/* ========================================================= */}
        {showBlastRadiusModal && (
          <Dialog open={showBlastRadiusModal} onOpenChange={setShowBlastRadiusModal}>
            <DialogContent className="max-w-2xl rounded-2xl p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="size-4" /> Operational Blast Radius Inspector
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  {sop.code || `SOP-${sop.id.slice(-4)}`} - {sop.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Real-time dependency matrix showing all active construction sites consuming this master SOP standard.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center">
                    <div className="text-xs font-bold text-indigo-900 uppercase">Active Sites</div>
                    <div className="text-2xl font-black text-indigo-700 mt-1">{blast.totalProjects}</div>
                    <div className="text-[10px] text-indigo-600">Consuming Master</div>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
                    <div className="text-xs font-bold text-emerald-900 uppercase">Enrolled Workforce</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">{blast.activeWorkersImpacted}</div>
                    <div className="text-[10px] text-emerald-600">Trained Personnel</div>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-center">
                    <div className="text-xs font-bold text-amber-900 uppercase">Linked Audits</div>
                    <div className="text-2xl font-black text-amber-700 mt-1">{blast.auditsImpacted}</div>
                    <div className="text-[10px] text-amber-600">Active Governance</div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 border-b border-slate-200">
                    Consuming Sites & Lead Engineers
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {blast.usedIn.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        Not yet mapped to any active construction projects.
                      </div>
                    ) : (
                      blast.usedIn.map((item) => (
                        <div key={item.projectSopId} className="p-3 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">{item.projectName}</div>
                            <div className="text-[11px] text-slate-500">Site Lead: {item.assignedTo || "Assigned Engineer"}</div>
                          </div>
                          <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                            Active Standard
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setShowBlastRadiusModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: BATCH MAPPING MODAL                              */}
        {/* ========================================================= */}
        {showBatchMappingModal && (
          <Dialog open={showBatchMappingModal} onOpenChange={setShowBatchMappingModal}>
            <DialogContent className="max-w-xl rounded-2xl p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Share2 className="size-4" /> Multi-Project Deployment Engine
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  Map {sop.code || sop.name} to Active Sites
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Select active construction projects that require this standardized procedure. Projects reference this master record directly without duplicating database entries.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Select Projects to Map ({selectedProjectsToMap.length} selected):
                  </label>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 p-1">
                    {state.projects.map((proj) => {
                      const isChecked = selectedProjectsToMap.includes(proj.id);
                      const isAlreadyMapped = state.projectSops.some(
                        (ps) => ps.project_id === proj.id && ps.sop_id === sop.id
                      );

                      return (
                        <label
                          key={proj.id}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors",
                            isChecked ? "bg-primary/5" : "hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isAlreadyMapped}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProjectsToMap([...selectedProjectsToMap, proj.id]);
                                } else {
                                  setSelectedProjectsToMap(selectedProjectsToMap.filter((id) => id !== proj.id));
                                }
                              }}
                              className="size-4 rounded text-primary focus:ring-primary cursor-pointer"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{proj.name}</div>
                              <div className="text-[10px] text-slate-400">{proj.location || "Active Site"}</div>
                            </div>
                          </div>
                          {isAlreadyMapped ? (
                            <span className="rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 border border-emerald-200">
                              Already Mapped
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Available</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Assigned Lead / Supervisor:</label>
                    <input
                      type="text"
                      value={batchAssignee}
                      onChange={(e) => setBatchAssignee(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
                      placeholder="e.g. Vikram Sharma"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Compliance Due Date:</label>
                    <input
                      type="date"
                      value={batchDueDate}
                      onChange={(e) => setBatchDueDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchMappingModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBatchMapping}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer"
                >
                  Confirm & Deploy Mappings
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: REVISION ENGINE MODAL                            */}
        {/* ========================================================= */}
        {showRevisionModal && (
          <Dialog open={showRevisionModal} onOpenChange={setShowRevisionModal}>
            <DialogContent className="max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                  <GitBranch className="size-4" /> ISO 9001 Revision & Propagation Engine
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  Issue Revision for {sop.code || sop.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Current Version: {sop.version_number || "V1.0"} ➔ Next Controlled Version: V
                  {(parseInt(sop.version_number?.replace(/[^\d]/g, "") || "1", 10) || 1) + 1}.0
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mandatory Change Rationale (ISO 9001 Clause 7.5.3):
                  </label>
                  <textarea
                    rows={3}
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    placeholder="e.g. Updated pour card sign-off threshold following Q1 structural audit NCR-2026-08..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Review & Adjust Steps for Next Version:</label>
                  <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                    {revisionSteps.map((st, i) => (
                      <div key={st.id || i} className="rounded-xl border border-slate-200 p-2.5 bg-slate-50 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-slate-700 text-xs">
                          <span>Step {i + 1}</span>
                        </div>
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRevisionSteps((prev) =>
                              prev.map((s, idx2) => (idx2 === i ? { ...s, title: val } : s))
                            );
                          }}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs bg-white font-bold"
                        />
                        <textarea
                          rows={2}
                          value={st.instructions}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRevisionSteps((prev) =>
                              prev.map((s, idx2) => (idx2 === i ? { ...s, instructions: val } : s))
                            );
                          }}
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  <strong>Version Lock Assurance:</strong> Employees previously certified on {sop.version_number || "V1.0"} retain valid historic qualification certificates. Newly scheduled tasks across active projects will automatically transition to the new revision.
                </div>
              </div>

              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublishRevision}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer"
                >
                  Publish & Broadcast Revision
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ========================================================= */}
        {/* MODAL 4: HISTORICAL VERSION SNAPSHOT INSPECTOR            */}
        {/* ========================================================= */}
        {snapshotVersion && (
          <Dialog open={!!snapshotVersion} onOpenChange={() => setSnapshotVersion(null)}>
            <DialogContent className="max-w-xl rounded-2xl p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <History className="size-4" /> Historical Snapshot Inspector (Read-Only)
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  {sop.code || `SOP-${sop.id.slice(-4)}`} - Snapshot Version {snapshotVersion}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Immutable regulatory archive copy. This version cannot be modified; it preserves the qualification baseline for past employee certifications.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 my-3 text-xs">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                  <div className="font-bold text-slate-800">Archive Status: Sealed Historical Baseline</div>
                  <div className="text-slate-500">Standard Code: {sop.code || `SOP-${sop.id.slice(-4)}`}</div>
                  <div className="text-slate-500">Standard Category: {sop.category}</div>
                  <div className="text-slate-500">Governing References: {sop.references || "IS 456"}</div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto p-1">
                  <span className="font-bold text-slate-700">Archived Procedural Steps:</span>
                  {steps.map((st, i) => (
                    <div key={st.id} className="p-2 rounded border border-slate-200 bg-white">
                      <div className="font-bold text-slate-800">Step {i + 1}: {st.title}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{st.instructions}</div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setSnapshotVersion(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
                >
                  Close Snapshot
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ========================================================= */}
        {/* MODAL 5: DELETE CONFIRMATION MODAL                        */}
        {/* ========================================================= */}
        {showDeleteModal && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md rounded-2xl p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <Trash2 className="size-4" /> Delete Master Standard
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  Delete {sop.code || sop.name}?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  This action permanently removes this standard from the central enterprise library.
                </DialogDescription>
              </DialogHeader>

              <div className="my-3 space-y-3 text-xs">
                {blast.totalProjects > 0 ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="size-4 text-rose-600 shrink-0" />
                      <span>Active Deployments Impacted!</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      This master SOP is currently deployed in <strong>{blast.totalProjects} active construction projects</strong> with <strong>{blast.activeWorkersImpacted} enrolled workers</strong>.
                    </p>
                    <p className="text-[11px] font-semibold text-rose-800">
                      Deleting will unmap this procedure across those project task registers.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 text-xs">
                    This master standard is not currently mapped to any active projects. It is safe to delete.
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSop}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-2xs cursor-pointer"
                >
                  Confirm Delete Standard
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppShell>
  );
}
