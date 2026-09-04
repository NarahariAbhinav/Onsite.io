import { useState, useMemo } from "react";
import {
  FileText,
  CheckCircle2,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  Check,
  Plus,
  AlertCircle,
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
import { actions, PEOPLE, useSiteflow, type DocumentMaster } from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

interface ProjectDocConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProjectId?: string | undefined;
}

export function ProjectDocConfigModal({
  open,
  onOpenChange,
  initialProjectId,
}: ProjectDocConfigModalProps) {
  const state = useSiteflow();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId && initialProjectId !== "All"
      ? initialProjectId
      : state.projects[0]?.id || ""
  );

  const project = state.projects.find((p) => p.id === selectedProjectId);

  // Existing configured masters for this project
  const existingMasterIds = useMemo(() => {
    return new Set(
      state.documents
        .filter((d) => d.project_id === selectedProjectId && d.document_master_id)
        .map((d) => d.document_master_id!)
    );
  }, [state.documents, selectedProjectId]);

  // Selected master IDs to add
  const [selectedMasterIds, setSelectedMasterIds] = useState<string[]>([]);
  const [defaultAssignee, setDefaultAssignee] = useState<string>(
    project?.admin || PEOPLE[0] || "R. Menon"
  );
  const [defaultDueDate, setDefaultDueDate] = useState<string>("2026-08-30");

  // Filter category
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = useMemo(() => {
    const cats = new Set(state.documentMasters.map((m) => m.category || "General"));
    return ["ALL", ...Array.from(cats)];
  }, [state.documentMasters]);

  const filteredMasters = useMemo(() => {
    return state.documentMasters.filter((m) => {
      if (activeCategory !== "ALL" && (m.category || "General") !== activeCategory) {
        return false;
      }
      return true;
    });
  }, [state.documentMasters, activeCategory]);

  const handleToggleMaster = (id: string) => {
    if (existingMasterIds.has(id)) return;
    setSelectedMasterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllMandatory = () => {
    const unmappedMandatory = state.documentMasters
      .filter((m) => m.is_mandatory_default && !existingMasterIds.has(m.id))
      .map((m) => m.id);
    setSelectedMasterIds(Array.from(new Set([...selectedMasterIds, ...unmappedMandatory])));
    toast.info(`Selected all mandatory master documents for ${project?.name || "project"}`);
  };

  const handleApply = () => {
    if (!selectedProjectId) {
      toast.error("Please select a project.");
      return;
    }
    if (selectedMasterIds.length === 0) {
      toast.error("Please select at least one document master requirement to configure.");
      return;
    }

    actions.configureProjectRequirements(
      selectedProjectId,
      selectedMasterIds,
      defaultAssignee,
      defaultDueDate
    );

    toast.success(
      `Configured ${selectedMasterIds.length} document requirements for ${project?.name || "Project"}!`,
      {
        description: `Requirements created in Pending status with target due date ${defaultDueDate}`,
      }
    );

    setSelectedMasterIds([]);
    onOpenChange(false);
  };

  const totalMasters = state.documentMasters.length;
  const configuredCount = existingMasterIds.size;
  const remainingCount = totalMasters - configuredCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-2xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Building2 className="size-4" /> Project Compliance Engine
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 mt-1">
            Configure Project Document Requirements
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Apply standardized Document Masters to define mandatory compliance, quality certifications, and drawing deliverables for this construction site.
          </DialogDescription>
        </DialogHeader>

        {/* Project Selector & Summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 mt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full sm:w-72">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Construction Project:
              </label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="h-9 w-full rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-2xs">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 bg-white text-xs">
                  {state.projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs py-1.5 cursor-pointer font-medium">
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="text-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Configured</div>
                <div className="text-base font-black text-emerald-600">
                  {configuredCount} / {totalMasters}
                </div>
              </div>
              <div className="text-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Available</div>
                <div className="text-base font-black text-slate-800">{remainingCount}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Site Lead / Assignee:</label>
              <Select value={defaultAssignee} onValueChange={setDefaultAssignee}>
                <SelectTrigger className="h-8 rounded-lg border-slate-200 bg-white text-xs">
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 bg-white text-xs">
                  {PEOPLE.map((person) => (
                    <SelectItem key={person} value={person} className="text-xs">
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Compliance Due Date:</label>
              <input
                type="date"
                value={defaultDueDate}
                onChange={(e) => setDefaultDueDate(e.target.value)}
                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Categories & Selection Helpers */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-lg px-2.5 py-1 font-semibold text-xs transition-colors cursor-pointer",
                  activeCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSelectAllMandatory}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            + Select All Mandatory Standards
          </button>
        </div>

        {/* Master Documents Checklist */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredMasters.map((master) => {
            const isAlreadyConfigured = existingMasterIds.has(master.id);
            const isSelected = selectedMasterIds.includes(master.id);

            return (
              <div
                key={master.id}
                onClick={() => !isAlreadyConfigured && handleToggleMaster(master.id)}
                className={cn(
                  "flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer text-xs",
                  isAlreadyConfigured
                    ? "bg-emerald-50/40 border-emerald-200 opacity-80 cursor-default"
                    : isSelected
                    ? "bg-primary/5 border-primary shadow-2xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={isAlreadyConfigured || isSelected}
                      disabled={isAlreadyConfigured}
                      onChange={() => handleToggleMaster(master.id)}
                      className="size-4 rounded text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {master.code}
                      </span>
                      <span className="font-bold text-slate-900">{master.name}</span>
                      {master.is_mandatory_default && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Mandatory
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.2 rounded-full">
                        {master.document_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {master.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>Category: {master.category}</span>
                      {master.requires_expiry && <span>· Requires Expiry Date</span>}
                      {master.requires_approval && <span>· QA Approval Mandatory</span>}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  {isAlreadyConfigured ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-[10px] text-emerald-800">
                      <CheckCircle2 className="size-3" /> Configured
                    </span>
                  ) : isSelected ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary text-white px-2 py-0.5 font-bold text-[10px]">
                      <Check className="size-3" /> Selected
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:justify-between pt-3 border-t border-slate-200 mt-2">
          <div className="text-xs text-slate-500 self-center">
            {selectedMasterIds.length} new requirement{selectedMasterIds.length === 1 ? "" : "s"} selected
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={selectedMasterIds.length === 0}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none shadow-2xs cursor-pointer"
            >
              Apply Requirements to {project?.name ? project.name.split(" ")[0] : "Project"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
