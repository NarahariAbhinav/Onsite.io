import { useState } from "react";
import {
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Printer,
  History,
  Stamp,
  RotateCcw,
  Sparkles,
  X,
  AlertOctagon,
  Building2,
  Paperclip,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
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
  CURRENT_USER,
  PEOPLE,
  useSiteflow,
  type Document,
  type DocumentControlStatus,
  type DocumentComplianceStatus,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

interface DocPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export function DocPreviewModal({
  open,
  onOpenChange,
  document,
}: DocPreviewModalProps) {
  const state = useSiteflow();

  // Tab state
  const [activeTab, setActiveTab] = useState<
    "info" | "submission" | "review" | "versions" | "activity"
  >("info");

  // Form states for submission / upload
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  // Review states
  const [reviewComments, setReviewComments] = useState("");
  const [reviewAction, setReviewAction] = useState<"Approved" | "Rejected" | "Revision Required">("Approved");

  // Revision state
  const [newRevisionCode, setNewRevisionCode] = useState("R2");
  const [revisionSummary, setRevisionSummary] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  if (!document) return null;

  const project = state.projects.find((p) => p.id === document.project_id);
  const sop = document.sop_id ? state.sops.find((s) => s.id === document.sop_id) : null;
  const master = document.document_master_id
    ? state.documentMasters.find((m) => m.id === document.document_master_id)
    : null;

  const status: DocumentComplianceStatus =
    document.status || (document.file_name ? "Approved" : "Pending");
  const controlStatus = document.control_status || (status === "Approved" ? "Controlled" : "Draft");

  const watermarkText =
    document.watermark_text ||
    (controlStatus === "Controlled"
      ? "CONTROLLED COPY — ISSUED FOR CONSTRUCTION"
      : controlStatus === "Reference Only"
      ? "FOR INFORMATION ONLY — UNCONTROLLED WHEN PRINTED"
      : controlStatus === "Obsolete"
      ? "SUPERSEDED / OBSOLETE — DO NOT USE ON SITE"
      : "PRELIMINARY / DRAFT — NOT FOR SITE EXECUTION");

  // Check expiry
  const now = new Date().getTime();
  const expiryTime = document.expiry_date ? new Date(document.expiry_date).getTime() : null;
  const daysToExpiry = expiryTime ? Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24)) : null;
  const isExpired = daysToExpiry !== null && daysToExpiry <= 0;
  const isExpiringSoon = daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= 30;

  // Simulate file drag-drop
  const handleSimulateFileSelect = () => {
    setIsSimulatingUpload(true);
    setTimeout(() => {
      const code = project?.code || "SITE";
      const slug = (document.document_name || "DOC").toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 24);
      setUploadFileName(`QA-DOC-${code}-${slug}-${document.revision || "R0"}.pdf`);
      setIsSimulatingUpload(false);
      toast.info("Sample inspection file attached");
    }, 300);
  };

  // Submit Evidence
  const handleSubmitEvidence = () => {
    if (!uploadFileName.trim()) {
      toast.error("Please attach a file before submitting.");
      return;
    }

    actions.submitDocumentEvidence(
      document.id,
      uploadFileName.trim(),
      2450000,
      CURRENT_USER.name,
      uploadNotes.trim() || "Uploaded digital quality evidence for verification.",
      uploadExpiry || document.expiry_date || undefined
    );

    toast.success(`Document submitted for Quality review!`, {
      description: `File: ${uploadFileName}`,
    });

    setUploadFileName("");
    setUploadNotes("");
    setActiveTab("review");
  };

  // Execute Review
  const handleExecuteReview = (action: "Approved" | "Rejected" | "Revision Required") => {
    if (!reviewComments.trim()) {
      toast.error("Please provide mandatory review / verification comments.");
      return;
    }

    actions.reviewProjectDocument(
      document.id,
      action,
      CURRENT_USER.name,
      reviewComments.trim()
    );

    toast.success(`Document marked as ${action}!`, {
      description: action === "Approved"
        ? "Controlled copy stamp issued for site execution."
        : `Comments logged in audit trail.`,
    });

    setReviewComments("");
  };

  // Submit Revision
  const handlePublishRevision = () => {
    if (!revisionSummary.trim()) {
      toast.error("Please enter a mandatory revision change summary.");
      return;
    }

    actions.reviseProjectDocument(
      document.id,
      newRevisionCode.trim().toUpperCase(),
      revisionSummary.trim(),
      `REV-${newRevisionCode}-${document.file_name || "document.pdf"}`,
      CURRENT_USER.name
    );

    toast.success(`Revision ${newRevisionCode} published and queued for review!`);
    setShowRevisionForm(false);
    setRevisionSummary("");
    setActiveTab("versions");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-2xl max-h-[92vh] overflow-y-auto p-6">
        {/* Modal Header */}
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
                {document.document_code || `DOC-${document.id.slice(-4)}`}
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {document.document_type || "Quality Record"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                {document.revision || "R0"}
              </span>
              {/* Compliance Status Badge */}
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1",
                  status === "Approved"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : status === "Under Review" || status === "Submitted"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : status === "Pending"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : status === "Rejected"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-slate-100 text-slate-700"
                )}
              >
                {status === "Approved" && <CheckCircle2 className="size-3" />}
                {status === "Pending" && <Clock className="size-3" />}
                {status === "Rejected" && <AlertTriangle className="size-3" />}
                {status}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer"
                title="Print Document Sheet"
              >
                <Printer className="size-3 text-slate-500" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-slate-900 mt-2">
            {document.document_name}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 flex items-center gap-2">
            <Building2 className="size-3.5 text-indigo-600 inline" />
            <span>Project: <strong>{project?.name || "All Projects"}</strong></span>
            {sop && (
              <>
                <span>·</span>
                <span>Governing SOP: <strong>{sop.name} ({sop.version_number || "V1.0"})</strong></span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Expiry Alert Banner if applicable */}
        {isExpired && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-center gap-2.5 text-xs text-rose-800">
            <AlertOctagon className="size-4 text-rose-600 shrink-0" />
            <div>
              <strong>DOCUMENT EXPIRED!</strong> This statutory certificate or test log expired on {formatDate(document.expiry_date!)}. Renew immediately.
            </div>
          </div>
        )}
        {isExpiringSoon && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <div>
              <strong>EXPIRING SOON:</strong> This compliance document expires in <strong>{daysToExpiry} days</strong> ({formatDate(document.expiry_date!)}). Prepare renewal submission.
            </div>
          </div>
        )}

        {/* 5-Tab Multidisciplinary Navigation */}
        <div className="flex items-center border-b border-slate-200 mt-2 gap-1 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={cn(
              "px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap",
              activeTab === "info"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Document Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("submission")}
            className={cn(
              "px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeTab === "submission"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <span>File Evidence</span>
            {document.file_name ? (
              <span className="size-1.5 rounded-full bg-emerald-500" />
            ) : (
              <span className="size-1.5 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("review")}
            className={cn(
              "px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeTab === "review"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <span>Review & Verification</span>
            {status === "Under Review" && (
              <span className="rounded-full bg-indigo-100 text-indigo-700 text-[10px] px-1.5">Action</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("versions")}
            className={cn(
              "px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap",
              activeTab === "versions"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Version Control ({1 + (document.revision_history?.length || 0)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={cn(
              "px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap",
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Audit Trail ({document.activity_log?.length || 0})
          </button>
        </div>

        {/* TAB 1: DOCUMENT INFORMATION */}
        {activeTab === "info" && (
          <div className="space-y-4 my-2 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
                <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                  Metadata & Classification
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Document ID:</span>
                    <span className="font-mono font-bold text-slate-800">{document.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Document Code:</span>
                    <span className="font-mono font-bold text-primary">{document.document_code || "DOC-REF"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Document Type:</span>
                    <span className="font-semibold text-slate-800">{document.document_type || "Quality Record"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Category:</span>
                    <span className="font-semibold text-slate-800">{document.category || "General"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Compliance Status:</span>
                    <span className="font-bold text-slate-800">{status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Mandatory Requirement:</span>
                    <span className="font-bold text-slate-800">{document.required ? "Yes (Mandatory)" : "Optional"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
                <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                  Governance & Ownership
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Project Site:</span>
                    <span className="font-bold text-slate-800">{project?.name || "Active Site"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Assigned Lead:</span>
                    <span className="font-semibold text-slate-800">{document.assigned_to || project?.admin || "Site Lead"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Target Due Date:</span>
                    <span className="font-mono text-slate-800">{formatDate(document.due_date || "2026-08-30")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Expiry Date:</span>
                    <span className={cn("font-mono font-bold", isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-slate-800")}>
                      {document.expiry_date ? formatDate(document.expiry_date) : "N/A (No Expiry)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Assigned Reviewer:</span>
                    <span className="font-semibold text-slate-800">{document.assigned_reviewer || "Quality Manager"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Current Version:</span>
                    <span className="font-mono font-bold text-indigo-700">{document.revision || "R0"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Master Definition reference if linked */}
            {master && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Linked to Master Standard: {master.code} — {master.name}</span>
                </div>
                <p className="text-[11px] text-slate-600">{master.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                  <span>Review Cadence: Every {master.review_frequency_months || 12} Months</span>
                  <span>·</span>
                  <span>ISO Controls: {master.requires_approval ? "QA Approval Required" : "Self-Certified"}</span>
                </div>
              </div>
            )}

            {/* Controlled Watermark Stamp Preview */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Active Controlled Watermark Stamp:</span>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center">
                <span className="font-mono text-xs font-black tracking-wider text-slate-700 uppercase">
                  [{watermarkText}]
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Applied digitally on all downloaded, exported, and printed engineering copies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FILE EVIDENCE & SUBMISSION */}
        {activeTab === "submission" && (
          <div className="space-y-4 my-2 text-xs">
            {document.file_name ? (
              /* Already has an uploaded file */
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{document.file_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Submitted by: <strong>{document.uploaded_by || "Site Engineer"}</strong></span>
                        <span>·</span>
                        <span>Date: {formatDate(document.submission_date || document.uploaded_at || "2026-05-12")}</span>
                        <span>·</span>
                        <span>Size: ~2.4 MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toast.success(`Downloaded ${document.file_name}`)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="size-3.5" /> Download
                    </button>
                  </div>
                </div>

                {/* Simulated Viewer Preview */}
                <div className="relative rounded-xl border border-slate-200 bg-slate-100 p-8 text-center overflow-hidden min-h-[160px] flex flex-col items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10">
                    <span className="font-black text-2xl tracking-widest uppercase rotate-[-20deg]">
                      {watermarkText}
                    </span>
                  </div>
                  <FileText className="size-10 text-slate-400 mb-2" />
                  <p className="font-bold text-slate-700 text-xs">
                    {document.document_name} — Digital Controlled Copy
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Verified against {project?.name || "Project"} work register. Revision: {document.revision || "R0"}
                  </p>
                </div>
              </div>
            ) : (
              /* No file uploaded yet: Pending submission form */
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                <div className="border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-xs block">
                    Submit Evidence for Requirement: {document.document_name}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Attach lab test certificates, signed pour cards, or PDF drawings to clear this pending compliance item.
                  </p>
                </div>

                {/* Drag-and-drop simulated file box */}
                <div
                  onClick={handleSimulateFileSelect}
                  className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center hover:bg-slate-100 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Upload className="size-8 text-slate-400 mx-auto mb-2" />
                  <div className="font-bold text-slate-800 text-xs">
                    {uploadFileName ? uploadFileName : "Click or Drag & Drop Document Evidence File"}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports PDF, DOCX, DWG, XLSX, JPG (up to 25 MB). Watermark applied automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Document Expiry Date (if applicable):</label>
                    <input
                      type="date"
                      value={uploadExpiry}
                      onChange={(e) => setUploadExpiry(e.target.value)}
                      className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Submission Notes:</label>
                    <input
                      type="text"
                      placeholder="e.g. Approved by PMC consultant on 12-May..."
                      value={uploadNotes}
                      onChange={(e) => setUploadNotes(e.target.value)}
                      className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSubmitEvidence}
                    disabled={!uploadFileName}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none shadow-2xs cursor-pointer"
                  >
                    Submit for Quality Review
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUALITY REVIEW & VERIFICATION */}
        {activeTab === "review" && (
          <div className="space-y-4 my-2 text-xs">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Quality Lead Verification & Review
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Review submitted evidence against ISO 9001:2015 Clause 7.5 and site technical specifications.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Reviewer: {document.assigned_reviewer || "Quality Manager"}
                </span>
              </div>

              {/* Status outcome display */}
              {status === "Approved" ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Approved & Issued as Controlled Copy</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 space-y-1">
                    <div>Reviewed By: <strong>{document.reviewed_by || "Quality Manager"}</strong> on {formatDate(document.reviewed_at || "2026-05-14")}</div>
                    {document.review_notes && (
                      <div className="italic">"{document.review_notes}"</div>
                    )}
                  </div>
                </div>
              ) : status === "Rejected" ? (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertTriangle className="size-4 text-rose-600" />
                    <span>Non-Conforming / Rejected</span>
                  </div>
                  <div className="text-[11px] text-rose-800">
                    <div>Rejected By: <strong>{document.reviewed_by || "Quality Manager"}</strong></div>
                    {document.review_notes && <div className="italic mt-1">"{document.review_notes}"</div>}
                  </div>
                </div>
              ) : null}

              {/* Quality Review Actions Form */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Reviewer Verification Comments (Mandatory for QA Sign-Off):
                  </label>
                  <textarea
                    rows={2}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Enter compliance observations, tolerance verifications, or revision directives..."
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleExecuteReview("Revision Required")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="size-3.5 text-amber-600" /> Request Revision
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExecuteReview("Rejected")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 cursor-pointer transition-colors"
                  >
                    <X className="size-3.5 text-rose-600" /> Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExecuteReview("Approved")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="size-3.5" /> Approve & Issue Controlled Stamp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VERSION CONTROL */}
        {activeTab === "versions" && (
          <div className="space-y-4 my-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                Controlled Revision History & Superseded Records:
              </span>
              <button
                type="button"
                onClick={() => setShowRevisionForm(!showRevisionForm)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-slate-800 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="size-3 text-amber-400" />
                <span>Issue Next Revision</span>
              </button>
            </div>

            {/* New Revision Form Modal / Accordion */}
            {showRevisionForm && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 space-y-3">
                <span className="font-bold text-indigo-900 block text-xs">
                  Publish New Controlled Revision
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">New Revision Code:</label>
                    <input
                      type="text"
                      value={newRevisionCode}
                      onChange={(e) => setNewRevisionCode(e.target.value)}
                      placeholder="e.g. R2 or Rev 02"
                      className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mandatory Change Summary:</label>
                    <input
                      type="text"
                      value={revisionSummary}
                      onChange={(e) => setRevisionSummary(e.target.value)}
                      placeholder="e.g. Updated reinforcement schedules per structural consultant query..."
                      className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRevisionForm(false)}
                    className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishRevision}
                    className="rounded-lg bg-primary px-3.5 py-1 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer shadow-2xs"
                  >
                    Publish Revision
                  </button>
                </div>
              </div>
            )}

            {/* Revisions Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="divide-y divide-slate-100 text-xs">
                {/* Current Revision */}
                <div className="p-3 bg-indigo-50/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                        {document.revision || "R0"}
                      </span>
                      <span className="font-bold text-slate-800">Current Controlled Baseline</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      File: {document.file_name || "Evidence pending"} · Updated by {document.uploaded_by || CURRENT_USER.name}
                    </div>
                  </div>
                </div>

                {/* Historic Superseded Revisions */}
                {(document.revision_history || []).map((rev, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between opacity-80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {rev.revision}
                        </span>
                        <span className="font-semibold text-slate-700">Superseded Historical Version</span>
                        <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] px-2 py-0.2">
                          Archived
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Change: "{rev.change_summary}" · Revised by {rev.revised_by} on {formatDate(rev.revised_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL & ACTIVITY */}
        {activeTab === "activity" && (
          <div className="space-y-3 my-2 text-xs">
            <span className="font-bold text-slate-900 block">
              Immutable ISO 9001 Regulatory Activity Log:
            </span>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(document.activity_log || []).length === 0 ? (
                <div className="p-4 text-center text-slate-400 rounded-xl border border-slate-200 bg-slate-50">
                  No activity entries recorded yet.
                </div>
              ) : (
                (document.activity_log || []).map((act, idx) => (
                  <div
                    key={act.id || idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3 shadow-2xs"
                  >
                    <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{act.action}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {formatDate(act.timestamp)}
                        </span>
                      </div>
                      {act.notes && (
                        <p className="text-[11px] text-slate-600 mt-0.5">{act.notes}</p>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1">
                        Triggered by: <strong>{act.user}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
