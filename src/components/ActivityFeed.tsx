import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Layers,
  RotateCcw,
  Activity,
  ArrowRight,
} from "lucide-react";
import {
  formatRelativeTime,
  useSiteflow,
  type ActivityItem,
  type ActivityType,
} from "@/lib/siteflow-store";

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "step_completed":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-100 text-emerald-700",
        dot: "bg-emerald-500",
      };
    case "step_started":
      return {
        icon: Clock,
        bg: "bg-amber-100 text-amber-700",
        dot: "bg-amber-500",
      };
    case "issue_created":
      return {
        icon: AlertTriangle,
        bg: "bg-rose-100 text-rose-700",
        dot: "bg-rose-500",
      };
    case "issue_status":
      return {
        icon: RotateCcw,
        bg: "bg-blue-100 text-blue-700",
        dot: "bg-blue-500",
      };
    case "doc_uploaded":
      return {
        icon: FileText,
        bg: "bg-orange-100 text-orange-700",
        dot: "bg-orange-500",
      };
    case "sop_assigned":
      return {
        icon: Layers,
        bg: "bg-indigo-100 text-indigo-700",
        dot: "bg-indigo-500",
      };
    default:
      return {
        icon: Activity,
        bg: "bg-slate-100 text-slate-700",
        dot: "bg-slate-500",
      };
  }
}

export function ActivityFeed({
  projectId,
  limit = 8,
  compact = false,
}: {
  projectId?: string | null | undefined;
  limit?: number;
  compact?: boolean;
}) {
  const state = useSiteflow();

  const filteredActivities = (
    projectId
      ? state.activities.filter((a) => a.project_id === projectId)
      : state.activities
  ).slice(0, limit);

  if (filteredActivities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
        <Activity className="mx-auto mb-1.5 size-6 text-slate-300" />
        <p className="font-semibold text-slate-700">No recent activity recorded</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Milestone sign-offs and defect updates will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="divide-y divide-slate-100">
        {filteredActivities.map((act: ActivityItem) => {
          const project = state.projects.find((p) => p.id === act.project_id);
          const { icon: Icon, bg, dot } = getActivityIcon(act.type);

          return (
            <div
              key={act.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors"
            >
              {/* Icon avatar */}
              <div
                className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${bg}`}
              >
                <Icon className="size-3.5" />
              </div>

              {/* Text content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    {act.title}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                </div>

                {act.detail && (
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                    {act.detail}
                  </p>
                )}

                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-medium text-slate-700">
                    {act.user}
                  </span>
                  {!projectId && project && (
                    <>
                      <span>·</span>
                      <Link
                        to="/projects/$projectId"
                        params={{ projectId: project.id }}
                        className="font-medium text-primary hover:underline truncate max-w-[140px]"
                      >
                        {project.name}
                      </Link>
                    </>
                  )}
                  {act.issue_id && (
                    <>
                      <span>·</span>
                      <Link
                        to="/issues/$issueId"
                        params={{ issueId: act.issue_id }}
                        className="font-mono text-rose-600 hover:underline"
                      >
                        {act.issue_id}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
