import { AlertTriangle, CheckCircle2, Circle, Clock } from "lucide-react";
import type {
  IssuePriority,
  IssueStatus,
  ProjectStatus,
  StepStatus,
} from "@/lib/siteflow-store";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap border";

const tone = {
  gray: "bg-slate-100 text-slate-700 border-slate-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  red: "bg-rose-50 text-rose-800 border-rose-200",
  steel: "bg-slate-800 text-white border-slate-800",
  orange: "bg-orange-50 text-orange-800 border-orange-200",
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
    status === "Completed" ? tone.green : status === "In Progress" ? tone.amber : tone.gray;
  return <span className={cn(base, t)}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const t = priority === "High" ? tone.red : priority === "Medium" ? tone.amber : tone.gray;
  return (
    <span className={cn(base, t)}>
      {priority === "High" && <AlertTriangle className="size-3 text-rose-600" />}
      {priority}
    </span>
  );
}

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  const map: Record<IssueStatus, string> = {
    Open: tone.red,
    Assigned: tone.amber,
    "In Progress": tone.orange,
    Resolved: tone.green,
    Closed: "bg-slate-100 text-slate-600 border-slate-200",
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
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          pct === 100 ? "bg-emerald-600" : "bg-primary",
        )}
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
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        tone[toneKey],
      )}
    >
      <span className="opacity-70">{label}:</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}
