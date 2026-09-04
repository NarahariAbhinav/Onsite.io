import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  ExternalLink,
  Edit,
  Plus,
  ArrowRight,
  ClipboardList,
  Calendar,
  Layers,
  Home,
  Maximize2,
  Eye,
  Upload,
  ArrowLeft,
  User,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Award,
  Trash2,
  Users,
  Search,
  Check,
  TrendingUp,
  RotateCcw,
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  UserPlus,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AddDocumentModal } from "@/components/AddDocumentModal";
import { AddProjectSopModal } from "@/components/AddProjectSopModal";
import { ProjectSopDetailModal } from "@/components/ProjectSopDetailModal";
import { AddProjectTeamModal } from "@/components/AddProjectTeamModal";
import { ProjectDocConfigModal } from "@/components/ProjectDocConfigModal";
import { DocPreviewModal } from "@/components/DocPreviewModal";
import { ProjectFormDrawer } from "@/components/ProjectFormDrawer";
import { ReportIssueModal } from "@/components/ReportIssueModal";
import { ProjectAuditModal } from "@/components/ProjectAuditModal";
import { ActivityFeed } from "@/components/ActivityFeed";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Chip,
  DocStatusBadge,
  IssueStatusBadge,
  PriorityBadge,
  ProgressBar,
  ProjectStatusBadge,
  StepStatusBadge,
} from "@/components/StatusBadge";
import {
  actions,
  formatDate,
  formatDateTime,
  getSopStageDependency,
  isSopOverdue,
  projectProgress,
  sopProgress,
  useSiteflow,
  type Document,
  type Issue,
  type ProjectSop,
  type Sop,
  type ProjectTeamMember,
} from "@/lib/siteflow-store";

export const Route = createFileRoute("/projects/$projectId/")({
  component: ProjectDetailPage,
});

