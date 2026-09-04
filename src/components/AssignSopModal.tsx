import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { actions, PEOPLE, DEPARTMENTS, useSiteflow } from "@/lib/siteflow-store";
import { Calendar, UserPlus, Link2, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AssignMode = "individual" | "role" | "department";

const ROLES = [
  "Site Engineer",
  "Quality Manager",
  "Project Manager",
  "Safety Officer",
  "Structural Engineer",
  "MEP Engineer",
  "Site Supervisor",
];

export function AssignSopModal({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const state = useSiteflow();
  const assignedProjectSops = state.projectSops.filter((ps) => ps.project_id === projectId);
  const assignedSopIds = new Set(assignedProjectSops.map((ps) => ps.sop_id));

  const availableSops = state.sops;
  const [selectedSopId, setSelectedSopId] = useState<string>(
    availableSops.find((s) => !assignedSopIds.has(s.id))?.id ?? availableSops[0]?.id ?? "",
  );

  // Assignment mode: individual / role / department
  const [assignMode, setAssignMode] = useState<AssignMode>("individual");
  const [assigneeMode, setAssigneeMode] = useState<string>(PEOPLE[0] ?? "R. Menon");
  const [customAssignee, setCustomAssignee] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>(ROLES[0] ?? "Site Engineer");
  const [selectedDepartment, setSelectedDepartment] = useState<string>(DEPARTMENTS[0] ?? "Civil");
  const [previousSopId, setPreviousSopId] = useState<string>("auto");
  const [dueDate, setDueDate] = useState<string>("");

  const handleSetPresetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split("T")[0] ?? "");
  };

  const handleAssign = () => {
    if (!selectedSopId) {
      toast.error("Please select an SOP to assign");
      return;
    }

    let finalAssignees: string[] = [];

    if (assignMode === "individual") {
      const a = assigneeMode === "OTHER" ? customAssignee.trim() : assigneeMode;
      if (!a) { toast.error("Please specify an assignee"); return; }
      finalAssignees = [a];
    } else if (assignMode === "role") {
      // Assign to all people matching the role name pattern (or just label it)
      finalAssignees = [`All ${selectedRole}s`];
    } else if (assignMode === "department") {
      finalAssignees = [`${selectedDepartment} Dept.`];
    }

    const sop = state.sops.find((s) => s.id === selectedSopId);
    for (const assignee of finalAssignees) {
      actions.assignSop(projectId, selectedSopId, assignee, dueDate || undefined);
    }

    if (previousSopId && previousSopId !== "auto" && previousSopId !== "none") {
      const latestPs = state.projectSops.find(
        (ps) => ps.project_id === projectId && ps.sop_id === selectedSopId,
      );
      if (latestPs) {
        actions.updateProjectSop(latestPs.id, { previous_sop_id: previousSopId });
      }
    }

    const assignLabel =
      assignMode === "individual"
        ? finalAssignees[0]
        : assignMode === "role"
        ? `all ${selectedRole}s`
        : `${selectedDepartment} Department`;

    toast.success(`Assigned "${sop?.name ?? "SOP"}" to ${assignLabel}`, {
      description: dueDate ? `Target End Date: ${dueDate}` : "No deadline set",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-slate-900">Assign SOP to Project</DialogTitle>
          <DialogDescription>
            Assign to an individual, a role, or an entire department with due date and stage dependencies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Master SOP Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="sop-select" className="text-xs font-bold text-slate-700">
              Select Master SOP *
            </Label>
            <Select value={selectedSopId} onValueChange={setSelectedSopId}>
              <SelectTrigger id="sop-select" className="h-9">
                <SelectValue placeholder="Choose an SOP" />
              </SelectTrigger>
              <SelectContent>
                {availableSops.map((sop) => {
                  const isAlreadyAssigned = assignedSopIds.has(sop.id);
                  const stepCount = state.steps.filter((st) => st.sop_id === sop.id).length;
                  return (
                    <SelectItem key={sop.id} value={sop.id}>
                      <span className="font-medium">{sop.name}</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        ({sop.department} · {stepCount} steps)
                        {isAlreadyAssigned ? " [Already in project]" : ""}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Mode Toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700">Assignment Scope *</Label>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(
                [
                  { value: "individual", label: "Individual", icon: UserPlus },
                  { value: "role", label: "By Role", icon: Users },
                  { value: "department", label: "By Department", icon: Building2 },
                ] as { value: AssignMode; label: string; icon: typeof UserPlus }[]
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAssignMode(value)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold transition-all",
                    assignMode === value
                      ? "bg-white text-primary shadow-xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Icon className="size-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Assignee */}
          {assignMode === "individual" && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">Assigned Lead / Engineer *</Label>
                <span className="text-[10px] text-slate-500">Team member or external contractor</span>
              </div>
              <Select value={assigneeMode} onValueChange={setAssigneeMode}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select team member or Other" />
                </SelectTrigger>
                <SelectContent>
                  {PEOPLE.map((p) => (
                    <SelectItem key={p} value={p}>👤 {p}</SelectItem>
                  ))}
                  <SelectItem value="OTHER" className="font-semibold text-primary">
                    ➕ Other / Custom Assignee...
                  </SelectItem>
                </SelectContent>
              </Select>
              {assigneeMode === "OTHER" && (
                <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="text"
                    required
                    placeholder="Enter Full Name & Role (e.g. S. Verma - MEP Contractor)"
                    value={customAssignee}
                    onChange={(e) => setCustomAssignee(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          )}

          {/* Role-based Assignment */}
          {assignMode === "role" && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <Label className="text-xs font-bold text-slate-700">Select Role *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>👥 {r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5">
                This SOP will be assigned to all <strong>{selectedRole}s</strong> on this project.
              </p>
            </div>
          )}

          {/* Department-based Assignment */}
          {assignMode === "department" && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <Label className="text-xs font-bold text-slate-700">Select Department *</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>🏗️ {d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5">
                This SOP will be assigned to the entire <strong>{selectedDepartment}</strong> department on this project.
              </p>
            </div>
          )}

          {/* Previous Stage Dependency */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700 inline-flex items-center gap-1">
                <Link2 className="size-3.5 text-slate-500" /> Previous Stage Dependency
              </Label>
              <span className="text-[10px] text-slate-500">Notifies lead when predecessor completes</span>
            </div>
            <Select value={previousSopId} onValueChange={setPreviousSopId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select preceding stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">⚡ Automatic Sequential Order</SelectItem>
                <SelectItem value="none">🚫 No Preceding Dependency (Initial Stage)</SelectItem>
                {assignedProjectSops.map((ps) => {
                  const s = state.sops.find((x) => x.id === ps.sop_id);
                  return (
                    <SelectItem key={ps.id} value={ps.sop_id}>
                      ⛓️ Depends on: {s?.name ?? "SOP"} ({ps.assigned_to})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Target Completion End Date */}
          <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <Label htmlFor="due-date" className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-600" /> Target Completion End Date
              </Label>
              <span className="text-[10px] text-slate-500">Used for Overdue Tracking & Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 shadow-xs focus:border-primary focus:outline-hidden"
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate("")}
                  className="rounded px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Quick:</span>
              {[7, 14, 30, 60].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleSetPresetDate(days)}
                  className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                >
                  +{days === 60 ? "2 Mo" : days === 30 ? "1 Mo" : `${days}d`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Assign SOP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
