import { useState } from "react";
import {
  FileText,
  Upload,
  Paperclip,
  Calendar,
  User,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { actions, PEOPLE, useSiteflow } from "@/lib/siteflow-store";

const COMMON_DOC_SUGGESTIONS = [
  "Third-Party Ultrasonic Rebar Integrity Test Report",
  "Concrete Core Extraction & Lab Strength Test",
  "Geotechnical Soil Bearing Capacity Report",
  "MEP High-Voltage Continuity & Earthing Certificate",
  "Hydrostatic Plumbing Line Pressure Test Log",
  "Waterproofing 48-Hour Ponding Clearance Certificate",
  "Height Safety & Perimeter Anchor Pull Test Log",
  "Structural Working Drawing — Revision Approved",
];

export function AddDocumentModal({
  open,
  onOpenChange,
  projectId,
  sopId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sopId?: string | null;
}) {
  const state = useSiteflow();
  const [docName, setDocName] = useState("");
  const [selectedSopId, setSelectedSopId] = useState<string>(sopId ?? "none");
  const [isRequired, setIsRequired] = useState<boolean>(true);
  const [assigneeMode, setAssigneeMode] = useState<string>(PEOPLE[0] ?? "R. Menon");
  const [customAssignee, setCustomAssignee] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const project = state.projects.find((p) => p.id === projectId);
  const assignedSops = state.projectSops.filter((ps) => ps.project_id === projectId);

  const handleQuickSuggestion = (name: string) => {
    setDocName(name);
    if (!fileName) {
      const slug = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "-")
        .slice(0, 30);
      setFileName(`QA-CERT-${project?.code ?? "SITE"}-${slug}.pdf`);
    }
  };

  const handleMockFileDrop = () => {
    setIsUploading(true);
    setTimeout(() => {
      const code = project?.code ?? "SITE";
      const slug = (docName || "DOC").toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 24);
      setFileName(`QA-DOC-${code}-${slug}-REV01.pdf`);
      setIsUploading(false);
      toast.info("Sample inspection file attached");
    }, 400);
  };

  const handleSetPresetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split("T")[0] ?? "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    const finalAssignee = assigneeMode === "OTHER" ? customAssignee.trim() : assigneeMode;

    actions.addProjectDocument({
      project_id: projectId,
      document_name: docName.trim(),
      required: isRequired,
      sop_id: selectedSopId === "none" ? null : selectedSopId,
      file_name: fileName.trim() || null,
      assigned_to: finalAssignee || null,
      due_date: dueDate || null,
    });

    toast.success("Document added to compliance checklist", {
      description: `Assigned to ${finalAssignee || "Unassigned"} · ${dueDate ? `Due: ${dueDate}` : ""}`,
    });

    // Reset and close
    setDocName("");
    setSelectedSopId("none");
    setIsRequired(true);
    setFileName("");
    setDueDate("");
    setCustomAssignee("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-[#E85D25]">
              <FileText className="size-4.5" />
            </span>
            <div>
              <DialogTitle className="font-display text-lg text-slate-900">
                Add Required / Additional Document
              </DialogTitle>
              <DialogDescription className="text-xs">
                Attach statutory engineering blueprints, inspection certificates, or audit records to {project?.name}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Document Title */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Document Specification Title *
            </label>
            <Input
              placeholder="e.g. Third-Party Concrete Core Compression Test..."
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="text-xs rounded-lg"
              required
            />
          </div>

          {/* Quick Suggestions Chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Suggestions for Construction QA/QC:
            </span>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
              {COMMON_DOC_SUGGESTIONS.map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => handleQuickSuggestion(sugg)}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-orange-50 hover:text-[#E85D25] hover:border-orange-200 border border-slate-200 transition-colors text-left truncate max-w-full"
                >
                  + {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee & Target Completion End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Assigned Reviewer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Assign Reviewer / Lead
              </label>
              <Select value={assigneeMode} onValueChange={setAssigneeMode}>
                <SelectTrigger className="h-9 text-xs rounded-lg bg-white border-slate-200">
                  <SelectValue placeholder="Select team lead" />
                </SelectTrigger>
                <SelectContent>
                  {PEOPLE.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      👤 {p}
                    </SelectItem>
                  ))}
                  <SelectItem value="OTHER" className="text-xs font-semibold text-primary">
                    ➕ Other / Custom Assignee...
                  </SelectItem>
                </SelectContent>
              </Select>

              {assigneeMode === "OTHER" && (
                <input
                  type="text"
                  required
                  placeholder="Enter Name & Company (e.g. T. Sen - Geotech Lead)"
                  value={customAssignee}
                  onChange={(e) => setCustomAssignee(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-900 focus:border-primary focus:outline-hidden"
                />
              )}
            </div>

            {/* Target Completion End Date */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Completion End Date
                </label>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 shadow-xs focus:border-primary focus:outline-hidden"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSetPresetDate(7)}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 hover:bg-slate-200"
                >
                  +7d
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetDate(14)}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 hover:bg-slate-200"
                >
                  +14d
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPresetDate(30)}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 hover:bg-slate-200"
                >
                  +30d
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Requirement Level */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Requirement Gate
              </label>
              <Select
                value={isRequired ? "mandatory" : "optional"}
                onValueChange={(val) => setIsRequired(val === "mandatory")}
              >
                <SelectTrigger className="h-9 text-xs rounded-lg bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mandatory" className="text-xs font-semibold text-rose-700">
                    ● Mandatory Gate
                  </SelectItem>
                  <SelectItem value="optional" className="text-xs text-slate-700">
                    Optional Audit Record
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Link to SOP */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Associated SOP Stage
              </label>
              <Select value={selectedSopId} onValueChange={setSelectedSopId}>
                <SelectTrigger className="h-9 text-xs rounded-lg bg-white border-slate-200">
                  <SelectValue placeholder="Project-Wide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    Project-Wide (General)
                  </SelectItem>
                  {assignedSops.map((ps) => {
                    const sop = state.sops.find((s) => s.id === ps.sop_id);
                    return (
                      <SelectItem key={ps.sop_id} value={ps.sop_id} className="text-xs">
                        {sop?.name ?? "SOP"} ({sop?.department})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Attachment File */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3.5 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
              <Paperclip className="size-4 text-primary" />
              <span>Initial File Attachment (Optional)</span>
            </div>

            {fileName ? (
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 shadow-2xs">
                <span className="rounded bg-rose-100 text-rose-700 text-[10px] font-bold px-1 py-0.2 uppercase">
                  PDF
                </span>
                <span className="truncate max-w-[200px]">{fileName}</span>
                <button
                  type="button"
                  onClick={() => setFileName("")}
                  className="text-slate-400 hover:text-rose-600 ml-1 text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleMockFileDrop}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  <Upload className="size-3.5 text-primary" />
                  {isUploading ? "Uploading..." : "Attach Sample Quality PDF"}
                </button>
                <p className="text-[10px] text-slate-400 mt-1">
                  You can also attach or replace the file later in the checklist.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
            >
              Add to Checklist
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
