import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { actions, PEOPLE, useSiteflow, type Sop } from "@/lib/siteflow-store";

interface AddProjectSopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const AVAILABLE_ROLES = [
  "Site Engineer",
  "Quality Inspector",
  "Safety Officer",
  "Site Supervisor",
  "Subcontractor Foreman",
  "Project Manager",
  "Surveyor",
];

export function AddProjectSopModal({
  open,
  onOpenChange,
  projectId,
}: AddProjectSopModalProps) {
  const state = useSiteflow();
  const project = state.projects.find((p) => p.id === projectId);
  const alreadyAssignedSopIds = new Set(
    state.projectSops.filter((ps) => ps.project_id === projectId).map((ps) => ps.sop_id),
  );

  // Available master SOPs not yet assigned
  const availableSops = state.sops.filter((s) => !alreadyAssignedSopIds.has(s.id));

  const [search, setSearch] = useState("");
  const [selectedSopId, setSelectedSopId] = useState<string>("");
  const [leadAssignee, setLeadAssignee] = useState<string>(project?.admin || PEOPLE[0] || "R. Menon");
  const [dueDate, setDueDate] = useState<string>("2026-10-31");
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [applicableActivity, setApplicableActivity] = useState<string>("");
  const [isMandatory, setIsMandatory] = useState<boolean>(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    "Site Engineer",
    "Site Supervisor",
  ]);
  const [assessmentRequired, setAssessmentRequired] = useState<boolean>(true);
  const [qualificationRequired, setQualificationRequired] = useState<boolean>(true);
  const [completionRequirement, setCompletionRequirement] = useState<string>(
    "100% Reading + Passing Quiz + Practical Sign-off",
  );
  const [assignedEmployees, setAssignedEmployees] = useState<string[]>([
    project?.admin || PEOPLE[0] || "R. Menon",
  ]);
  const [remarks, setRemarks] = useState<string>("");

  const filteredSops = availableSops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(search.toLowerCase()),
  );

  const selectedSop: Sop | undefined = state.sops.find((s) => s.id === selectedSopId);

  const handleSelectSop = (sop: Sop) => {
    setSelectedSopId(sop.id);
    setApplicableActivity(sop.process || sop.name);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const toggleEmployee = (emp: string) => {
    setAssignedEmployees((prev) =>
      prev.includes(emp) ? prev.filter((e) => e !== emp) : [...prev, emp],
    );
  };

  const handleAdd = () => {
    if (!selectedSopId) {
      toast.error("Please select an SOP from the Master Library.");
      return;
    }

    actions.assignSopToProject({
      projectId,
      sopId: selectedSopId,
      assignedTo: leadAssignee,
      dueDate: dueDate || null,
      applicableActivity: applicableActivity || selectedSop?.process || "Site Execution",
      applicableRoles: selectedRoles,
      isMandatory,
      effectiveFrom,
      completionRequirement,
      assessmentRequired,
      qualificationRequired,
      assignedEmployees: assignedEmployees.length > 0 ? assignedEmployees : [leadAssignee],
      remarks: remarks || undefined,
    });

    toast.success(`SOP "${selectedSop?.name}" successfully configured for ${project?.name || "project"}`);
    onOpenChange(false);
    setSelectedSopId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-100 text-primary">
              <BookOpen className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 font-display">
                Add SOP from Library to Project
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Map an organization-wide master procedure to {project?.name || "this project"} and configure applicability.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2 text-xs">
          {/* Step 1: Select Master SOP */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Select Master SOP ({availableSops.length} available)
              </Label>
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-2.5 top-2 size-3.5 text-slate-400" />
                <Input
                  placeholder="Filter standards..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-7 text-xs bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50/50">
              {filteredSops.length > 0 ? (
                filteredSops.map((sop) => {
                  const isSelected = selectedSopId === sop.id;
                  return (
                    <div
                      key={sop.id}
                      onClick={() => handleSelectSop(sop)}
                      className={`cursor-pointer rounded-lg border p-2.5 transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-orange-50/50 ring-1 ring-primary shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {sop.code || "SOP"}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {sop.version_number || "V2.0"}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs line-clamp-1">{sop.name}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{sop.department}</span>
                        <span className="text-primary font-semibold">{sop.criticality || "Medium"}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 py-6 text-center text-slate-400">
                  {availableSops.length === 0
                    ? "All Master SOPs are already assigned to this project."
                    : "No procedures match your filter query."}
                </div>
              )}
            </div>

            {selectedSop && (
              <div className="rounded-lg bg-orange-50/70 border border-orange-200 p-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-orange-950">
                  Selected: <strong className="font-bold">{selectedSop.name}</strong> ({selectedSop.code || "SOP"})
                </span>
                <span className="text-[11px] text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded font-medium">
                  {selectedSop.lifecycle_status || "Effective"} Standard
                </span>
              </div>
            )}
          </div>

          {/* Step 2: Configure Project Applicability */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              2. Configure Project Applicability
            </Label>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Lead Engineer / Owner *</Label>
                <Select value={leadAssignee} onValueChange={setLeadAssignee}>
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PEOPLE.map((p) => (
                      <SelectItem key={p} value={p} className="text-xs">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Compliance Target Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Applicable Activity / Package</Label>
                <Input
                  placeholder="e.g. Foundation Excavation, RCC Slab Pour"
                  value={applicableActivity}
                  onChange={(e) => setApplicableActivity(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Effective From Date</Label>
                <Input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>

            {/* Governance Gating Controls */}
            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              <div
                onClick={() => setIsMandatory(!isMandatory)}
                className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                  isMandatory
                    ? "border-primary bg-orange-50/40 text-primary"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Mandatory SOP</span>
                  <CheckCircle2 className={`size-4 ${isMandatory ? "text-primary" : "text-slate-300"}`} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Must be completed before milestone sign-off.</p>
              </div>

              <div
                onClick={() => setAssessmentRequired(!assessmentRequired)}
                className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                  assessmentRequired
                    ? "border-emerald-500 bg-emerald-50/40 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Practical Assessment</span>
                  <CheckCircle2 className={`size-4 ${assessmentRequired ? "text-emerald-600" : "text-slate-300"}`} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Evaluator must verify field execution rubric.</p>
              </div>

              <div
                onClick={() => setQualificationRequired(!qualificationRequired)}
                className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                  qualificationRequired
                    ? "border-blue-500 bg-blue-50/40 text-blue-800"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Qualification Cert</span>
                  <CheckCircle2 className={`size-4 ${qualificationRequired ? "text-blue-600" : "text-slate-300"}`} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Issues ISO 9001 formal competency badge.</p>
              </div>
            </div>

            {/* Applicable Roles Multi-Select */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Applicable Site Roles (Whom this standard applies to)
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-xs"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {role}
                      {isSelected && <X className="ml-1 inline size-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assigned Employees Multi-Select */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Enrolled Project Employees (For Learning, Quiz & Assessment)
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {PEOPLE.map((person) => {
                  const isSelected = assignedEmployees.includes(person);
                  return (
                    <button
                      key={person}
                      type="button"
                      onClick={() => toggleEmployee(person)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        isSelected
                          ? "bg-orange-600 text-white shadow-xs"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {person}
                      {isSelected && <X className="ml-1 inline size-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="sop-remarks" className="text-xs font-semibold text-slate-700">
                Site-Specific Execution Directives / Remarks
              </Label>
              <Textarea
                id="sop-remarks"
                rows={2}
                placeholder="Specific site constraints, required batch mix records, or special hold-points..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="text-xs mt-1 resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 pt-3">
          <Button variant="ghost" className="text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedSopId}
            className="text-xs bg-primary text-white hover:bg-primary/90"
          >
            Add SOP to Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
