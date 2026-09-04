import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { actions, DEPARTMENTS, type Sop, type SopStep } from "@/lib/siteflow-store";

type StepItem = {
  id?: string;
  title: string;
  instructions: string;
  expanded?: boolean;
};

type SopFormErrors = {
  name?: string;
  department?: string;
  steps?: string;
};

export function SopFormDrawer({
  open,
  onOpenChange,
  sop,
  initialSteps = [],
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sop?: Sop | null | undefined;
  initialSteps?: SopStep[] | undefined;
  onSaved?: (sopId: string) => void;
}) {
  const [name, setName] = useState(sop?.name ?? "");
  const [department, setDepartment] = useState<string>(sop?.department ?? DEPARTMENTS[0] ?? "Civil");
  const [customDept, setCustomDept] = useState("");
  const [showCustomDept, setShowCustomDept] = useState(false);
  const [description, setDescription] = useState(sop?.description ?? "");
  const [steps, setSteps] = useState<StepItem[]>(
    initialSteps && initialSteps.length > 0
      ? initialSteps.map((s) => ({ id: s.id, title: s.title, instructions: s.instructions, expanded: true }))
      : [
          { title: "Preparation & Inspection", instructions: "Inspect site readiness, safety clearance and tools.", expanded: true },
          { title: "Execution Procedure", instructions: "Carry out the procedure strictly as per specifications.", expanded: true },
        ],
  );
  const [errors, setErrors] = useState<SopFormErrors>({});

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { title: "", instructions: "", expanded: true },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) {
      toast.error("An SOP must contain at least one step");
      return;
    }
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    )
      return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const currentItem = steps[index];
    const targetItem = steps[targetIdx];
    if (!currentItem || !targetItem) return;
    const newSteps = [...steps];
    newSteps[index] = targetItem;
    newSteps[targetIdx] = currentItem;
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: "title" | "instructions" | "expanded", value: any) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const handleSubmit = () => {
    const errs: SopFormErrors = {};
    if (!name.trim()) errs.name = "SOP name is required";
    const dept = showCustomDept && customDept.trim() ? customDept.trim() : department;
    if (!dept) errs.department = "Department is required";
    if (steps.some((s) => !s.title.trim())) {
      errs.steps = "All steps must have a title";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const newSopId = actions.saveSop(
      {
        id: sop?.id ?? undefined,
        name: name.trim(),
        department: dept,
        description: description.trim(),
      },
      steps.map((s) => ({
        id: s.id,
        title: s.title.trim(),
        instructions: s.instructions.trim(),
      })),
    );

    toast.success(sop ? "Master SOP updated" : "Master SOP saved");
    if (onSaved) {
      onSaved(newSopId);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-display text-steel">
            {sop ? "Edit Master SOP" : "Create Master SOP"}
          </SheetTitle>
          <SheetDescription>
            Master SOPs are reusable templates. When assigned to projects, individual execution
            checklists are spawned.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sop-name">SOP Title *</Label>
              <Input
                id="sop-name"
                placeholder="e.g. Waterproofing SOP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <Label>Department</Label>
              {!showCustomDept ? (
                <div className="flex gap-2 mt-1">
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomDept(true)}
                  >
                    + Custom
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Enter department name"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCustomDept(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="sop-desc">Description & Purpose</Label>
              <Textarea
                id="sop-desc"
                placeholder="Summary of quality guidelines, standards, and safety precautions..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Dynamic Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h3 className="font-display text-sm font-bold text-steel uppercase tracking-wider">
                  Sequential Procedure Steps
                </h3>
                <p className="text-xs text-muted-foreground">Ordered steps site engineers must follow</p>
              </div>
              <span className="text-xs font-semibold text-primary">
                {steps.length} {steps.length === 1 ? "step" : "steps"}
              </span>
            </div>

            {errors.steps && (
              <p className="text-xs font-medium text-destructive">{errors.steps}</p>
            )}

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="flex size-6 items-center justify-center rounded-full bg-steel text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <Input
                        placeholder={`Step ${idx + 1} Title (e.g. Surface preparation)`}
                        value={step.title}
                        onChange={(e) => updateStep(idx, "title", e.target.value)}
                        className="h-8 text-sm font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={idx === 0}
                        onClick={() => moveStep(idx, "up")}
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={idx === steps.length - 1}
                        onClick={() => moveStep(idx, "down")}
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-steel"
                        onClick={() => updateStep(idx, "expanded", !step.expanded)}
                      >
                        {step.expanded ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeStep(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {step.expanded && (
                    <div className="pl-8 pt-1">
                      <Textarea
                        placeholder="Detailed technical instructions, tolerances, equipment checks..."
                        rows={2}
                        value={step.instructions}
                        onChange={(e) => updateStep(idx, "instructions", e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/5 gap-2"
            >
              <Plus className="size-4" /> Add Step
            </Button>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Master SOP
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
