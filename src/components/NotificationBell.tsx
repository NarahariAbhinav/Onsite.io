import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Award,
  ClipboardList,
  Info,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  notificationActions,
  type AppNotification,
  type NotificationCategory,
} from "@/lib/notifications";
import { useSiteflow } from "@/lib/siteflow-store";
import { formatDistanceToNow } from "date-fns";

/* ─── Icon map by category ─── */
function CategoryIcon({ category, priority }: { category: NotificationCategory; priority: string }) {
  const cls = cn(
    "size-4 shrink-0",
    priority === "critical"
      ? "text-rose-500"
      : priority === "warning"
      ? "text-amber-500"
      : "text-slate-500"
  );
  const icons: Record<NotificationCategory, typeof Bell> = {
    sop: ClipboardList,
    quiz: Award,
    assessment: Award,
    audit: ShieldAlert,
    issue: AlertTriangle,
    capa: AlertCircle,
    qualification: Award,
    document: FileText,
  };
  const Icon = icons[category] ?? Info;
  return <Icon className={cls} />;
}

/* ─── Single notification row ─── */
function NotifRow({ notif, onClose }: { notif: AppNotification; onClose: () => void }) {
  const navigate = useNavigate();

  const handleClick = () => {
    notificationActions.markRead(notif.id);
    if (notif.link) {
      navigate({ to: notif.link as "/" });
    }
    onClose();
  };

  const bgClass =
    notif.priority === "critical"
      ? "bg-rose-50 border-rose-100"
      : notif.priority === "warning"
      ? "bg-amber-50 border-amber-100"
      : "bg-white border-slate-100";

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-3 border-b cursor-pointer transition-colors hover:bg-slate-50",
        bgClass,
        !notif.read && "border-l-2 border-l-primary"
      )}
      onClick={handleClick}
    >
      <div className="mt-0.5 shrink-0">
        <CategoryIcon category={notif.category} priority={notif.priority} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-[11.5px] font-semibold leading-tight", !notif.read ? "text-slate-900" : "text-slate-600")}>
            {notif.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              notificationActions.dismiss(notif.id);
            }}
            className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="size-3" />
          </button>
        </div>
        <p className="text-[10.5px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
        <p className="text-[10px] text-slate-400 mt-1">
          {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

/* ─── Main Bell component ─── */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications } = useNotifications();
  const state = useSiteflow();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Generate notifications from live state on mount and periodically
  useEffect(() => {
    notificationActions.generateFromState(state);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const criticalCount = notifications.filter((n) => !n.read && n.priority === "critical").length;
  const warningCount = notifications.filter((n) => !n.read && n.priority === "warning").length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-lg border transition-all",
          open
            ? "border-primary/30 bg-primary/5 text-primary"
            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
        title="Notifications"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full text-white font-bold text-[9px] ring-2 ring-white",
              criticalCount > 0 ? "bg-rose-500" : "bg-amber-500"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[380px] rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-px rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => notificationActions.markAllRead()}
                  className="flex items-center gap-1 text-[10.5px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <CheckCheck className="size-3" /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Priority Summary Pills */}
          {(criticalCount > 0 || warningCount > 0) && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50/80 border-b border-slate-100">
              {criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">
                  <AlertCircle className="size-3" /> {criticalCount} Critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="size-3" /> {warningCount} Warning
                </span>
              )}
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell className="size-8 text-slate-200 mb-2" />
                <p className="text-sm font-semibold text-slate-600">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">No new notifications at this time.</p>
              </div>
            ) : (
              <>
                {/* Critical first */}
                {notifications
                  .filter((n) => n.priority === "critical")
                  .map((n) => (
                    <NotifRow key={n.id} notif={n} onClose={() => setOpen(false)} />
                  ))}
                {/* Then warnings */}
                {notifications
                  .filter((n) => n.priority === "warning")
                  .map((n) => (
                    <NotifRow key={n.id} notif={n} onClose={() => setOpen(false)} />
                  ))}
                {/* Then info */}
                {notifications
                  .filter((n) => n.priority === "info")
                  .map((n) => (
                    <NotifRow key={n.id} notif={n} onClose={() => setOpen(false)} />
                  ))}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <span className="text-[10.5px] text-slate-500">{notifications.length} total alerts</span>
              <button
                onClick={() => notificationActions.clearAll()}
                className="text-[10.5px] font-semibold text-slate-500 hover:text-rose-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
