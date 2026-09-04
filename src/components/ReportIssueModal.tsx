import { useState } from "react";
import { AlertTriangle, UploadCloud, X, FileImage } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  actions,
  PEOPLE,
  useSiteflow,
  type IssuePriority,
} from "@/lib/siteflow-store";

export function ReportIssueModal({
  open,
  onOpenChange,
  projectId,
  sopId,
  stepId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string | null | undefined;
  sopId?: string | null | undefined;
  stepId?: string | null | undefined;
}) {
  const state = useSiteflow();

  // If a step or SOP is provided, project is locked to that context
  const isFixedContext = Boolean(sopId || stepId || projectId);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projectId ?? state.projects[0]?.id ?? "",
  );
  const [selectedSopId, setSelectedSopId] = useState<string>(sopId ?? "none");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("High");
  const [assigneeMode, setAssigneeMode] = useState<string>(PEOPLE[2] ?? "S. Sharma");
  const [customAssignee, setCustomAssignee] = useState<string>("");
  const [attachment, setAttachment] = useState<string | null>(null);
  type FormErrors = { project?: string | undefined; title?: string | undefined; description?: string | undefined };
  const [errors, setErrors] = useState<FormErrors>({});

  const activeProjectId = projectId || selectedProjectId;
  const project = state.projects.find((p) => p.id === activeProjectId);

  // Available SOPs for the selected project
  const projectSopLinks = state.projectSops.filter((ps) => ps.project_id === activeProjectId);
  const availableSops = projectSopLinks
    .map((ps) => state.sops.find((s) => s.id === ps.sop_id))
    .filter(Boolean);

  const activeSopId = sopId ?? (selectedSopId !== "none" ? selectedSopId : null);
  const sop = activeSopId ? state.sops.find((s) => s.id === activeSopId) : null;
  const step = stepId ? state.steps.find((st) => st.id === stepId) : null;

  const handleSubmit = () => {
    const errs: FormErrors = {};
    if (!activeProjectId) errs.project = "Please select a project";
    if (!title.trim()) errs.title = "Issue title is required";
    if (!description.trim()) errs.description = "Issue description is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const finalAssignee = assigneeMode === "OTHER" ? customAssignee.trim() || "External Contractor" : assigneeMode;

    actions.createIssue({
      project_id: activeProjectId,
      sop_id: activeSopId,
      step_id: stepId ?? null,
      title: title.trim(),
      description: description.trim(),
      priority,
      assigned_to: finalAssignee,
      attachment,
    });

    toast.success("Issue reported and logged in Issue Tracker", {
      description: `Project: ${project?.name ?? "Selected Project"} · Assigned to ${finalAssignee}`,
    });

    // Reset & close
    setTitle("");
    setDescription("");
    setPriority("High");
    setCustomAssignee("");
    setAttachment(null);
    setErrors({});
    onOpenChange(false);
  };

  const simulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file.name);
      toast.info(`Attached file: ${file.name}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-destructive/15 text-destructive">
              <AlertTriangle className="size-4" />
            </span>
            <DialogTitle className="font-display text-steel">Report Construction Issue</DialogTitle>
          </div>
          <DialogDescription>
            Log a site safety, quality, or execution defect across active projects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* If opened from a specific SOP execution or step, show context banner */}
          {isFixedContext && (sop || step) ? (
            <div className="rounded-lg border border-border bg-secondary/50 p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project:</span>
                <span className="font-semibold text-steel">{project?.name ?? "Current Project"}</span>
              </div>
              {sop && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SOP:</span>
                  <span className="font-semibold text-steel">{sop.name}</span>
                </div>
              )}
              {step && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Step:</span>
                  <span className="font-semibold text-steel">
                    Step {step.step_number}: {step.title}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Otherwise show Project and optional SOP dropdowns */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="issue-project">Project *</Label>
                <Select
                  value={activeProjectId}
                  onValueChange={(val) => {
                    setSelectedProjectId(val);
                    setSelectedSopId("none");
                    if (errors.project) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.project;
                        return next;
                      });
                    }
                  }}
                >
                  <SelectTrigger id="issue-project" className="mt-1">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project && <p className="mt-1 text-xs text-destructive">{errors.project}</p>}
              </div>

              <div>
                <Label htmlFor="issue-sop">Linked SOP (Optional)</Label>
                <Select
                  value={selectedSopId}
                  onValueChange={setSelectedSopId}
                >
                  <SelectTrigger id="issue-sop" className="mt-1">
                    <SelectValue placeholder="General / Site-wide" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General / Site-wide</SelectItem>
                    {availableSops.map((s) => s && (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="issue-title">Issue Title *</Label>
            <Input
              id="issue-title"
              placeholder="e.g. Concrete cube strength below target"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="issue-desc">Issue Description *</Label>
            <Textarea
              id="issue-desc"
              placeholder="Provide specific details about the issue, location on site, and immediate containment..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as IssuePriority)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">
                    <span className="flex items-center gap-1.5 text-destructive font-semibold">
                      ● High Priority
                    </span>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <span className="flex items-center gap-1.5 text-warning font-semibold">
                      ● Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="Low">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                      ● Low
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assign To</Label>
              <Select value={assigneeMode} onValueChange={setAssigneeMode}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PEOPLE.map((p) => (
                    <SelectItem key={p} value={p}>
                      👤 {p}
                    </SelectItem>
                  ))}
                  <SelectItem value="OTHER" className="text-primary font-semibold">
                    ➕ Other / Custom Assignee...
                  </SelectItem>
                </SelectContent>
              </Select>

              {assigneeMode === "OTHER" && (
                <input
                  type="text"
                  placeholder="Enter Name & Subcontractor Role..."
                  value={customAssignee}
                  onChange={(e) => setCustomAssignee(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-input bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              )}
            </div>
          </div>

          <div>
            <Label>Site Photo / Attachment</Label>
            {attachment ? (
              <div className="mt-1 flex items-center justify-between rounded-md border border-border bg-card p-2 text-xs">
                <div className="flex items-center gap-2 text-steel">
                  <FileImage className="size-4 text-primary" />
                  <span className="font-medium truncate max-w-[200px]">{attachment}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="mt-1 flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card p-4 hover:border-primary cursor-pointer transition-colors">
                <UploadCloud className="size-6 text-muted-foreground mb-1" />
                <span className="text-xs font-medium text-steel">Click to upload photo / report</span>
                <span className="text-[11px] text-muted-foreground">PNG, JPG, PDF up to 10MB</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={simulateUpload}
                />
              </label>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Create Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
