import { useState } from "react";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Check,
  Building2,
  Calendar,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  actions,
  DEPARTMENTS,
  useSiteflow,
  type DocumentMaster,
  type DocumentType,
  type DocumentCategory,
} from "@/lib/siteflow-store";

interface CreateDocMasterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMaster?: DocumentMaster | null;
}

const DOCUMENT_TYPES: DocumentType[] = [
  "Drawing",
  "Specification",
  "Certificate",
  "Quality Report",
  "Commercial",
  "Method Statement",
  "Approval / Permit",
  "Safety / EHS",
];

const CATEGORIES: DocumentCategory[] = [
  "Drawings",
  "Approvals",
  "ITP",
  "MTC",
  "Pour Cards",
  "General",
];

const PROJECT_TYPES = [
  "High-Rise Residential",
  "Commercial EPC",
  "Precast",
  "Villa Plotting",
  "Infrastructure",
];

export function CreateDocMasterModal({
  open,
  onOpenChange,
  editingMaster,
}: CreateDocMasterModalProps) {
  const state = useSiteflow();

  // Generate next code
  const nextCodeNum = state.documentMasters.length + 1;
  const defaultCode = `DOC-${String(nextCodeNum).padStart(3, "0")}`;

  const [code, setCode] = useState(editingMaster?.code || defaultCode);
  const [name, setName] = useState(editingMaster?.name || "");
  const [documentType, setDocumentType] = useState<DocumentType>(
    editingMaster?.document_type || "Quality Report"
  );
  const [category, setCategory] = useState<DocumentCategory>(
    editingMaster?.category || "ITP"
  );
  const [description, setDescription] = useState(editingMaster?.description || "");
  const [isMandatory, setIsMandatory] = useState<boolean>(
    editingMaster?.is_mandatory_default ?? true
  );
  const [department, setDepartment] = useState<string>(
    editingMaster?.applicable_departments?.[0] || "Civil"
  );
  const [projectTypes, setProjectTypes] = useState<string[]>(
    editingMaster?.applicable_project_types || ["High-Rise Residential"]
  );
  const [requiresApproval, setRequiresApproval] = useState<boolean>(
    editingMaster?.requires_approval ?? true
  );
  const [requiresExpiry, setRequiresExpiry] = useState<boolean>(
    editingMaster?.requires_expiry ?? false
  );
  const [requiresRevision, setRequiresRevision] = useState<boolean>(
    editingMaster?.requires_revision ?? true
  );
  const [reviewMonths, setReviewMonths] = useState<number>(
    editingMaster?.review_frequency_months ?? 12
  );

  const toggleProjectType = (pt: string) => {
    setProjectTypes((prev) =>
      prev.includes(pt) ? prev.filter((item) => item !== pt) : [...prev, pt]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      toast.error("Please enter a valid Document Code and Name.");
      return;
    }

    const masterToSave: DocumentMaster = {
      id: editingMaster?.id || `master-doc-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      document_type: documentType,
      category,
      description: description.trim() || `${name.trim()} standard quality deliverable.`,
      is_mandatory_default: isMandatory,
      applicable_industries: ["Commercial", "Residential"],
      applicable_project_types: projectTypes.length > 0 ? projectTypes : ["High-Rise Residential"],
      applicable_departments: [department],
      requires_approval: requiresApproval,
      requires_expiry: requiresExpiry,
      requires_revision: requiresRevision,
      review_frequency_months: reviewMonths,
    };

    actions.saveDocumentMaster(masterToSave);

    toast.success(
      editingMaster
        ? `Document Master ${masterToSave.code} updated.`
        : `New Document Master ${masterToSave.code} registered in central catalog!`
    );

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="size-4" /> Central Governance Engine
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 mt-1">
            {editingMaster ? `Edit Document Master: ${editingMaster.code}` : "Create Standard Document Master"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Define an authoritative standard document type that can be mapped across all organizational construction projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2 text-xs">
          {/* Section 1: Basic Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText className="size-3.5 text-primary" />
              <span>1. Basic Document Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Standard Document Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. DOC-011"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-slate-50/60 font-mono font-bold focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Type *</label>
                <Select value={documentType} onValueChange={(val: any) => setDocumentType(val)}>
                  <SelectTrigger className="h-9 rounded-xl border-slate-300 bg-white text-xs">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-slate-200 bg-white text-xs">
                    {DOCUMENT_TYPES.map((dt) => (
                      <SelectItem key={dt} value={dt} className="text-xs">
                        {dt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Standard Document Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Precast Splicing Joint Inspection Log"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Classification</label>
                <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                  <SelectTrigger className="h-9 rounded-xl border-slate-300 bg-white text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-slate-200 bg-white text-xs">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description & Quality Purpose</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify what this document certifies and what engineering tolerances are checked..."
                className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Section 2: Applicability & Department */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Building2 className="size-3.5 text-indigo-600" />
              <span>2. Applicability & Governance Trade</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Governing Department</label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="h-9 rounded-xl border-slate-300 bg-white text-xs">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-slate-200 bg-white text-xs">
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-xs">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Review Frequency (Months)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={reviewMonths}
                  onChange={(e) => setReviewMonths(parseInt(e.target.value, 10) || 12)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Applicable Project Types:</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {PROJECT_TYPES.map((pt) => {
                  const isSelected = projectTypes.includes(pt);
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => toggleProjectType(pt)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {pt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Regulatory & Quality Controls */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>3. Control Directives & ISO Requirements</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  className="size-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-800">Mandatory by Default</div>
                  <div className="text-[10px] text-slate-500">Auto-required whenever mapped</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                  className="size-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-800">Requires QA Sign-Off</div>
                  <div className="text-[10px] text-slate-500">Must be reviewed by Quality Lead</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={requiresExpiry}
                  onChange={(e) => setRequiresExpiry(e.target.checked)}
                  className="size-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-800">Requires Expiry Date</div>
                  <div className="text-[10px] text-slate-500">Generates 15/30-day renewal alerts</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={requiresRevision}
                  onChange={(e) => setRequiresRevision(e.target.checked)}
                  className="size-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-800">Controlled Versioning</div>
                  <div className="text-[10px] text-slate-500">Enforces R0 ➔ R1 change tracking</div>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 shadow-2xs cursor-pointer"
            >
              {editingMaster ? "Save Changes" : "Register Document Master"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
