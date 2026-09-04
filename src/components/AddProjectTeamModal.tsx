import { useState } from "react";
import { UserPlus, Shield, Briefcase, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { actions, DEPARTMENTS, PEOPLE, useSiteflow } from "@/lib/siteflow-store";

interface AddProjectTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const ROLES = [
  "Site Engineer",
  "QA/QC Inspector",
  "Safety Officer",
  "Site Supervisor",
  "Subcontractor Foreman",
  "Project Manager",
  "MEP Coordinator",
  "Planning Engineer",
  "Surveyor",
];

export function AddProjectTeamModal({
  open,
  onOpenChange,
  projectId,
}: AddProjectTeamModalProps) {
  const state = useSiteflow();
  const project = state.projects.find((p) => p.id === projectId);

  const [selectedName, setSelectedName] = useState<string>(PEOPLE[0] ?? "R. Menon");
  const [customName, setCustomName] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [role, setRole] = useState<string>("Site Engineer");
  const [department, setDepartment] = useState<string>("Civil");
  const [responsibility, setResponsibility] = useState<string>(
    "On-site SOP compliance, inspection hold-point sign-off, and milestone execution",
  );
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  const handleSave = () => {
    const finalName = isCustom ? customName.trim() : selectedName;
    if (!finalName) {
      toast.error("Please provide an employee name");
      return;
    }

    actions.addProjectTeamMember({
      project_id: projectId,
      name: finalName,
      role,
      department,
      responsibility: responsibility || "Project Execution & Quality Oversight",
      start_date: startDate || new Date().toISOString().slice(0, 10),
      status: "Active",
    });

    toast.success(`Assigned ${finalName} (${role}) to ${project?.name || "project"}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-100 text-primary">
              <UserPlus className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 font-display">
                Assign Employee to Project
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Designate site responsibilities and configure SOP qualification tracking.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-semibold text-slate-700">Employee Name *</Label>
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                {isCustom ? "Select from Roster" : "Enter Custom Name"}
              </button>
            </div>

            {isCustom ? (
              <Input
                placeholder="e.g. Vikramaditya Singh"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-9 text-xs"
              />
            ) : (
              <Select value={selectedName} onValueChange={setSelectedName}>
                <SelectTrigger className="h-9 text-xs">
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
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Project Role *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Department *</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...DEPARTMENTS, "Quality", "Management"].map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700">Assignment Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 text-xs mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700">Primary Responsibility / Scope</Label>
            <Input
              placeholder="e.g. Excavation safety permits, daily pour inspections"
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              className="h-9 text-xs mt-1"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 pt-3">
          <Button variant="ghost" className="text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="text-xs bg-primary text-white hover:bg-primary/90">
            Assign to Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
