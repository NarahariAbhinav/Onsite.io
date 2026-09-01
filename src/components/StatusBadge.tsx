import { AlertTriangle, CheckCircle2, Circle, Clock } from "lucide-react";
import type {
  IssuePriority,
  IssueStatus,
  ProjectStatus,
  StepStatus,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

const tone = {
  gray: "bg-secondary text-muted-foreground",
  amber: "bg-warning/20 text-warning-foreground",
  green: "bg-success/15 text-success",
  red: "bg-destructive/12 text-destructive",
  steel: "bg-steel/10 text-steel",
  darkred: "bg-destructive text-destructive-foreground",
} as const;

export function StepStatusBadge({ status, className }: { status: StepStatus; className?: string }) {
  const map = {
    "Not Started": { t: tone.gray, icon: Circle },
    "In Progress": { t: tone.amber, icon: Clock },
    Completed: { t: tone.green, icon: CheckCircle2 },
  } as const;
  const { t, icon: Icon } = map[status];
  return (
    <span className={cn(base, t, className)}>
      <Icon className="size-3" /> {status}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const t =
    status === "Completed" ? tone.green : status === "In Progress" ? tone.amber : tone.steel;
  return <span className={cn(base, t)}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const t = priority === "High" ? tone.red : priority === "Medium" ? tone.amber : tone.gray;
  return (
    <span className={cn(base, t)}>
      {priority === "High" && <AlertTriangle className="size-3" />}
      {priority}
    </span>
  );
}

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  const map: Record<IssueStatus, string> = {
    Open: tone.red,
    Assigned: tone.amber,
    "In Progress": tone.steel,
    Resolved: tone.green,
    Closed: "bg-success/8 text-success/80",
  };
  return <span className={cn(base, map[status])}>{status}</span>;
}

export function DocStatusBadge({ uploaded }: { uploaded: boolean }) {
  return (
    <span className={cn(base, uploaded ? tone.green : tone.amber)}>
      {uploaded ? "Uploaded" : "Pending"}
    </span>
  );
}

export function ProgressBar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full", pct === 100 ? "bg-success" : "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Chip({
  label,
  value,
  toneKey = "gray",
}: {
  label: string;
  value: string | number;
  toneKey?: keyof typeof tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium",
        tone[toneKey],
      )}
    >
      <span className="opacity-70">{label}</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}
