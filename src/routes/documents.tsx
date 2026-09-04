import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Upload,
  Eye,
  CheckCircle2,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  Settings2,
  Plus,
  Filter,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  X,
  Trash2,
  FileCheck,
  Check,
  Download,
  AlertOctagon,
  Calendar,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AddDocumentModal } from "@/components/AddDocumentModal";
import { DocPreviewModal } from "@/components/DocPreviewModal";
import { ProjectDocConfigModal } from "@/components/ProjectDocConfigModal";
import { CreateDocMasterModal } from "@/components/CreateDocMasterModal";
import { Input } from "@/components/ui/input";
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
  formatDate,
  useSiteflow,
  type Document,
  type DocumentMaster,
  type DocumentComplianceStatus,
  type DocumentControlStatus,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const state = useSiteflow();

  // Tier 1: Mode Switcher ("project_docs" | "masters")
  const [activeMainTab, setActiveMainTab] = useState<"project_docs" | "masters">("project_docs");

  // View mode switcher ("table" | "card")
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Filters
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stampFilter, setStampFilter] = useState("All");

  // Modals state
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [addDocModalOpen, setAddDocModalOpen] = useState(false);
  const [createMasterModalOpen, setCreateMasterModalOpen] = useState(false);
  const [editingMaster, setEditingMaster] = useState<DocumentMaster | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<Document | null>(null);
  const [deleteConfirmMaster, setDeleteConfirmMaster] = useState<DocumentMaster | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected project object
  const selectedProjectObj = useMemo(() => {
    return projectFilter !== "All" ? state.projects.find((p) => p.id === projectFilter) : null;
  }, [state.projects, projectFilter]);

  // Documents scoped to active project filter (for KPI calculation)
  const scopedDocs = useMemo(() => {
    return state.documents.filter((doc) => {
      if (projectFilter !== "All" && doc.project_id !== projectFilter) return false;
      return true;
    });
  }, [state.documents, projectFilter]);

  // Executive Compliance KPIs
  const now = new Date().getTime();
  const totalRequired = scopedDocs.filter((d) => d.required).length || scopedDocs.length;
  const approvedDocs = scopedDocs.filter((d) => d.status === "Approved");
  const underReviewDocs = scopedDocs.filter(
    (d) => d.status === "Under Review" || d.status === "Submitted"
  );
  const pendingDocs = scopedDocs.filter(
    (d) => d.status === "Pending" || (!d.file_name && d.status !== "Rejected")
  );
  const rejectedDocs = scopedDocs.filter(
    (d) => d.status === "Rejected" || d.status === "Revision Required"
  );

  const expiringDocs = scopedDocs.filter((d) => {
    if (!d.expiry_date) return false;
    const exp = new Date(d.expiry_date).getTime();
    const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return days <= 30;
  });

  const compliancePct =
    totalRequired > 0 ? Math.round((approvedDocs.length / totalRequired) * 100) : 0;

  // Filtered Project Documents
  const filteredDocs = useMemo(() => {
    return scopedDocs.filter((doc) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const nameMatch = doc.document_name.toLowerCase().includes(q);
        const fileMatch = (doc.file_name || "").toLowerCase().includes(q);
        const codeMatch = (doc.document_code || "").toLowerCase().includes(q);
        const typeMatch = (doc.document_type || "").toLowerCase().includes(q);
        const assigneeMatch = (doc.assigned_to || "").toLowerCase().includes(q);
        const sopMatch = doc.sop_id
          ? (state.sops.find((s) => s.id === doc.sop_id)?.name || "").toLowerCase().includes(q)
          : false;

        if (!nameMatch && !fileMatch && !codeMatch && !typeMatch && !assigneeMatch && !sopMatch) {
          return false;
        }
      }

      if (categoryFilter !== "All" && (doc.category || "General") !== categoryFilter) {
        return false;
      }
      if (stampFilter !== "All" && (doc.control_status || "Controlled") !== stampFilter) {
        return false;
      }

      const docStatus: DocumentComplianceStatus =
        doc.status || (doc.file_name ? "Approved" : "Pending");

      if (statusFilter !== "All") {
        if (statusFilter === "Expiring") {
          if (!doc.expiry_date) return false;
          const exp = new Date(doc.expiry_date).getTime();
          const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
          if (days > 30) return false;
        } else if (statusFilter === "Submitted") {
          if (docStatus !== "Submitted" && docStatus !== "Under Review") return false;
        } else if (statusFilter === "Pending") {
          if (docStatus !== "Pending") return false;
        } else if (statusFilter === "Approved") {
          if (docStatus !== "Approved") return false;
        } else if (statusFilter === "Rejected") {
          if (docStatus !== "Rejected" && docStatus !== "Revision Required") return false;
        } else if (statusFilter !== docStatus) {
          return false;
        }
      }

      return true;
    });
  }, [scopedDocs, search, categoryFilter, stampFilter, statusFilter, state.sops, now]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, projectFilter, statusFilter, categoryFilter, stampFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + pageSize);

  const handleOpenPreview = (doc: Document) => {
    setSelectedDoc(doc);
    setPreviewModalOpen(true);
  };

  const handleDeleteDocument = () => {
    if (!deleteConfirmDoc) return;
    actions.deleteProjectDocument(deleteConfirmDoc.id);
    toast.success(`Requirement ${deleteConfirmDoc.document_name} removed.`);
    setDeleteConfirmDoc(null);
  };

  const handleDeleteMaster = () => {
    if (!deleteConfirmMaster) return;
    actions.deleteDocumentMaster(deleteConfirmMaster.id);
    toast.success(`Standard Document Master ${deleteConfirmMaster.code} deleted.`);
    setDeleteConfirmMaster(null);
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-16">
        {/* ========================================================= */}
        {/* HEADER & GLOBAL ACTION BUTTONS                            */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-100 p-1 text-indigo-700">
                <ShieldCheck className="size-4" />
              </span>
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                ISO 9001:2015 Clause 7.5 Controlled Quality Records
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-slate-900">
              Document Governance & Project Compliance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Authoritative document repository tracking requirements, evidence submission, QA reviews, and controlled site deliverables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setConfigModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 shadow-2xs transition-colors cursor-pointer"
              title="Map and configure standard document requirements for a project"
            >
              <Settings2 className="size-4 text-indigo-600" />
              <span>Configure Requirements</span>
            </button>

            {activeMainTab === "masters" ? (
              <button
                type="button"
                onClick={() => {
                  setEditingMaster(null);
                  setCreateMasterModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Plus className="size-4" /> Create Document Master
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAddDocModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Plus className="size-4" /> Add Requirement / Upload
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* EXECUTIVE COMPLIANCE KPI SCORECARD                        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {/* Required */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Required</span>
              <FileText className="size-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{totalRequired}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Configured deliverables</p>
          </div>

          {/* Submitted / Under Review */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Submitted</span>
              <Upload className="size-4 text-indigo-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-indigo-700">
              {underReviewDocs.length}
            </div>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">In QA review pipeline</p>
          </div>

          {/* Approved & Controlled */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700">{approvedDocs.length}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Controlled site copies</p>
          </div>

          {/* Pending Submission */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
              <Clock className="size-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-600">{pendingDocs.length}</div>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Awaiting evidence</p>
          </div>

          {/* Expiring Soon / Expired */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expiring</span>
              <AlertTriangle className="size-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-rose-600">{expiringDocs.length}</div>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">&lt;= 30 days renewal</p>
          </div>

          {/* Compliance Index % */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Compliance</span>
              <ShieldCheck className="size-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-700">{compliancePct}%</div>
            <div className="mt-1.5 h-1.5 w-full bg-emerald-200/70 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${compliancePct}%` }} />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TIER 1 & TIER 2: SUB-NAVIGATION & FILTERS                 */}
        {/* ========================================================= */}
        <div className="space-y-3">
          {/* Tier 1: Sub-Navigation View Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveMainTab("project_docs")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer",
                  activeMainTab === "project_docs"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <ShieldCheck className="size-3.5 text-primary" />
                <span>Project Document Register ({state.documents.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab("masters")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer",
                  activeMainTab === "masters"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <BookOpen className="size-3.5 text-indigo-600" />
                <span>Document Masters Catalog ({state.documentMasters.length})</span>
              </button>
            </div>

            {/* Project Quick Selector (when on project_docs tab) */}
            {activeMainTab === "project_docs" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Active Site:</span>
                <div className="w-[190px]">
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="h-8.5 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-2xs">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-200 bg-white text-xs">
                      <SelectItem value="All" className="text-xs font-bold">All Projects (Overview)</SelectItem>
                      {state.projects.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name} ({p.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Tier 2: Search, Quick Status Pills & Category Dropdowns */}
          {activeMainTab === "project_docs" && (
            <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search */}
                <div className="relative min-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search documents by name, code, type, project, or related SOP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none transition-colors"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="w-[145px]">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-200 bg-white text-xs">
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Drawings">Drawings</SelectItem>
                      <SelectItem value="Approvals">Approvals</SelectItem>
                      <SelectItem value="ITP">ITP Checklist</SelectItem>
                      <SelectItem value="Pour Cards">Pour Cards</SelectItem>
                      <SelectItem value="MTC">MTC Certificates</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stamp Dropdown */}
                <div className="w-[145px]">
                  <Select value={stampFilter} onValueChange={setStampFilter}>
                    <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs">
                      <SelectValue placeholder="All Stamps" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-200 bg-white text-xs">
                      <SelectItem value="All">All Stamps</SelectItem>
                      <SelectItem value="Controlled">Controlled Copy</SelectItem>
                      <SelectItem value="Reference Only">Reference Only</SelectItem>
                      <SelectItem value="Draft">Draft / Preliminary</SelectItem>
                      <SelectItem value="Obsolete">Obsolete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer",
                      viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
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
                      "flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer",
                      viewMode === "card" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    )}
                    title="Card View"
                  >
                    <LayoutGrid className="size-3.5" />
                    <span>Cards</span>
                  </button>
                </div>
              </div>

              {/* Quick Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
                {[
                  { id: "All", label: `All (${scopedDocs.length})` },
                  { id: "Pending", label: `Pending (${pendingDocs.length})` },
                  { id: "Submitted", label: `Under Review (${underReviewDocs.length})` },
                  { id: "Approved", label: `Approved (${approvedDocs.length})` },
                  { id: "Rejected", label: `Rejected (${rejectedDocs.length})` },
                  { id: "Expiring", label: `Expiring Soon (${expiringDocs.length})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={cn(
                      "rounded-lg px-3 py-1 font-semibold transition-all shrink-0 cursor-pointer text-xs",
                      statusFilter === st.id
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CONTENT AREA: PROJECT DOCUMENTS REGISTER                 */}
        {/* ========================================================= */}
        {activeMainTab === "project_docs" ? (
          <div>
            {filteredDocs.length > 0 ? (
              viewMode === "table" ? (
                /* TABLE VIEW */
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4 w-[280px]">Document Deliverable</th>
                          <th className="py-3 px-3 whitespace-nowrap">Type & Category</th>
                          <th className="py-3 px-3 whitespace-nowrap">Project Site</th>
                          <th className="py-3 px-3 whitespace-nowrap">Version & Stamp</th>
                          <th className="py-3 px-3 whitespace-nowrap">Due / Expiry Date</th>
                          <th className="py-3 px-3 whitespace-nowrap">Compliance Status</th>
                          <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedDocs.map((doc) => {
                          const project = state.projects.find((p) => p.id === doc.project_id);
                          const sop = doc.sop_id ? state.sops.find((s) => s.id === doc.sop_id) : null;
                          const docStatus: DocumentComplianceStatus =
                            doc.status || (doc.file_name ? "Approved" : "Pending");
                          const controlStatus = doc.control_status || "Controlled";

                          // Expiry calculation
                          const expTime = doc.expiry_date ? new Date(doc.expiry_date).getTime() : null;
                          const daysLeft = expTime ? Math.ceil((expTime - now) / (1000 * 60 * 60 * 24)) : null;

                          return (
                            <tr
                              key={doc.id}
                              onClick={() => handleOpenPreview(doc)}
                              className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                            >
                              {/* Name & Code */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <FileText className="size-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1 py-0.2 rounded">
                                        {doc.document_code || `DOC-${doc.id.slice(-4)}`}
                                      </span>
                                      {doc.required && (
                                        <span className="text-[9px] font-bold uppercase text-rose-600">
                                          Mandatory
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-bold text-slate-900 truncate">
                                      {doc.document_name}
                                    </div>
                                    {sop && (
                                      <div className="text-[10px] text-slate-400 truncate">
                                        SOP: {sop.name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Type & Category */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-semibold text-slate-800">{doc.document_type || "Quality Record"}</div>
                                <div className="text-[10px] text-slate-400">{doc.category || "General"}</div>
                              </td>

                              {/* Project */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="font-bold text-slate-800">{project?.name || "All Projects"}</div>
                                <div className="text-[10px] text-slate-400">Lead: {doc.assigned_to || project?.admin || "Lead"}</div>
                              </td>

                              {/* Version & Stamp */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                                    {doc.revision || "R0"}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-600">
                                    {controlStatus}
                                  </span>
                                </div>
                              </td>

                              {/* Due / Expiry Date */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="text-[11px] text-slate-700">Due: {formatDate(doc.due_date || "2026-08-30")}</div>
                                {doc.expiry_date ? (
                                  <div className="mt-0.5">
                                    {daysLeft !== null && daysLeft <= 0 ? (
                                      <span className="text-[10px] font-bold text-rose-600">⚠️ Expired</span>
                                    ) : daysLeft !== null && daysLeft <= 30 ? (
                                      <span className="text-[10px] font-bold text-amber-600">
                                        ⚠️ Expires in {daysLeft}d
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Exp: {formatDate(doc.expiry_date)}</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-400">No Expiry</div>
                                )}
                              </td>

                              {/* Compliance Status */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                                    docStatus === "Approved"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : docStatus === "Under Review" || docStatus === "Submitted"
                                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                      : docStatus === "Pending"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : docStatus === "Rejected"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : "bg-slate-100 text-slate-700"
                                  )}
                                >
                                  {docStatus === "Approved" && <CheckCircle2 className="size-3" />}
                                  {docStatus === "Pending" && <Clock className="size-3" />}
                                  {docStatus === "Rejected" && <AlertTriangle className="size-3" />}
                                  {docStatus}
                                </span>
                              </td>

                              {/* Actions */}
                              <td
                                className="py-3 px-4 text-right whitespace-nowrap"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPreview(doc)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <Eye className="size-3.5 text-primary" />
                                    <span>View</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmDoc(doc)}
                                    className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition-colors cursor-pointer"
                                    title="Delete Requirement"
                                  >
                                    <Trash2 className="size-3.5 text-rose-500" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination */}
                  <div className="flex flex-wrap items-center justify-between border-t border-slate-200 bg-slate-50/75 px-4 py-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>Showing {startIndex + 1} to {Math.min(filteredDocs.length, startIndex + pageSize)} of {filteredDocs.length} items</span>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium"
                      >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="size-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                      >
                        <ChevronsLeft className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="size-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                      >
                        <ChevronLeft className="size-3.5" />
                      </button>
                      <span className="px-2 font-bold">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="size-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                      >
                        <ChevronRight className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="size-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                      >
                        <ChevronsRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* CARD / GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedDocs.map((doc) => {
                    const project = state.projects.find((p) => p.id === doc.project_id);
                    const docStatus = doc.status || (doc.file_name ? "Approved" : "Pending");

                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleOpenPreview(doc)}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                              {doc.document_code || `DOC-${doc.id.slice(-4)}`}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                docStatus === "Approved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : docStatus === "Pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-indigo-50 text-indigo-700"
                              )}
                            >
                              {docStatus}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{doc.document_name}</h3>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Type: {doc.document_type || "Quality Record"} · {doc.category}
                          </p>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Site: <strong>{project?.name ? project.name.split(" ")[0] : "Site"}</strong></span>
                            <span className="font-mono text-indigo-700 font-bold">{doc.revision || "R0"}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            Due: {formatDate(doc.due_date || "2026-08-30")}
                          </span>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(doc)}
                              className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-primary transition-colors"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
                <FileCheck className="size-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-display text-base font-bold text-slate-900">No Document Deliverables Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  No documents match your current filter criteria. Click "Configure Requirements" to inherit standard documents for this project.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfigModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 shadow-2xs cursor-pointer"
                  >
                    <Settings2 className="size-4" /> Configure Requirements
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* DOCUMENT MASTERS CATALOG TAB                             */
          /* ========================================================= */
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/75 px-4 py-3 gap-3">
              <div>
                <span className="font-bold text-sm text-slate-900 block">
                  Central Document Master Catalog
                </span>
                <span className="text-xs text-slate-500">
                  Standardized definitions of drawings, test certificates, and compliance reports reused across all enterprise projects.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingMaster(null);
                  setCreateMasterModalOpen(true);
                }}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-primary/90 cursor-pointer"
              >
                <Plus className="size-3.5" /> Create Document Master
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-[110px]">Code</th>
                    <th className="py-3 px-3">Standard Document Name & Purpose</th>
                    <th className="py-3 px-3 whitespace-nowrap">Document Type</th>
                    <th className="py-3 px-3 whitespace-nowrap">Category</th>
                    <th className="py-3 px-3 whitespace-nowrap">Mandatory Default</th>
                    <th className="py-3 px-3 whitespace-nowrap">Controls</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.documentMasters.map((master) => {
                    const usageCount = state.documents.filter(
                      (d) => d.document_master_id === master.id
                    ).length;

                    return (
                      <tr key={master.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          {master.code}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{master.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{master.description}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {master.document_type}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                          {master.category}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {master.is_mandatory_default ? (
                            <span className="rounded bg-rose-50 text-rose-700 font-bold text-[10px] px-2 py-0.5 border border-rose-200">
                              Mandatory
                            </span>
                          ) : (
                            <span className="rounded bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5">
                              Optional
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-[10px] text-slate-500 space-y-0.5">
                          {master.requires_approval && <div>· QA Approval Required</div>}
                          {master.requires_expiry && <div>· Expiry Tracking Active</div>}
                          <div>· Used in {usageCount} Site Requirements</div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMaster(master);
                                setCreateMasterModalOpen(true);
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmMaster(master)}
                              className="size-7 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600 shadow-2xs"
                              title="Delete Master"
                            >
                              <Trash2 className="size-3.5 text-rose-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: PREVIEW / INSPECTOR MODAL                        */}
        {/* ========================================================= */}
        <DocPreviewModal
          open={previewModalOpen}
          onOpenChange={setPreviewModalOpen}
          document={selectedDoc}
        />

        {/* ========================================================= */}
        {/* MODAL 2: CONFIGURE PROJECT REQUIREMENTS                   */}
        {/* ========================================================= */}
        <ProjectDocConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          initialProjectId={projectFilter !== "All" ? projectFilter : undefined}
        />

        {/* ========================================================= */}
        {/* MODAL 3: ADD DOCUMENT REQUIREMENT                         */}
        {/* ========================================================= */}
        <AddDocumentModal
          open={addDocModalOpen}
          onOpenChange={setAddDocModalOpen}
          projectId={projectFilter !== "All" ? projectFilter : (state.projects[0]?.id ?? "")}
        />

        {/* ========================================================= */}
        {/* MODAL 4: CREATE DOCUMENT MASTER                           */}
        {/* ========================================================= */}
        <CreateDocMasterModal
          open={createMasterModalOpen}
          onOpenChange={setCreateMasterModalOpen}
          editingMaster={editingMaster}
        />

        {/* ========================================================= */}
        {/* MODAL 5: DELETE CONFIRMATION MODALS                       */}
        {/* ========================================================= */}
        {deleteConfirmDoc && (
          <Dialog open={!!deleteConfirmDoc} onOpenChange={() => setDeleteConfirmDoc(null)}>
            <DialogContent className="max-w-md rounded-2xl p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <Trash2 className="size-4" /> Delete Document Requirement
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  Remove {deleteConfirmDoc.document_name}?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  This will remove this compliance requirement from the project register.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmDoc(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDocument}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-2xs cursor-pointer"
                >
                  Confirm Delete
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {deleteConfirmMaster && (
          <Dialog open={!!deleteConfirmMaster} onOpenChange={() => setDeleteConfirmMaster(null)}>
            <DialogContent className="max-w-md rounded-2xl p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <Trash2 className="size-4" /> Delete Master Document
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                  Delete Standard {deleteConfirmMaster.code}?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  This will delete the standard definition from the organizational catalog. Existing project deliverables created from this standard remain intact.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmMaster(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMaster}
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