type ProjectWorkspaceTab = "overview" | "sops" | "team" | "documents" | "audits" | "issues";

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const state = useSiteflow();
  const navigate = useNavigate();

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<ProjectWorkspaceTab>("overview");

  // Modals state
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [addSopModalOpen, setAddSopModalOpen] = useState(false);
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);
  const [configDocsModalOpen, setConfigDocsModalOpen] = useState(false);
  const [submitDocModalOpen, setSubmitDocModalOpen] = useState(false);
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false);

  // Inspector states
  const [inspectSopId, setInspectSopId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [unassigningPs, setUnassigningPs] = useState<{ ps: ProjectSop; sopName: string } | null>(null);

  // Tab 2 (SOPs) internal filter states
  const [sopSearch, setSopSearch] = useState("");
  const [sopCategoryFilter, setSopCategoryFilter] = useState("All");
  const [sopStatusFilter, setSopStatusFilter] = useState("All");
  const [sopViewMode, setSopViewMode] = useState<"table" | "cards">("table");

  // Tab 4 (Documents) internal filter states
  const [docSearch, setDocSearch] = useState("");
  const [docStatusFilter, setDocStatusFilter] = useState("All");

  const project = state.projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <AppShell>
        <div className="py-16 text-center max-w-md mx-auto">
          <h2 className="font-display text-2xl font-bold text-slate-900">Project not found</h2>
          <p className="mt-1 text-xs text-slate-500">The requested project ID does not exist.</p>
          <Link
            to="/projects"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            <ArrowLeft className="size-4" /> Back to Projects
          </Link>
        </div>
      </AppShell>
    );
  }

  // Project data computations
  const prog = projectProgress(state, project.id);
  const assignedSops = state.projectSops.filter((ps) => ps.project_id === project.id);
  const projectDocs = state.documents.filter((d) => d.project_id === project.id);
  const uploadedDocs = projectDocs.filter((d) => !!d.file_name).length;
  const approvedDocs = projectDocs.filter((d) => d.status === "Approved").length;
  const pendingDocs = projectDocs.filter((d) => d.status === "Pending" || !d.file_name).length;
  const underReviewDocs = projectDocs.filter((d) => d.status === "Submitted" || d.status === "Under Review").length;
  const projectIssues = state.issues.filter((i) => i.project_id === project.id);
  const openIssues = projectIssues.filter(
    (i) => i.status === "Open" || i.status === "Assigned" || i.status === "In Progress",
  ).length;
  const resolvedIssues = projectIssues.filter(
    (i) => i.status === "Resolved" || i.status === "Closed",
  ).length;
  const highSeverityIssues = projectIssues.filter((i) => i.priority === "High").length;
  const projectTeam = state.projectTeamMembers.filter((tm) => tm.project_id === project.id);
  const projectAudits = state.audits.filter((a) => a.project_id === project.id);
  const overdueSopsCount = assignedSops.filter((ps) => isSopOverdue(ps, state)).length;

  const handleOpenDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setDocModalOpen(true);
  };

  const handleDeleteProject = () => {
    actions.deleteProject(project.id);
    toast.success(`Project "${project.name}" deleted`);
    navigate({ to: "/projects" });
  };

  // Filtered SOPs for Tab 2
  const filteredProjectSops = assignedSops.filter((ps) => {
    const sop = state.sops.find((s) => s.id === ps.sop_id);
    if (!sop) return false;
    const matchesSearch =
      sop.name.toLowerCase().includes(sopSearch.toLowerCase()) ||
      (sop.code || "").toLowerCase().includes(sopSearch.toLowerCase()) ||
      (ps.assigned_to || "").toLowerCase().includes(sopSearch.toLowerCase());
    const matchesCategory =
      sopCategoryFilter === "All" || sop.category === sopCategoryFilter;
    const sopProg = sopProgress(state, ps.id);
    const matchesStatus =
      sopStatusFilter === "All" ||
      (sopStatusFilter === "Completed" && sopProg.status === "Completed") ||
      (sopStatusFilter === "In Progress" && sopProg.status === "In Progress") ||
      (sopStatusFilter === "Overdue" && isSopOverdue(ps, state));
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtered Docs for Tab 4
  const filteredDocs = projectDocs.filter((d) => {
    const matchesSearch =
      d.document_name.toLowerCase().includes(docSearch.toLowerCase()) ||
      (d.document_code || "").toLowerCase().includes(docSearch.toLowerCase()) ||
      (d.category || "").toLowerCase().includes(docSearch.toLowerCase());
    const matchesStatus =
      docStatusFilter === "All" ||
      (docStatusFilter === "Pending" && (d.status === "Pending" || !d.file_name)) ||
      (docStatusFilter === "Under Review" && (d.status === "Submitted" || d.status === "Under Review")) ||
      (docStatusFilter === "Approved" && d.status === "Approved") ||
      (docStatusFilter === "Rejected" && d.status === "Rejected");
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      {/* ------------------------------------------------------------- */}
      {/* IMAGE 2 TOP SECTION — 100% PRESERVED LAYOUT & STYLING         */}
      {/* ------------------------------------------------------------- */}

      {/* Top Breadcrumb & Action Buttons */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Projects
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAuditModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-100 transition-colors"
          >
            <ShieldCheck className="size-3.5 text-emerald-700" /> QA Audit Report
          </button>
          <button
            onClick={() => setEditDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Edit className="size-3.5" /> Edit Project
          </button>
          <button
            onClick={() => setDeleteProjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors shadow-xs"
            title="Delete this project"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            onClick={() => setReportIssueModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
          >
            <AlertTriangle className="size-3.5" /> Report Defect
          </button>
          <button
            onClick={() => setAddSopModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all"
          >
            <Plus className="size-3.5" /> Assign SOP
          </button>
        </div>
      </div>

      {/* Page Title & Status */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 font-mono border border-slate-200">
          {project.code}
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {project.name}
        </h1>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Overview Stat Chips (IMAGE 2 SUMMARY BAR) */}
      <div className="mb-8 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Summary:
        </span>
        <Chip label="Total SOPs" value={prog.sops} toneKey="steel" />
        <Chip label="Completed" value={prog.completed} toneKey="green" />
        <Chip label="In Progress" value={prog.inProgress} toneKey="amber" />
        <Chip label="Not Started" value={prog.notStarted} toneKey="gray" />
        <span className="h-4 w-px bg-slate-200 mx-1" />
        <Chip
          label="Documents"
          value={`${uploadedDocs}/${projectDocs.length}`}
          toneKey={uploadedDocs === projectDocs.length ? "green" : "amber"}
        />
        <span className="h-4 w-px bg-slate-200 mx-1" />
        <Chip
          label="Active Defects"
          value={openIssues}
          toneKey={openIssues > 0 ? "red" : "green"}
        />
      </div>

      <div className="space-y-6">
        {/* 1. PROJECT DETAILS CARD (IMAGE 2 SITE SCALE & LOCATION CARD) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Site Scale & Location Details
            </h2>
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    project.lat && project.lng ? `${project.lat},${project.lng}` : project.location,
                  )}`,
                  "_blank",
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <MapPin className="size-3.5 text-primary" /> View on Google Maps <ExternalLink className="size-3" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 mb-1">
                  <MapPin className="size-3.5 text-primary" /> Location
                </span>
                <p className="text-xs font-bold text-slate-900">{project.location}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="size-3" />
              </a>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 mb-1">
                <Maximize2 className="size-3.5 text-slate-600" /> Land Area
              </span>
              <p className="text-xs font-bold text-slate-900">{project.area} Acres</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 mb-1">
                <Layers className="size-3.5 text-slate-600" /> Structure
              </span>
              <p className="text-xs font-bold text-slate-900">
                {project.floors} Floors · {project.flats} Flats
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 mb-1">
                <User className="size-3.5 text-slate-600" /> Site Lead
              </span>
              <p className="text-xs font-bold text-slate-900">{project.admin}</p>
            </div>
          </div>

          {/* Embedded Google Maps Location Preview */}
          <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100 relative">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" /> Site GPS Location · {project.location}
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
              >
                <span>Full Map</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="h-44 w-full">
              <iframe
                title={`Google Map - ${project.name}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(project.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
            <div>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 mb-1">
                <Calendar className="size-3.5 text-slate-600" /> Timeline
              </span>
              <p className="text-xs text-slate-700">
                {formatDate(project.start_date)} → {formatDate(project.end_date)}
              </p>
            </div>

            <div>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 mb-1">
                Amenities
              </span>
              <div className="flex flex-wrap gap-1">
                {project.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 6 OPERATIONAL WORKSPACE TABS (per projectpage.md)              */}
        {/* Overview | SOPs | Team | Documents | Audits | Issues          */}
        {/* ------------------------------------------------------------- */}

        {/* Workspace Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 pt-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <TrendingUp className="size-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("sops")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "sops"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <ClipboardList className="size-4" />
            <span>Project SOPs</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                activeTab === "sops" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {assignedSops.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "team"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Users className="size-4" />
            <span>Team & Roles</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                activeTab === "team" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {projectTeam.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "documents"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <FileText className="size-4" />
            <span>Documents</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                activeTab === "documents" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {uploadedDocs}/{projectDocs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audits")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "audits"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>Audits</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                activeTab === "audits" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {projectAudits.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("issues")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "issues"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <AlertTriangle className="size-4" />
            <span>Issues & CAPA</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                activeTab === "issues"
                  ? "bg-white/20 text-white"
                  : openIssues > 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {projectIssues.length}
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW (Section 6 of projectpage.md)                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top 7 Executive Health KPI Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-slate-400">SOP Compliance</span>
                <p className="text-xl font-bold text-primary mt-1">{prog.pct}%</p>
                <span className="text-[10px] text-slate-500">Overall Site Adherence</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-slate-400">Total Personnel</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{projectTeam.length || 5}</p>
                <span className="text-[10px] text-slate-500">Assigned Site Crew</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-slate-400">Active SOPs</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{assignedSops.length}</p>
                <span className="text-[10px] text-slate-500">Governed Standards</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-slate-400">Qualified Staff</span>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  {Math.max(1, Math.round(projectTeam.length * 0.75))}
                </p>
                <span className="text-[10px] text-slate-500">Quiz & Assessment Cleared</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-slate-400">Pending Tests</span>
                <p className="text-xl font-bold text-blue-700 mt-1">2</p>
                <span className="text-[10px] text-slate-500">Evaluator Sign-offs Due</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-slate-400">Open Deviations</span>
                <p className="text-xl font-bold text-rose-600 mt-1">{openIssues}</p>
                <span className="text-[10px] text-slate-500">{highSeverityIssues} High Severity</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase text-slate-400">Overdue CAPA</span>
                <p className="text-xl font-bold text-amber-600 mt-1">
                  {overdueSopsCount > 0 ? overdueSopsCount : 0}
                </p>
                <span className="text-[10px] text-slate-500">Urgent Containment</span>
              </div>
            </div>

            {/* 2-Column Health Matrix */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: SOP Compliance Breakdown & Competency */}
              <div className="space-y-6">
                {/* SOP Compliance Breakdown */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        SOP Execution Breakdown
                      </h3>
                      <p className="text-xs text-slate-500">
                        {assignedSops.length} Active Procedures assigned to {project.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("sops")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      View SOPs <ArrowRight className="size-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">Overall Procedure Progress</span>
                      <span className="text-primary font-bold">{prog.pct}%</span>
                    </div>
                    <ProgressBar pct={prog.pct} />
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Completed</span>
                      <p className="text-base font-bold text-emerald-900 mt-0.5">{prog.completed}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-2 border border-amber-100">
                      <span className="text-[10px] font-bold text-amber-800 uppercase">In Progress</span>
                      <p className="text-base font-bold text-amber-900 mt-0.5">{prog.inProgress}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Not Started</span>
                      <p className="text-base font-bold text-slate-800 mt-0.5">{prog.notStarted}</p>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-2 border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-800 uppercase">Overdue</span>
                      <p className="text-base font-bold text-rose-900 mt-0.5">{overdueSopsCount}</p>
                    </div>
                  </div>
                </div>

                {/* Employee Competency Summary Matrix */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        Employee Competency & Qualification Funnel
                      </h3>
                      <p className="text-xs text-slate-500">Workforce certification per ISO 19011</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("team")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Team Hub <ArrowRight className="size-3" />
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                          <th className="py-2 px-3">Employee</th>
                          <th className="py-2 px-2">Role</th>
                          <th className="py-2 px-2 text-center">Required</th>
                          <th className="py-2 px-2 text-center">Qualified</th>
                          <th className="py-2 px-2 text-center">Pending</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projectTeam.slice(0, 4).map((tm, idx) => (
                          <tr key={tm.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{tm.name}</td>
                            <td className="py-2.5 px-2 text-slate-600 text-[11px]">{tm.role}</td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">
                              {assignedSops.length}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="font-mono font-bold text-emerald-700">
                                {idx % 2 === 0 ? assignedSops.length : assignedSops.length - 1}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="font-mono font-bold text-amber-600">
                                {idx % 2 === 0 ? 0 : 1}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right: Documents, Issues & Recent Activity */}
              <div className="space-y-6">
                {/* Document Compliance Health */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        Document Compliance Health
                      </h3>
                      <p className="text-xs text-slate-500">
                        {uploadedDocs} of {projectDocs.length} required documents submitted
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("documents")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Documents Register <ArrowRight className="size-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Required</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{projectDocs.length}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Approved</span>
                      <p className="text-base font-bold text-emerald-900 mt-0.5">{approvedDocs}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2.5 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-800 uppercase">In Review</span>
                      <p className="text-base font-bold text-blue-900 mt-0.5">{underReviewDocs}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-100">
                      <span className="text-[10px] font-bold text-amber-800 uppercase">Missing</span>
                      <p className="text-base font-bold text-amber-900 mt-0.5">{pendingDocs}</p>
                    </div>
                  </div>
                </div>

                {/* Issues & CAPA Health */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        Site Deviations & CAPA Health
                      </h3>
                      <p className="text-xs text-slate-500">Active non-conformances & containment</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("issues")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Issues Hub <ArrowRight className="size-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-rose-50 p-2.5 border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-800 uppercase">Open Issues</span>
                      <p className="text-base font-bold text-rose-900 mt-0.5">{openIssues}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-100">
                      <span className="text-[10px] font-bold text-amber-800 uppercase">Under RCA</span>
                      <p className="text-base font-bold text-amber-900 mt-0.5">
                        {projectIssues.filter((i) => i.status === "Assigned" || i.status === "In Progress").length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Closed</span>
                      <p className="text-base font-bold text-emerald-900 mt-0.5">{resolvedIssues}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Timeline */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Recent Project Activity Audit Log
                  </h3>
                  <div className="max-h-60 overflow-y-auto pr-1">
                    <ActivityFeed projectId={project.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: PROJECT SOPs (Sections 8 - 18 of projectpage.md)        */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "sops" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Project Standard Operating Procedures (SOPs)
                </h2>
                <p className="text-xs text-slate-500">
                  {assignedSops.length} procedures configured · Governed master standards with site-level execution hold-points.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Cards vs Table View Toggle */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setSopViewMode("table")}
                    className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                      sopViewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                    title="Table View"
                  >
                    <ListIcon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSopViewMode("cards")}
                    className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                      sopViewMode === "cards" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                    title="Card Grid"
                  >
                    <LayoutGrid className="size-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setAddSopModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all"
                >
                  <Plus className="size-3.5" /> Add SOP from Library
                </button>
              </div>
            </div>

            {/* KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total SOPs</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{assignedSops.length}</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-2.5 border border-orange-200">
                <span className="text-[10px] font-bold text-primary uppercase">Mandatory</span>
                <p className="text-base font-bold text-orange-950 mt-0.5">
                  {assignedSops.filter((ps) => ps.is_mandatory).length}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Completed</span>
                <p className="text-base font-bold text-emerald-900 mt-0.5">{prog.completed}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase">In Progress</span>
                <p className="text-base font-bold text-amber-900 mt-0.5">{prog.inProgress}</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Overdue</span>
                <p className="text-base font-bold text-rose-900 mt-0.5">{overdueSopsCount}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2.5 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-800 uppercase">Qualified</span>
                <p className="text-base font-bold text-blue-900 mt-0.5">
                  {Math.max(1, Math.round(projectTeam.length * 0.75))}
                </p>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="relative max-w-sm flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Search project SOPs by name, code, lead..."
                  value={sopSearch}
                  onChange={(e) => setSopSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-slate-50 border-slate-200"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={sopCategoryFilter} onValueChange={setSopCategoryFilter}>
                  <SelectTrigger className="h-9 text-xs w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All" className="text-xs">All Categories</SelectItem>
                    <SelectItem value="Civil Works" className="text-xs">Civil Works</SelectItem>
                    <SelectItem value="Safety & HSE" className="text-xs">Safety & HSE</SelectItem>
                    <SelectItem value="Quality Control" className="text-xs">Quality Control</SelectItem>
                    <SelectItem value="Electrical & MEP" className="text-xs">Electrical & MEP</SelectItem>
                    <SelectItem value="Finishing & Facade" className="text-xs">Finishing & Facade</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sopStatusFilter} onValueChange={setSopStatusFilter}>
                  <SelectTrigger className="h-9 text-xs w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All" className="text-xs">All Status</SelectItem>
                    <SelectItem value="In Progress" className="text-xs">In Progress</SelectItem>
                    <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                    <SelectItem value="Overdue" className="text-xs">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SOP Display: Table vs Cards */}
            {filteredProjectSops.length > 0 ? (
              sopViewMode === "table" ? (
                /* SOP Table View */
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
                        <th className="py-3 px-4">SOP Code & Procedure</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Version</th>
                        <th className="py-3 px-3">Mandatory</th>
                        <th className="py-3 px-3">Lead & Team</th>
                        <th className="py-3 px-4 min-w-[150px]">Step Progress</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProjectSops.map((ps) => {
                        const sop = state.sops.find((s) => s.id === ps.sop_id);
                        if (!sop) return null;
                        const sopProg = sopProgress(state, ps.id);
                        const isOverdue = isSopOverdue(ps, state);
                        const enrolledCount = ps.assigned_employees?.length || 1;

                        return (
                          <tr key={ps.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {sop.code || "SOP"}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 block line-clamp-1">{sop.name}</span>
                                  <span className="text-[11px] text-slate-500">{ps.applicable_activity || sop.process}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-slate-600 font-medium">
                              {sop.category || "Civil Works"}
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                              {sop.version_number || "V2.0"}
                            </td>
                            <td className="py-3.5 px-3">
                              {ps.is_mandatory ? (
                                <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                                  Mandatory
                                </span>
                              ) : (
                                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                  Optional
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-bold text-slate-900 block">{ps.assigned_to}</span>
                              <span className="text-[11px] text-slate-500">+{enrolledCount} enrolled</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-600 font-semibold">
                                    {sopProg.completed}/{sopProg.total} steps
                                  </span>
                                  <span className="font-bold text-primary">{sopProg.pct}%</span>
                                </div>
                                <ProgressBar pct={sopProg.pct} />
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              {isOverdue ? (
                                <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                                  Overdue
                                </span>
                              ) : sopProg.status === "Completed" ? (
                                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  Completed
                                </span>
                              ) : (
                                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                  In Progress
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setInspectSopId(ps.id)}
                                  className="h-7 text-xs font-semibold"
                                  title="Inspect 8-Tab Project SOP View"
                                >
                                  <Eye className="size-3.5 mr-1 text-slate-500" /> Inspect
                                </Button>
                                <Link
                                  to="/projects/$projectId/sops/$projectSopId"
                                  params={{ projectId: project.id, projectSopId: ps.id }}
                                  className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-primary hover:bg-orange-50 transition-colors shadow-xs"
                                  title="Open Step Execution App"
                                >
                                  <span>Execute</span>
                                  <ArrowRight className="size-3" />
                                </Link>
                                <button
                                  onClick={() => setUnassigningPs({ ps, sopName: sop.name })}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Unassign procedure"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* SOP Card Grid View */
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProjectSops.map((ps) => {
                    const sop = state.sops.find((s) => s.id === ps.sop_id);
                    if (!sop) return null;
                    const sopProg = sopProgress(state, ps.id);
                    const isOverdue = isSopOverdue(ps, state);

                    return (
                      <div
                        key={ps.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1.5 mb-2">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {sop.code || "SOP"}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {sop.version_number || "V2.0"}
                              </span>
                              {ps.is_mandatory && (
                                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-800">
                                  Mandatory
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{sop.name}</h4>
                          <p className="text-[11px] text-slate-500 mb-3">{ps.applicable_activity || sop.process}</p>

                          <div className="space-y-1 mb-4">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-600 font-semibold">
                                {sopProg.completed}/{sopProg.total} steps
                              </span>
                              <span className="font-bold text-primary">{sopProg.pct}%</span>
                            </div>
                            <ProgressBar pct={sopProg.pct} />
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-600 font-medium">Lead: {ps.assigned_to}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInspectSopId(ps.id)}
                              className="h-7 text-xs px-2"
                            >
                              Inspect
                            </Button>
                            <Link
                              to="/projects/$projectId/sops/$projectSopId"
                              params={{ projectId: project.id, projectSopId: ps.id }}
                              className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-semibold text-white hover:bg-primary/90 transition-all shadow-xs"
                            >
                              <span>Step App</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="py-12 text-center text-slate-400">
                No standard operating procedures match your search or filter parameters.
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: TEAM & ROLES (Section 7 of projectpage.md)              */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "team" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Project Personnel & Competency Roster
                </h2>
                <p className="text-xs text-slate-500">
                  Manage site engineers, inspectors, supervisors, and subcontractor personnel assigned to {project.name}.
                </p>
              </div>

              <button
                onClick={() => setAddTeamModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all"
              >
                <UserPlus className="size-3.5" /> Assign Employee to Project
              </button>
            </div>

            {/* Team KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Personnel</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{projectTeam.length}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Active on Site</span>
                <p className="text-base font-bold text-emerald-900 mt-0.5">
                  {projectTeam.filter((tm) => tm.status === "Active").length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2.5 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-800 uppercase">Qualified Staff</span>
                <p className="text-base font-bold text-blue-900 mt-0.5">
                  {Math.max(1, Math.round(projectTeam.length * 0.75))}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Evaluations Due</span>
                <p className="text-base font-bold text-amber-900 mt-0.5">2</p>
              </div>
            </div>

            {/* Team Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-3 px-4">Employee Name</th>
                    <th className="py-3 px-3">Project Role</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-4">Primary Responsibility</th>
                    <th className="py-3 px-3">Start Date</th>
                    <th className="py-3 px-3">SOP Qualifications</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectTeam.map((tm, idx) => (
                    <tr key={tm.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs border border-slate-200">
                            {tm.name.charAt(0)}
                          </span>
                          <span>{tm.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{tm.role}</td>
                      <td className="py-3.5 px-3 text-slate-600">{tm.department}</td>
                      <td className="py-3.5 px-4 text-slate-600 line-clamp-1 max-w-xs">{tm.responsibility}</td>
                      <td className="py-3.5 px-3 text-slate-500">{formatDate(tm.start_date)}</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-100">
                          <Award className="size-3" />
                          {idx % 2 === 0 ? "3 Standards" : "2 Standards"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {tm.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => toast.success(`Sent learning reminder to ${tm.name}`)}
                          >
                            Remind
                          </Button>
                          <button
                            onClick={() => {
                              actions.removeProjectTeamMember(tm.id);
                              toast.success(`Removed ${tm.name} from project team`);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove employee"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: DOCUMENTS (Sections 19 - 29 of projectpage.md)          */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "documents" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Project Document Requirements & Controlled Evidence
                </h2>
                <p className="text-xs text-slate-500">
                  ISO 9001:2015 Clause 7.5 controlled repository · Separation of Requirements vs Actual Submitted Evidence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfigDocsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  <SlidersHorizontal className="size-3.5" /> Configure Requirements
                </button>
                <button
                  onClick={() => setSubmitDocModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all"
                >
                  <Upload className="size-3.5" /> + Submit Evidence
                </button>
              </div>
            </div>

            {/* Document KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Required</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{projectDocs.length}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2.5 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase">Submitted</span>
                <p className="text-base font-bold text-blue-950 mt-0.5">{uploadedDocs}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Approved</span>
                <p className="text-base font-bold text-emerald-900 mt-0.5">{approvedDocs}</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-2.5 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-800 uppercase">Under Review</span>
                <p className="text-base font-bold text-purple-900 mt-0.5">{underReviewDocs}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Pending</span>
                <p className="text-base font-bold text-amber-900 mt-0.5">{pendingDocs}</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Expiring</span>
                <p className="text-base font-bold text-rose-900 mt-0.5">1</p>
              </div>
            </div>

            {/* Document Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="relative max-w-sm flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Filter documents by code, name, category..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-slate-50 border-slate-200"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(["All", "Pending", "Under Review", "Approved", "Rejected"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setDocStatusFilter(status)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      docStatusFilter === status
                        ? "bg-slate-900 text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Documents Table Register */}
            {filteredDocs.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-3 px-4">Code & Document</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Rev</th>
                      <th className="py-3 px-3">Submitted By</th>
                      <th className="py-3 px-3">Compliance Status</th>
                      <th className="py-3 px-3">Control Stamp</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.map((doc) => {
                      const isApproved = doc.status === "Approved";
                      const isUnderReview = doc.status === "Submitted" || doc.status === "Under Review";
                      const isPending = doc.status === "Pending" || !doc.file_name;

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {doc.document_code || `DOC-${doc.id.slice(-4)}`}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block">{doc.document_name}</span>
                                {doc.file_name && (
                                  <span className="text-[11px] text-slate-500 font-mono">{doc.file_name}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 font-medium">{doc.category || "General"}</td>
                          <td className="py-3.5 px-3 text-slate-600">{doc.document_type || "Quality Report"}</td>
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-700">{doc.revision || "R0"}</td>
                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-slate-800 block">
                              {doc.uploaded_by || doc.assigned_to || "Site Engineer"}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {doc.submission_date ? formatDate(doc.submission_date) : "Pending Upload"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            {isApproved ? (
                              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                Approved
                              </span>
                            ) : isUnderReview ? (
                              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                                Under Review
                              </span>
                            ) : doc.status === "Rejected" ? (
                              <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                                Rejected
                              </span>
                            ) : (
                              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                Pending Evidence
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                doc.control_status === "Controlled"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : doc.control_status === "Reference Only"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {doc.control_status || "Draft"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDoc(doc)}
                                className="h-7 text-xs font-semibold"
                              >
                                <Eye className="size-3.5 mr-1 text-slate-500" /> Inspect
                              </Button>
                              <button
                                onClick={() => actions.deleteProjectDocument(doc.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete document requirement"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                No technical documents match your filter. Click "Configure Requirements" to map master documents.
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: AUDITS (Section 30 of projectpage.md)                   */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "audits" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Project Compliance & Quality Audits
                </h2>
                <p className="text-xs text-slate-500">
                  ISO 19011 field compliance audits and checklist verification records for {project.name}.
                </p>
              </div>

              <button
                onClick={() => setAuditModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all"
              >
                <Plus className="size-3.5" /> Schedule Project Audit
              </button>
            </div>

            {/* Audit KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Audits</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{projectAudits.length}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2.5 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase">Scheduled</span>
                <p className="text-base font-bold text-blue-950 mt-0.5">
                  {projectAudits.filter((a) => a.status === "Scheduled").length}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Passed</span>
                <p className="text-base font-bold text-emerald-900 mt-0.5">
                  {projectAudits.filter((a) => a.status === "Completed" && a.passed).length}
                </p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Failed</span>
                <p className="text-base font-bold text-rose-900 mt-0.5">
                  {projectAudits.filter((a) => a.status === "Completed" && !a.passed).length}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase">NCRs Raised</span>
                <p className="text-base font-bold text-amber-900 mt-0.5">
                  {projectAudits.reduce((acc, a) => acc + (a.findings?.filter((f) => !f.passed)?.length || 0), 0)}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-2.5 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-800 uppercase">Average Score</span>
                <p className="text-base font-bold text-purple-900 mt-0.5">89%</p>
              </div>
            </div>

            {/* Audits Register Table */}
            {projectAudits.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-3 px-4">Audit ID & Title</th>
                      <th className="py-3 px-3">Audit Type</th>
                      <th className="py-3 px-3">SOP Standard</th>
                      <th className="py-3 px-3">Auditor</th>
                      <th className="py-3 px-3">Scheduled Date</th>
                      <th className="py-3 px-3">Score</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectAudits.map((aud) => (
                      <tr key={aud.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {aud.audit_number}
                            </span>
                            <span>{aud.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{aud.audit_type}</td>
                        <td className="py-3.5 px-3 text-slate-600 font-medium">
                          {aud.sop_name} ({aud.sop_version})
                        </td>
                        <td className="py-3.5 px-3 text-slate-800 font-semibold">{aud.auditor_name}</td>
                        <td className="py-3.5 px-3 text-slate-500">{formatDate(aud.scheduled_date)}</td>
                        <td className="py-3.5 px-3">
                          {aud.overall_score !== undefined && aud.overall_score !== null ? (
                            <span className="font-bold text-slate-900">{aud.overall_score}%</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              aud.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : aud.status === "Scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {aud.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Link
                            to="/audits"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="size-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                No compliance audits scheduled for this project yet. Use "+ Schedule Project Audit" to plan one.
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: ISSUES & CAPA (Sections 31 - 32 of projectpage.md)      */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "issues" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Site Deviations, Non-Conformances & 5-Stage CAPA
                </h2>
                <p className="text-xs text-slate-500">
                  {openIssues} active deviations requiring containment, 5 Whys RCA, or corrective action sign-off.
                </p>
              </div>

              <button
                onClick={() => setReportIssueModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-all"
              >
                <AlertTriangle className="size-3.5" /> + Report Defect / NCR
              </button>
            </div>

            {/* Issue KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Logged</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{projectIssues.length}</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Open / Assigned</span>
                <p className="text-base font-bold text-rose-900 mt-0.5">{openIssues}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-800 uppercase">High Severity</span>
                <p className="text-base font-bold text-amber-900 mt-0.5">{highSeverityIssues}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2.5 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-800 uppercase">Under RCA</span>
                <p className="text-base font-bold text-blue-900 mt-0.5">
                  {projectIssues.filter((i) => i.status === "In Progress").length}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Verified Closed</span>
                <p className="text-base font-bold text-emerald-900 mt-0.5">{resolvedIssues}</p>
              </div>
            </div>

            {/* Issues Table Register */}
            {projectIssues.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-3 px-4">NCR Code & Title</th>
                      <th className="py-3 px-3">Related Procedure</th>
                      <th className="py-3 px-3">Severity</th>
                      <th className="py-3 px-3">Assigned Lead</th>
                      <th className="py-3 px-3">Target Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">5-Stage CAPA</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projectIssues.map((issue) => {
                      const sop = state.sops.find((s) => s.id === issue.sop_id);
                      return (
                        <tr key={issue.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mr-1.5">
                                {issue.id}
                              </span>
                              <span>{issue.title}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 font-medium">
                            {sop?.name || "General Civil Work"}
                          </td>
                          <td className="py-3.5 px-3">
                            <PriorityBadge priority={issue.priority} />
                          </td>
                          <td className="py-3.5 px-3 text-slate-800 font-semibold">{issue.assigned_to}</td>
                          <td className="py-3.5 px-3 text-slate-500">{formatDate(issue.created_at)}</td>
                          <td className="py-3.5 px-3">
                            <IssueStatusBadge status={issue.status} />
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              {issue.capa_stage || "1_Containment"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to="/issues/$issueId"
                                params={{ issueId: issue.id }}
                                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-primary hover:bg-orange-50 transition-colors shadow-xs"
                              >
                                <span>RCA Studio</span>
                                <ArrowRight className="size-3" />
                              </Link>
                              <button
                                onClick={() => actions.deleteIssue(issue.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete issue"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                Zero deviations or quality issues currently logged on {project.name}. Clean record!
              </div>
            )}
          </section>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODALS & INSPECTORS                                           */}
      {/* ------------------------------------------------------------- */}

      {/* 8-Tab Project-Specific SOP Inspector */}
      <ProjectSopDetailModal
        open={!!inspectSopId}
        onOpenChange={(open) => !open && setInspectSopId(null)}
        projectSopId={inspectSopId}
        projectId={project.id}
      />

      {/* Add SOP from Library Applicability Config Modal */}
      <AddProjectSopModal
        open={addSopModalOpen}
        onOpenChange={setAddSopModalOpen}
        projectId={project.id}
      />

      {/* Assign Team Member Modal */}
      <AddProjectTeamModal
        open={addTeamModalOpen}
        onOpenChange={setAddTeamModalOpen}
        projectId={project.id}
      />

      {/* Configure Project Requirements from Document Masters */}
      <ProjectDocConfigModal
        open={configDocsModalOpen}
        onOpenChange={setConfigDocsModalOpen}
        initialProjectId={project.id}
      />

      {/* 5-Tab Document Detail & Review Modal */}
      {selectedDoc && (
        <DocPreviewModal
          open={docModalOpen}
          onOpenChange={(open) => {
            setDocModalOpen(open);
            if (!open) setSelectedDoc(null);
          }}
          document={selectedDoc}
        />
      )}

      {/* Submit Document Evidence Modal */}
      <AddDocumentModal
        open={submitDocModalOpen}
        onOpenChange={setSubmitDocModalOpen}
        projectId={project.id}
      />

      {/* Edit Project Drawer */}
      <ProjectFormDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        project={project}
      />

      {/* Report Defect / Non-conformance Modal */}
      <ReportIssueModal
        open={reportIssueModalOpen}
        onOpenChange={setReportIssueModalOpen}
        projectId={project.id}
      />

      {/* Schedule Project Audit Modal */}
      <ProjectAuditModal
        open={auditModalOpen}
        onOpenChange={setAuditModalOpen}
        project={project}
      />

      {/* Unassign Project SOP Confirmation Dialog */}
      <Dialog open={!!unassigningPs} onOpenChange={(open) => !open && setUnassigningPs(null)}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 font-display">
              Unassign SOP from Project?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to unassign{" "}
              <strong className="text-slate-900">{unassigningPs?.sopName}</strong> from{" "}
              <strong className="text-slate-900">{project.name}</strong>? Step checklist progress will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 border-t border-slate-100">
            <Button variant="ghost" className="text-xs" onClick={() => setUnassigningPs(null)}>
              Cancel
            </Button>
            <Button
              className="text-xs bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => {
                if (unassigningPs) {
                  actions.unassignSopFromProject(unassigningPs.ps.id);
                  toast.success(`Unassigned "${unassigningPs.sopName}" from project.`);
                  setUnassigningPs(null);
                }
              }}
            >
              Confirm Unassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={deleteProjectModalOpen} onOpenChange={setDeleteProjectModalOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-700 font-display">
              Delete Project Workspace?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              This will permanently delete the project workspace for{" "}
              <strong className="text-slate-900">{project.name} ({project.code})</strong>, including all assigned
              SOP configurations, documents, audits, and issues. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 border-t border-slate-100">
            <Button variant="ghost" className="text-xs" onClick={() => setDeleteProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button className="text-xs bg-rose-600 text-white hover:bg-rose-700" onClick={handleDeleteProject}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
