import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  Plus,
  Layers,
  Edit,
  Info,
  Trash2,
  GitBranch,
  RotateCcw,
  CheckCircle2,
  Clock,
  FileCheck,
  History,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Search,
  Building2,
  Users,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  Eye,
  Calendar,
  Share2,
  HardHat,
  BadgeAlert,
  ArrowUpRight,
  GraduationCap,
  Download,
  Filter,
  Table as TableIcon,
  LayoutGrid,
  X,
  Check,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  actions,
  CURRENT_USER,
  DEPARTMENTS,
  getSopUsedInProjects,
  getSopBlastRadius,
  sopProgress,
  useSiteflow,
  formatDate,
  type Sop,
  type SopLifecycleStatus,
  type SopStep,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sop-library/")({
  component: SopLibraryPage,
});

const CATEGORIES = [
  "All SOPs",
  "Civil Works",
  "Safety & HSE",
  "Quality Control",
  "Site Operations",
  "Electrical & MEP",
  "Finishing & Facade",
  "Administration",
] as const;

export function SopLibraryPage() {
  const state = useSiteflow();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All SOPs");
  const [filterDepartment, setFilterDepartment] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCriticality, setFilterCriticality] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [activeSubTab, setActiveSubTab] = useState<"masters" | "deployments">("masters");

  // Modals state
  const [blastRadiusSop, setBlastRadiusSop] = useState<Sop | null>(null);
  const [batchMappingSop, setBatchMappingSop] = useState<Sop | null>(null);
  const [selectedProjectsToMap, setSelectedProjectsToMap] = useState<string[]>([]);
  const [batchAssignee, setBatchAssignee] = useState<string>("Vikram Sharma");
  const [batchDueDate, setBatchDueDate] = useState<string>("2026-06-30");

  // Delete Confirmation state
  const [deleteConfirmSop, setDeleteConfirmSop] = useState<Sop | null>(null);

  // Create SOP Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4>(1);
  const [formSop, setFormSop] = useState({
    code: "",
    name: "",
    category: "Civil Works",
    process: "",
    department: "Civil",
    criticality: "High" as "Low" | "Medium" | "High" | "Critical",
    owner_name: CURRENT_USER.name,
    effective_date: new Date().toISOString().split("T")[0] || "2026-03-01",
    review_frequency_months: 12,
    purpose: "",
    scope: "",
    responsibilities: "Site Engineers ensure step-by-step adherence. QA/QC verifies compliance before signing pour cards.",
    applicable_industries: ["Commercial", "Residential"],
    applicable_project_types: ["High-Rise", "Precast"],
    applicable_roles: ["Site Engineer", "QA/QC Inspector"],
    inputs: "Approved structural drawings, bar bending schedule, batch plant calibration sheet",
    materials: "TMT Fe550D rebar, binding wire, cover blocks (40mm/50mm)",
    safety_ppe: "Safety helmet (IS 2925), steel-toe safety shoes, cut-resistant gloves, reflective high-vis vest",
    expected_output: "Reinforcement cage placed strictly as per drawing tolerances (±5mm cover, ±10mm rebar spacing)",
    references: "IS 456:2000, IS 2502, SP 34",
  });
  const [formSteps, setFormSteps] = useState<{ step_number: number; title: string; instructions: string }[]>([
    {
      step_number: 1,
      title: "Pre-execution Drawing & Material Verification",
      instructions: "Verify approved 'Good For Construction' (GFC) drawings and ensure material mill test certificates are verified against IS codes.",
    },
    {
      step_number: 2,
      title: "Work Area Safety Inspection & PPE Compliance",
      instructions: "Ensure all personnel are wearing mandatory PPE, edge protection is installed, and work permits are signed.",
    },
  ]);

  // Revision Modal state
  const [revisionSop, setRevisionSop] = useState<Sop | null>(null);
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionSteps, setRevisionSteps] = useState<SopStep[]>([]);

  // Filtering Logic
  const filteredSops = useMemo(() => {
    return state.sops.filter((sop) => {
      // Category folder filter
      if (selectedCategory !== "All SOPs") {
        if (selectedCategory === "Safety & HSE" && sop.category !== "Safety" && sop.category !== "Safety & HSE") return false;
        if (selectedCategory === "Electrical & MEP" && sop.category !== "Electrical & MEP" && sop.category !== "Electrical") return false;
        if (selectedCategory === "Finishing & Facade" && sop.category !== "Finishing & Facade" && sop.category !== "Finishing") return false;
        if (selectedCategory !== "Safety & HSE" && selectedCategory !== "Electrical & MEP" && selectedCategory !== "Finishing & Facade" && sop.category !== selectedCategory) {
          return false;
        }
      }

      // Dropdown filters
      if (filterDepartment !== "ALL" && sop.department !== filterDepartment) return false;
      if (filterStatus !== "ALL" && (sop.lifecycle_status || "Approved") !== filterStatus) return false;
      if (filterCriticality !== "ALL" && (sop.criticality || "High") !== filterCriticality) return false;

      // Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const codeMatch = (sop.code || "").toLowerCase().includes(q);
        const nameMatch = (sop.name || "").toLowerCase().includes(q);
        const processMatch = (sop.process || "").toLowerCase().includes(q);
        const purposeMatch = (sop.purpose || "").toLowerCase().includes(q);
        const tagMatch = (sop.applicable_roles || []).some((r) => r.toLowerCase().includes(q));
        if (!codeMatch && !nameMatch && !processMatch && !purposeMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [state.sops, selectedCategory, filterDepartment, filterStatus, filterCriticality, searchTerm]);

  // Total deployments calculation
  const totalDeployments = useMemo(() => {
    return state.projectSops.length;
  }, [state.projectSops]);

  // Active consuming projects count
  const activeProjectsCount = useMemo(() => {
    const projIds = new Set(state.projectSops.map((ps) => ps.project_id));
    return projIds.size;
  }, [state.projectSops]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "All SOPs": state.sops.length };
    state.sops.forEach((s) => {
      const cat = s.category || "Civil Works";
      counts[cat] = (counts[cat] || 0) + 1;
      if (cat === "Safety") counts["Safety & HSE"] = (counts["Safety & HSE"] || 0) + 1;
      if (cat === "Electrical") counts["Electrical & MEP"] = (counts["Electrical & MEP"] || 0) + 1;
      if (cat === "Finishing") counts["Finishing & Facade"] = (counts["Finishing & Facade"] || 0) + 1;
    });
    return counts;
  }, [state.sops]);

  // Handle Blast Radius
  const handleOpenBlastRadius = (sop: Sop) => {
    setBlastRadiusSop(sop);
  };

  // Handle Batch Mapping
  const handleOpenBatchMapping = (sop: Sop) => {
    setBatchMappingSop(sop);
    const existingMappings = state.projectSops.filter((ps) => ps.sop_id === sop.id).map((ps) => ps.project_id);
    const unmapped = state.projects.filter((p) => !existingMappings.includes(p.id)).map((p) => p.id);
    setSelectedProjectsToMap(unmapped.length > 0 ? unmapped : []);
  };

  const handleSaveBatchMapping = () => {
    if (!batchMappingSop) return;
    if (selectedProjectsToMap.length === 0) {
      toast.error("Please select at least one project to map.");
      return;
    }

    actions.batchMapSopToProjects(
      batchMappingSop.id,
      selectedProjectsToMap,
      batchAssignee,
      batchDueDate
    );

    toast.success(
      `Master SOP ${batchMappingSop.code || batchMappingSop.name} successfully mapped to ${selectedProjectsToMap.length} projects without record duplication!`
    );
    setBatchMappingSop(null);
  };

  // Handle Delete SOP
  const handleDeleteSop = () => {
    if (!deleteConfirmSop) return;
    const sopCode = deleteConfirmSop.code || deleteConfirmSop.name;
    actions.deleteSop(deleteConfirmSop.id);
    toast.success(`Master SOP standard ${sopCode} deleted from central library.`);
    setDeleteConfirmSop(null);
  };

  // Handle Create SOP
  const handleCreateMasterSop = () => {
    if (!formSop.code.trim() || !formSop.name.trim()) {
      toast.error("Please enter a valid SOP Code and Name.");
      return;
    }

    const newSop: Sop = {
      id: `sop-master-${Date.now()}`,
      code: formSop.code.trim().toUpperCase(),
      name: formSop.name.trim(),
      description: formSop.purpose.trim() || formSop.name.trim(),
      category: formSop.category,
      process: formSop.process || formSop.category,
      department: formSop.department,
      criticality: formSop.criticality,
      version_number: "V1.0",
      lifecycle_status: "Effective",
      owner_name: formSop.owner_name,
      effective_date: formSop.effective_date,
      review_frequency_months: formSop.review_frequency_months,
      purpose: formSop.purpose,
      scope: formSop.scope,
      responsibilities: formSop.responsibilities,
      applicable_industries: formSop.applicable_industries,
      applicable_project_types: formSop.applicable_project_types,
      applicable_roles: formSop.applicable_roles,
      inputs: formSop.inputs,
      materials: formSop.materials,
      safety_ppe: formSop.safety_ppe,
      expected_output: formSop.expected_output,
      references: formSop.references,
      version_history: [
        {
          version_number: "V1.0",
          lifecycle_status: "Effective",
          effective_date: formSop.effective_date,
          revision_reason: "Initial Master Standard Publication across all enterprise projects.",
          change_summary: "Initial release of standard operating procedure.",
          author: formSop.owner_name,
          created_at: new Date().toISOString(),
        },
      ],
    };

    const stepsToSave: SopStep[] = formSteps.map((st, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      sop_id: newSop.id,
      step_number: idx + 1,
      title: st.title,
      instructions: st.instructions,
    }));

    actions.saveMasterSop(newSop, stepsToSave);
    toast.success(`Master SOP ${newSop.code} published into central standard library!`);
    setShowCreateModal(false);
    setCreateStep(1);
    setFormSop({
      code: "",
      name: "",
      category: "Civil Works",
      process: "",
      department: "Civil",
      criticality: "High",
      owner_name: CURRENT_USER.name,
      effective_date: new Date().toISOString().split("T")[0] || "2026-03-01",
      review_frequency_months: 12,
      purpose: "",
      scope: "",
      responsibilities: "Site Engineers ensure step-by-step adherence.",
      applicable_industries: ["Commercial", "Residential"],
      applicable_project_types: ["High-Rise", "Precast"],
      applicable_roles: ["Site Engineer", "QA/QC Inspector"],
      inputs: "Approved structural drawings",
      materials: "TMT Fe550D rebar, binding wire",
      safety_ppe: "Safety helmet, safety shoes, gloves",
      expected_output: "Placed strictly as per drawing tolerances",
      references: "IS 456:2000",
    });
  };

  // Handle Revision
  const handleOpenRevision = (sop: Sop) => {
    setRevisionSop(sop);
    setRevisionReason("");
    const curSteps = state.steps.filter((st) => st.sop_id === sop.id);
    setRevisionSteps(curSteps.length > 0 ? curSteps : []);
  };

  const handlePublishRevision = () => {
    if (!revisionSop) return;
    if (!revisionReason.trim()) {
      toast.error("ISO 9001 governance requires a documented Change Reason.");
      return;
    }

    const currentMajor = parseInt(revisionSop.version_number?.replace(/[^\d]/g, "") || "1", 10) || 1;
    const nextVersionNum = currentMajor + 1;
    const nextVersionLabel = `V${nextVersionNum}.0`;

    const updatedSop: Sop = {
      ...revisionSop,
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
        ...(revisionSop.version_history || []),
      ],
    };

    actions.saveMasterSop(updatedSop, revisionSteps);
    toast.success(`SOP ${updatedSop.code || updatedSop.name} upgraded to ${nextVersionLabel}. Version propagated centrally across consuming projects!`);
    setRevisionSop(null);
  };

  const isFiltered =
    selectedCategory !== "All SOPs" ||
    filterDepartment !== "ALL" ||
    filterStatus !== "ALL" ||
    filterCriticality !== "ALL" ||
    searchTerm.trim() !== "";

  const handleClearFilters = () => {
    setSelectedCategory("All SOPs");
    setFilterDepartment("ALL");
    setFilterStatus("ALL");
    setFilterCriticality("ALL");
    setSearchTerm("");
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* ========================================================= */}
        {/* LEVEL 1: HEADER & TOP ACTION BAR                          */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
                <ClipboardList className="size-5" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                SOP Library & Version Engine
              </h1>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                ISO 9001 / IS 456
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Central Master-Data Engine: Define standardized procedures once, govern version lifecycles centrally, and map dynamically across active construction projects.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const first = state.sops[0];
                if (first) {
                  handleOpenBatchMapping(first);
                } else {
                  toast.error("No SOP available to map.");
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Share2 className="size-3.5 text-primary" /> Map SOPs to Project
            </button>

            {/* Clean single plus button */}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Plus className="size-4" /> Create Master SOP
            </button>
          </div>
        </div>

        {/* TOP LEVEL METRIC CARDS */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Master SOPs</span>
              <BookOpen className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{state.sops.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Central Authoritative Standards</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Effective Standards</span>
              <ShieldCheck className="size-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700">
              {state.sops.filter((s) => s.lifecycle_status === "Effective" || s.lifecycle_status === "Approved" || !s.lifecycle_status).length}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Controlled & Validated</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Consuming Projects</span>
              <Building2 className="size-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{activeProjectsCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Live Sites Using Masters</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Site SOP Mappings</span>
              <Layers className="size-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{totalDeployments}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Active References</p>
          </div>
        </div>

        {/* SEARCH & REFINED RADIX SELECT DROPDOWNS */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SOP Code, Name, Process, Role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Radix UI Styled Dropdown for Departments */}
          <div className="w-[155px]">
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg p-1 text-xs">
                <SelectItem value="ALL" className="text-xs py-2 rounded-lg cursor-pointer font-medium">All Departments</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept} className="text-xs py-2 rounded-lg cursor-pointer">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Radix UI Styled Dropdown for Statuses */}
          <div className="w-[145px]">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg p-1 text-xs">
                <SelectItem value="ALL" className="text-xs py-2 rounded-lg cursor-pointer font-medium">All Statuses</SelectItem>
                <SelectItem value="Effective" className="text-xs py-2 rounded-lg cursor-pointer text-emerald-700 font-bold">Effective</SelectItem>
                <SelectItem value="Approved" className="text-xs py-2 rounded-lg cursor-pointer text-indigo-700 font-bold">Approved</SelectItem>
                <SelectItem value="In Review" className="text-xs py-2 rounded-lg cursor-pointer text-amber-700 font-bold">In Review</SelectItem>
                <SelectItem value="Draft" className="text-xs py-2 rounded-lg cursor-pointer text-slate-700 font-bold">Draft</SelectItem>
                <SelectItem value="Obsolete" className="text-xs py-2 rounded-lg cursor-pointer text-slate-500">Obsolete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Radix UI Styled Dropdown for Criticality */}
          <div className="w-[145px]">
            <Select value={filterCriticality} onValueChange={setFilterCriticality}>
              <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300">
                <SelectValue placeholder="All Criticalities" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg p-1 text-xs">
                <SelectItem value="ALL" className="text-xs py-2 rounded-lg cursor-pointer font-medium">All Criticalities</SelectItem>
                <SelectItem value="Critical" className="text-xs py-2 rounded-lg cursor-pointer text-red-700 font-bold">Critical</SelectItem>
                <SelectItem value="High" className="text-xs py-2 rounded-lg cursor-pointer text-amber-700 font-bold">High</SelectItem>
                <SelectItem value="Medium" className="text-xs py-2 rounded-lg cursor-pointer text-blue-700 font-medium">Medium</SelectItem>
                <SelectItem value="Low" className="text-xs py-2 rounded-lg cursor-pointer text-slate-700 font-medium">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <X className="size-3.5" /> Clear
            </button>
          )}
        </div>

        {/* ========================================================= */}
        {/* LEVEL 2: DEDICATED TIERS (ZERO OVERLAY / SEPARATED ROWS)  */}
        {/* ========================================================= */}
        <div className="space-y-3">
          {/* Tier 1: Mode Switcher Tabs (Master Standards vs Consuming Sites) */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveSubTab("masters")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer",
                  activeSubTab === "masters"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <BookOpen className="size-3.5 text-primary" />
                <span>Master Standards Register ({state.sops.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("deployments")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer",
                  activeSubTab === "deployments"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Building2 className="size-3.5 text-indigo-600" />
                <span>Consuming Projects Matrix ({activeProjectsCount})</span>
              </button>
            </div>
          </div>

          {/* Tier 2: Category Folders Taxonomy Pills - 100% full width, zero overlay */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer",
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <FolderOpen className={cn("size-3.5", isSelected ? "text-amber-300" : "text-slate-400")} />
                  <span>{cat}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 font-mono text-[10px]",
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* LEVEL 3: MASTER REGISTER & CARD VIEW TOGGLE               */}
        {/* ========================================================= */}
        {activeSubTab === "masters" ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {/* Table / Card Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/75 px-4 py-3 gap-3">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-slate-900">
                  Master SOP Register
                </span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                  Showing {filteredSops.length} of {state.sops.length} Standards
                </span>
              </div>

              {/* Card vs Table View Filter Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer",
                      viewMode === "table"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                    title="Table View"
                  >
                    <TableIcon className="size-3.5" />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("card")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer",
                      viewMode === "card"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                    title="Card View"
                  >
                    <LayoutGrid className="size-3.5" />
                    <span>Cards</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TABULAR VIEW */}
            {viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5">Code</th>
                      <th className="px-4 py-3.5">SOP Name & Process</th>
                      <th className="px-4 py-3.5">Category & Criticality</th>
                      <th className="px-4 py-3.5">Version</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Used In Projects</th>
                      <th className="px-4 py-3.5">Owner / Lead</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSops.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <ClipboardList className="mx-auto size-9 text-slate-300 mb-2" />
                          <p className="text-sm font-semibold text-slate-600">No master SOPs found matching filter criteria</p>
                          <p className="text-xs text-slate-400 mt-0.5">Try resetting search or category filters</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSops.map((sop) => {
                        const blast = getSopBlastRadius(state, sop.id);
                        const criticality = sop.criticality || "High";
                        const status = sop.lifecycle_status || "Approved";

                        return (
                          <tr
                            key={sop.id}
                            className="hover:bg-amber-50/30 transition-colors group cursor-pointer"
                            onClick={() => navigate({ to: "/sop-library/$sopId", params: { sopId: sop.id } })}
                          >
                            {/* Code */}
                            <td className="px-4 py-3.5 font-mono font-bold text-primary whitespace-nowrap">
                              <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-primary border border-primary/20">
                                {sop.code || `SOP-${sop.id.slice(-4)}`}
                              </span>
                            </td>

                            {/* Name & Process */}
                            <td className="px-4 py-3.5 max-w-xs">
                              <div className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                                {sop.name}
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {sop.process || sop.description || "Operational standardized execution step"}
                              </div>
                            </td>

                            {/* Category & Criticality */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-slate-700">{sop.category || "Civil Works"}</span>
                                <span
                                  className={cn(
                                    "w-fit rounded px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase",
                                    criticality === "Critical"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : criticality === "High"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-slate-100 text-slate-600"
                                  )}
                                >
                                  {criticality}
                                </span>
                              </div>
                            </td>

                            {/* Version */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700 border border-indigo-200/60">
                                <GitBranch className="size-3" />
                                {sop.version_number || "V1.0"}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {formatDate(sop.effective_date)}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                                  status === "Effective" || status === "Approved"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : status === "In Review"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-slate-100 text-slate-600"
                                )}
                              >
                                {status === "Effective" && <CheckCircle2 className="size-3" />}
                                {status === "Approved" && <CheckCircle className="size-3" />}
                                {status === "In Review" && <Clock className="size-3" />}
                                {status}
                              </span>
                            </td>

                            {/* INTERACTIVE USED IN X PROJECTS BADGE */}
                            <td
                              className="px-4 py-3.5 whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBlastRadius(sop);
                              }}
                            >
                              <button
                                type="button"
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all border shadow-2xs hover:scale-102 cursor-pointer",
                                  blast.totalProjects > 0
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                )}
                                title="Click to view full operational blast radius and consuming sites"
                              >
                                <Building2 className="size-3.5 text-indigo-600" />
                                <span>Used in {blast.totalProjects} Projects</span>
                                <ArrowUpRight className="size-3 text-indigo-400" />
                              </button>
                            </td>

                            {/* Owner */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                              <div className="font-semibold text-slate-800">{sop.owner_name || "Central QA/QC"}</div>
                              <div className="text-[10px] text-slate-400">{sop.department || "Site Operations"}</div>
                            </td>

                            {/* ACTIONS: Explicit, intuitive buttons with labels and delete action */}
                            <td
                              className="px-4 py-3.5 text-right whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1.5">
                                {/* 1. Inspect */}
                                <Link
                                  to="/sop-library/$sopId"
                                  params={{ sopId: sop.id }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary shadow-2xs transition-colors"
                                  title="Inspect full master procedure & 9 tabs"
                                >
                                  <Eye className="size-3.5 text-primary" />
                                  <span>Inspect</span>
                                </Link>

                                {/* 2. Map to Projects */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenBatchMapping(sop)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                                  title="Deploy & Map SOP to active construction projects"
                                >
                                  <Building2 className="size-3.5 text-indigo-600" />
                                  <span className="hidden xl:inline">Map</span>
                                </button>

                                {/* 3. Revise ISO Version */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenRevision(sop)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 shadow-2xs transition-colors cursor-pointer"
                                  title="Issue next controlled revision (ISO 9001)"
                                >
                                  <RotateCcw className="size-3.5 text-amber-600" />
                                  <span className="hidden xl:inline">Revise</span>
                                </button>

                                {/* 4. Delete SOP Option */}
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmSop(sop)}
                                  className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition-colors cursor-pointer"
                                  title="Delete Master SOP"
                                >
                                  <Trash2 className="size-3.5 text-rose-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARD / GRID VIEW */
              <div className="p-4 bg-slate-50/40">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSops.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400">
                      <ClipboardList className="mx-auto size-9 text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No master SOPs found</p>
                    </div>
                  ) : (
                    filteredSops.map((sop) => {
                      const blast = getSopBlastRadius(state, sop.id);
                      const criticality = sop.criticality || "High";
                      const status = sop.lifecycle_status || "Approved";

                      return (
                        <div
                          key={sop.id}
                          onClick={() => navigate({ to: "/sop-library/$sopId", params: { sopId: sop.id } })}
                          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group"
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                                {sop.code || `SOP-${sop.id.slice(-4)}`}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase",
                                    criticality === "Critical"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : criticality === "High"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-slate-100 text-slate-600"
                                  )}
                                >
                                  {criticality}
                                </span>

                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                    status === "Effective" || status === "Approved"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-700"
                                  )}
                                >
                                  {status}
                                </span>
                              </div>
                            </div>

                            {/* Card Title & Process */}
                            <h3 className="font-display text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                              {sop.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {sop.purpose || sop.description || "Operational standardized construction execution procedure."}
                            </p>

                            {/* Badges & Meta */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-3">
                              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700">
                                <GitBranch className="size-3" />
                                {sop.version_number || "V1.0"}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {sop.category}
                              </span>
                              {(sop.applicable_roles || []).slice(0, 2).map((role: string) => (
                                <span key={role} className="rounded-md bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleOpenBlastRadius(sop);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                            >
                              <Building2 className="size-3" />
                              <span>{blast.totalProjects} Projects</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              {/* Delete option in card view */}
                              <button
                                type="button"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  setDeleteConfirmSop(sop);
                                }}
                                className="size-7 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Master SOP"
                              >
                                <Trash2 className="size-3.5 text-rose-500" />
                              </button>

                              <Link
                                to="/sop-library/$sopId"
                                params={{ sopId: sop.id }}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-primary transition-colors shadow-2xs"
                              >
                                <span>Inspect SOP</span>
                                <ArrowRight className="size-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* LEVEL 3 ALTERNATE: CONSUMING SITES DEPLOYMENT MATRIX */
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Consuming Construction Projects & SOP Utilization
                </h3>
                <p className="text-xs text-slate-500">
                  Projects map and inherit master SOP definitions dynamically without cloning database tables.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.projects.map((proj) => {
                const assignedSops = state.projectSops.filter((ps) => ps.project_id === proj.id);
                const completedCount = assignedSops.filter((ps) => sopProgress(state, ps.id).status === "Completed").length;
                const coveragePercent = assignedSops.length > 0 ? Math.round((completedCount / assignedSops.length) * 100) : 0;

                return (
                  <div key={proj.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-primary" />
                        <h4 className="font-bold text-sm text-slate-900">{proj.name}</h4>
                      </div>
                      <Link
                        to="/projects/$projectId"
                        params={{ projectId: proj.id }}
                        className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Site View <ArrowRight className="size-3" />
                      </Link>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                      <span>Mapped Master SOPs: <strong>{assignedSops.length}</strong></span>
                      <span>Compliance: <strong className="text-emerald-700">{coveragePercent}%</strong></span>
                    </div>

                    <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${coveragePercent}%` }} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {assignedSops.slice(0, 4).map((ps) => {
                        const sopObj = state.sops.find((s) => s.id === ps.sop_id);
                        return (
                          <span key={ps.id} className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-700">
                            {sopObj?.code || "SOP"} ({sopObj?.version_number || "V1.0"})
                          </span>
                        );
                      })}
                      {assignedSops.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-bold self-center">
                          +{assignedSops.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 0: DELETE CONFIRMATION MODAL                        */}
        {/* ========================================================= */}
        {deleteConfirmSop && (
          <Dialog open={!!deleteConfirmSop} onOpenChange={() => setDeleteConfirmSop(null)}>
            <DialogContent className="max-w-md rounded-2xl p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <Trash2 className="size-4" /> Delete Master Standard
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  Delete {deleteConfirmSop.code || deleteConfirmSop.name}?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  This action removes this standard from the master register.
                </DialogDescription>
              </DialogHeader>

              {(() => {
                const blast = getSopBlastRadius(state, deleteConfirmSop.id);
                return (
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
                        This master standard is not mapped to any active projects. It is safe to delete.
                      </div>
                    )}
                  </div>
                );
              })()}

              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmSop(null)}
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

        {/* ========================================================= */}
        {/* MODAL 1: BLAST RADIUS INSPECTOR MODAL                     */}
        {/* ========================================================= */}
        {blastRadiusSop && (
          <Dialog open={!!blastRadiusSop} onOpenChange={() => setBlastRadiusSop(null)}>
            <DialogContent className="max-w-2xl rounded-2xl p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="size-4" /> Operational Blast Radius Inspector
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  {blastRadiusSop.code} - {blastRadiusSop.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Real-time dependency matrix showing all active construction sites consuming this master SOP standard.
                </DialogDescription>
              </DialogHeader>

              {(() => {
                const blast = getSopBlastRadius(state, blastRadiusSop.id);
                return (
                  <div className="space-y-4 my-2">
                    {/* Metrics Grid */}
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

                    {/* Consuming Projects Table */}
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

                    {/* ISO Governance Alert */}
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex gap-2.5">
                      <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900">
                        <strong>ISO 9001 Notice:</strong> Any major procedural change issued to this master standard will automatically propagate version alerts to all {blast.totalProjects} site engineering teams. Historic qualification records remain archived for ISO compliance.
                      </div>
                    </div>
                  </div>
                );
              })()}

              <DialogFooter className="gap-2 sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const target = blastRadiusSop;
                    setBlastRadiusSop(null);
                    handleOpenBatchMapping(target);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Map to More Projects
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = blastRadiusSop.id;
                      setBlastRadiusSop(null);
                      navigate({ to: "/sop-library/$sopId", params: { sopId: id } });
                    }}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer"
                  >
                    View Full SOP Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlastRadiusSop(null)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: BATCH PROJECT MAPPING ENGINE                     */}
        {/* ========================================================= */}
        {batchMappingSop && (
          <Dialog open={!!batchMappingSop} onOpenChange={() => setBatchMappingSop(null)}>
            <DialogContent className="max-w-xl rounded-2xl p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Share2 className="size-4" /> Multi-Project Deployment Engine
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  Map {batchMappingSop.code || batchMappingSop.name} to Active Sites
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
                        (ps) => ps.project_id === proj.id && ps.sop_id === batchMappingSop.id
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
                              <div className="text-[10px] text-slate-400">{proj.location || "Active Construction Site"}</div>
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
                  onClick={() => setBatchMappingSop(null)}
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
        {revisionSop && (
          <Dialog open={!!revisionSop} onOpenChange={() => setRevisionSop(null)}>
            <DialogContent className="max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                  <GitBranch className="size-4" /> ISO 9001 Revision & Propagation Engine
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  Issue Revision for {revisionSop.code || revisionSop.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Current Version: {revisionSop.version_number || "V1.0"} ➔ Next Controlled Version: V
                  {(parseInt(revisionSop.version_number?.replace(/[^\d]/g, "") || "1", 10) || 1) + 1}.0
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
                  <strong>Version Lock Assurance:</strong> Employees previously certified on {revisionSop.version_number || "V1.0"} retain valid historic qualification certificates. Newly scheduled tasks across active projects will automatically transition to the new revision.
                </div>
              </div>

              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setRevisionSop(null)}
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
        {/* MODAL 4: CREATE MASTER SOP BUILDER (4 STEPS)             */}
        {/* ========================================================= */}
        {showCreateModal && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="max-w-3xl rounded-2xl p-6 max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="size-4" /> Enterprise Master SOP Builder
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900 mt-1">
                  Create Master SOP Standard (Step {createStep} of 4)
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Authoritative standard definitions created here are reused across multiple construction sites with central lifecycle control.
                </DialogDescription>
              </DialogHeader>

              {/* Stepper Progress */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 my-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCreateStep(1)}
                  className={cn("flex items-center gap-1.5", createStep === 1 ? "text-primary" : "text-slate-400")}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs">1</span>
                  Metadata
                </button>
                <ChevronRight className="size-4 text-slate-300" />
                <button
                  type="button"
                  onClick={() => setCreateStep(2)}
                  className={cn("flex items-center gap-1.5", createStep === 2 ? "text-primary" : "text-slate-400")}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs">2</span>
                  Applicability
                </button>
                <ChevronRight className="size-4 text-slate-300" />
                <button
                  type="button"
                  onClick={() => setCreateStep(3)}
                  className={cn("flex items-center gap-1.5", createStep === 3 ? "text-primary" : "text-slate-400")}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs">3</span>
                  Operational Specs
                </button>
                <ChevronRight className="size-4 text-slate-300" />
                <button
                  type="button"
                  onClick={() => setCreateStep(4)}
                  className={cn("flex items-center gap-1.5", createStep === 4 ? "text-primary" : "text-slate-400")}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs">4</span>
                  Procedure Steps
                </button>
              </div>

              {/* Step 1: Metadata */}
              {createStep === 1 && (
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">SOP Standard Code *</label>
                      <input
                        type="text"
                        value={formSop.code}
                        onChange={(e) => setFormSop({ ...formSop, code: e.target.value })}
                        placeholder="e.g. SOP-CIV-009"
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Standard Category</label>
                      <select
                        value={formSop.category}
                        onChange={(e) => setFormSop({ ...formSop, category: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white font-medium"
                      >
                        {CATEGORIES.filter((c) => c !== "All SOPs").map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SOP Standard Name *</label>
                    <input
                      type="text"
                      value={formSop.name}
                      onChange={(e) => setFormSop({ ...formSop, name: e.target.value })}
                      placeholder="e.g. Structural Post-Tensioning & Grouting Procedure"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sub-Process</label>
                      <input
                        type="text"
                        value={formSop.process}
                        onChange={(e) => setFormSop({ ...formSop, process: e.target.value })}
                        placeholder="e.g. Pre-Stressed Concrete"
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Department</label>
                      <select
                        value={formSop.department}
                        onChange={(e) => setFormSop({ ...formSop, department: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Criticality</label>
                      <select
                        value={formSop.criticality}
                        onChange={(e) => setFormSop({ ...formSop, criticality: e.target.value as any })}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white font-bold"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Owner / Lead Author</label>
                    <input
                      type="text"
                      value={formSop.owner_name}
                      onChange={(e) => setFormSop({ ...formSop, owner_name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Applicability Matrix */}
              {createStep === 2 && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Applicable Industries:</label>
                    <div className="flex flex-wrap gap-2">
                      {["Commercial Buildings", "Residential High-Rise", "Industrial / Warehousing", "Infrastructure & Bridges", "Precast Plants"].map((ind) => {
                        const active = formSop.applicable_industries.includes(ind);
                        return (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => {
                              if (active) {
                                setFormSop({ ...formSop, applicable_industries: formSop.applicable_industries.filter((i) => i !== ind) });
                              } else {
                                setFormSop({ ...formSop, applicable_industries: [...formSop.applicable_industries, ind] });
                              }
                            }}
                            className={cn(
                              "rounded-xl px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer",
                              active ? "bg-primary text-white border-primary" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {active && "✓ "} {ind}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Job Roles for Training & Execution:</label>
                    <div className="flex flex-wrap gap-2">
                      {["Site Engineer", "QA/QC Inspector", "Safety Officer", "Site Supervisor", "Foreman", "Subcontractor PM"].map((role) => {
                        const active = formSop.applicable_roles.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              if (active) {
                                setFormSop({ ...formSop, applicable_roles: formSop.applicable_roles.filter((r) => r !== role) });
                              } else {
                                setFormSop({ ...formSop, applicable_roles: [...formSop.applicable_roles, role] });
                              }
                            }}
                            className={cn(
                              "rounded-xl px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer",
                              active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {active && "✓ "} {role}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Standard Purpose:</label>
                    <textarea
                      rows={2}
                      value={formSop.purpose}
                      onChange={(e) => setFormSop({ ...formSop, purpose: e.target.value })}
                      placeholder="Establish zero-defect operational protocol to ensure structural integrity..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Operational Scope:</label>
                    <textarea
                      rows={2}
                      value={formSop.scope}
                      onChange={(e) => setFormSop({ ...formSop, scope: e.target.value })}
                      placeholder="Applies to all cast-in-place slabs, columns, and raft foundations across projects..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Operational Specs & Safety */}
              {createStep === 3 && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mandatory Safety & PPE Gear *</label>
                    <input
                      type="text"
                      value={formSop.safety_ppe}
                      onChange={(e) => setFormSop({ ...formSop, safety_ppe: e.target.value })}
                      placeholder="Safety helmet, cut-resistant gloves, eye protection, harness..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Inputs & Prerequisites</label>
                      <textarea
                        rows={2}
                        value={formSop.inputs}
                        onChange={(e) => setFormSop({ ...formSop, inputs: e.target.value })}
                        placeholder="Approved drawings, batch mix calibration..."
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Approved Materials & Consumables</label>
                      <textarea
                        rows={2}
                        value={formSop.materials}
                        onChange={(e) => setFormSop({ ...formSop, materials: e.target.value })}
                        placeholder="Fe550D rebar, cover blocks, curing compound..."
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Expected Output & Quality Acceptance Criteria *</label>
                    <textarea
                      rows={2}
                      value={formSop.expected_output}
                      onChange={(e) => setFormSop({ ...formSop, expected_output: e.target.value })}
                      placeholder="Tolerance within ±5mm, zero honeycombing, cube strength confirmed..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Reference Codes & Standards</label>
                    <input
                      type="text"
                      value={formSop.references}
                      onChange={(e) => setFormSop({ ...formSop, references: e.target.value })}
                      placeholder="IS 456:2000, IS 10262, NBC 2016"
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Procedure Steps */}
              {createStep === 4 && (
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Define Procedural Execution Steps ({formSteps.length} steps):</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormSteps([
                          ...formSteps,
                          {
                            step_number: formSteps.length + 1,
                            title: `Step ${formSteps.length + 1}: Execution & Verification`,
                            instructions: "Conduct field verification and record photographic evidence.",
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                    >
                      <Plus className="size-3.5" /> Add Step
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
                    {formSteps.map((step, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 p-3 bg-slate-50 space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>Step {idx + 1}</span>
                          {formSteps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormSteps(formSteps.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 text-[11px]"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormSteps((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, title: val } : s))
                            );
                          }}
                          placeholder="Step Title (e.g. Rebar Spacing & Cover Block Check)"
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white font-bold"
                        />
                        <textarea
                          rows={2}
                          value={step.instructions}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormSteps((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, instructions: val } : s))
                            );
                          }}
                          placeholder="Detailed procedural instructions and quality verification criteria..."
                          className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:justify-between pt-3 border-t border-slate-200">
                <div>
                  {createStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCreateStep((prev) => (prev - 1) as any)}
                      className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                    >
                      Previous
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  {createStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCreateStep((prev) => (prev + 1) as any)}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateMasterSop}
                      className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs cursor-pointer"
                    >
                      Publish Master Standard
                    </button>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppShell>
  );
}
