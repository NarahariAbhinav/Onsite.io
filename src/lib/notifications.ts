/**
 * SiteFlow Notification System
 * Generates, stores, and manages in-app notifications & escalations
 * per BRD §7.18 — Notifications and Escalations
 */

import { useSyncExternalStore } from "react";
import type { SiteflowState } from "./siteflow-store";

export type NotificationPriority = "info" | "warning" | "critical";
export type NotificationCategory =
  | "sop"
  | "quiz"
  | "assessment"
  | "audit"
  | "issue"
  | "capa"
  | "qualification"
  | "document";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string; // route to navigate to
  entityId?: string;
}

/* ───────────────────── Store ───────────────────── */

interface NotificationStore {
  notifications: AppNotification[];
  lastGeneratedAt: string | null;
}

let store: NotificationStore = {
  notifications: [],
  lastGeneratedAt: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function getSnapshot(): NotificationStore {
  return store;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNotifications(): NotificationStore {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ───────────────────── Actions ───────────────────── */

export const notificationActions = {
  markRead(id: string) {
    store = {
      ...store,
      notifications: store.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    };
    notify();
  },

  markAllRead() {
    store = {
      ...store,
      notifications: store.notifications.map((n) => ({ ...n, read: true })),
    };
    notify();
  },

  dismiss(id: string) {
    store = {
      ...store,
      notifications: store.notifications.filter((n) => n.id !== id),
    };
    notify();
  },

  clearAll() {
    store = { ...store, notifications: [] };
    notify();
  },

  addNotification(notif: Omit<AppNotification, "id" | "timestamp" | "read">) {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    store = {
      ...store,
      notifications: [newNotif, ...store.notifications],
    };
    notify();
  },

  /**
   * Scan the entire platform state and generate relevant notifications.
   * BRD §7.18 — triggered on app load and after any significant action.
   */
  generateFromState(state: SiteflowState) {
    const now = new Date();
    const newNotifs: AppNotification[] = [];
    const existingIds = new Set(store.notifications.map((n) => n.entityId).filter(Boolean));

    const push = (
      notif: Omit<AppNotification, "id" | "timestamp" | "read">
    ) => {
      // Avoid duplicate notifications for the same entity
      if (notif.entityId && existingIds.has(notif.entityId)) return;
      newNotifs.push({
        ...notif,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    };

    // ── 1. SOP Due Date Approaching (within 7 days) ──
    for (const ps of state.projectSops) {
      if (!ps.due_date || ps.completed_at) continue;
      const due = new Date(ps.due_date);
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const sop = state.sops.find((s) => s.id === ps.sop_id);
      const project = state.projects.find((p) => p.id === ps.project_id);
      if (daysLeft < 0) {
        push({
          category: "sop",
          priority: "critical",
          title: "SOP Overdue",
          message: `"${sop?.name ?? "SOP"}" on ${project?.name ?? "project"} is overdue by ${Math.abs(daysLeft)} day(s). Assigned to: ${ps.assigned_to}.`,
          link: `/projects/${ps.project_id}`,
          entityId: `sop-overdue-${ps.id}`,
        });
      } else if (daysLeft <= 7) {
        push({
          category: "sop",
          priority: "warning",
          title: "SOP Due Soon",
          message: `"${sop?.name ?? "SOP"}" on ${project?.name ?? "project"} is due in ${daysLeft} day(s). Assigned to: ${ps.assigned_to}.`,
          link: `/projects/${ps.project_id}`,
          entityId: `sop-due-soon-${ps.id}`,
        });
      }
    }

    // ── 2. Quiz Max Attempts Reached (locked) ──
    const lockedAttempts = state.quizAttempts.filter((a) => a.is_locked && !a.passed);
    for (const attempt of lockedAttempts.slice(0, 5)) {
      const quiz = state.quizzes.find((q) => q.id === attempt.quiz_id);
      push({
        category: "quiz",
        priority: "warning",
        title: "Quiz Locked — Max Attempts Reached",
        message: `${attempt.user_name} has exhausted all attempts for "${quiz?.title ?? "Quiz"}" (Score: ${Math.round(attempt.score_pct)}%). Manual reset required.`,
        link: "/competency",
        entityId: `quiz-locked-${attempt.id}`,
      });
    }

    // ── 3. Quiz Failed ──
    const recentFails = state.quizAttempts.filter((a) => !a.passed && !a.is_locked).slice(0, 5);
    for (const attempt of recentFails) {
      const quiz = state.quizzes.find((q) => q.id === attempt.quiz_id);
      push({
        category: "quiz",
        priority: "info",
        title: "Quiz Failed",
        message: `${attempt.user_name} failed "${quiz?.title ?? "Quiz"}" with ${Math.round(attempt.score_pct)}% (Attempt ${attempt.attempt_number}/${state.quizzes.find(q=>q.id===attempt.quiz_id)?.max_attempts ?? 3}).`,
        link: "/competency",
        entityId: `quiz-fail-${attempt.id}`,
      });
    }

    // ── 4. Assessment Pending Evaluation ──
    const pendingAssessments = state.assessments.filter((a) => a.status === "Under Evaluation");
    for (const assessment of pendingAssessments.slice(0, 5)) {
      push({
        category: "assessment",
        priority: "warning",
        title: "Assessment Awaiting Evaluation",
        message: `${assessment.user_name}'s simulation assessment for "${assessment.title}" has been submitted and needs evaluator review.`,
        link: "/competency",
        entityId: `assessment-pending-${assessment.id}`,
      });
    }

    // ── 5. Qualification Expiring Soon (within 30 days) ──
    for (const qual of state.qualifications) {
      if (qual.status !== "Qualified") continue;
      const expiry = new Date(qual.expires_at);
      const daysToExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry > 0 && daysToExpiry <= 30) {
        push({
          category: "qualification",
          priority: "warning",
          title: "Qualification Expiring Soon",
          message: `${qual.user_name}'s qualification for "${qual.sop_title}" expires in ${daysToExpiry} day(s). Renewal assessment required.`,
          link: "/competency",
          entityId: `qual-expiring-${qual.id}`,
        });
      } else if (daysToExpiry <= 0) {
        push({
          category: "qualification",
          priority: "critical",
          title: "Qualification Expired",
          message: `${qual.user_name}'s certification for "${qual.sop_title}" has expired. Re-assessment mandatory before site deployment.`,
          link: "/competency",
          entityId: `qual-expired-${qual.id}`,
        });
      }
    }

    // ── 6. Scheduled Audits Overdue ──
    for (const audit of state.audits) {
      if (audit.status !== "Scheduled") continue;
      const scheduled = new Date(audit.scheduled_date);
      const daysOverdue = Math.ceil((now.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0) {
        push({
          category: "audit",
          priority: daysOverdue > 7 ? "critical" : "warning",
          title: "Audit Overdue",
          message: `Audit "${audit.title}" for ${audit.sop_name} on ${audit.project_name} is overdue by ${daysOverdue} day(s). Auditor: ${audit.auditor_name}.`,
          link: "/audits",
          entityId: `audit-overdue-${audit.id}`,
        });
      }
    }

    // ── 7. Failed Audits with Open Findings ──
    const failedAudits = state.audits.filter((a) => a.status === "Completed" && a.passed === false);
    for (const audit of failedAudits.slice(0, 3)) {
      const criticalFindings = audit.findings.filter((f) => f.severity === "Critical" || f.severity === "High");
      if (criticalFindings.length > 0) {
        push({
          category: "audit",
          priority: "critical",
          title: "Critical Audit Findings Unresolved",
          message: `Audit "${audit.title}" has ${criticalFindings.length} critical/high finding(s) on ${audit.project_name}. CAPA required immediately.`,
          link: "/audits",
          entityId: `audit-failed-critical-${audit.id}`,
        });
      }
    }

    // ── 8. Open Issues Past Due Date (use capa_target_date as proxy for due date)
    for (const issue of state.issues) {
      if (issue.status === "Resolved" || issue.status === "Closed") continue;
      // Use capa_target_date as the deadline for overdue checks
      const dueDateStr = issue.capa_target_date;
      if (!dueDateStr) continue;
      const due = new Date(dueDateStr);
      const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0) {
        const project = state.projects.find((p) => p.id === issue.project_id);
        push({
          category: "issue",
          priority: issue.priority === "High" ? "critical" : "warning",
          title: "Issue Overdue",
          message: `Issue "${issue.title}" on ${project?.name ?? "project"} is overdue by ${daysOverdue} day(s). Priority: ${issue.priority}. Assigned to: ${issue.assigned_to ?? "Unassigned"}.`,
          link: "/issues",
          entityId: `issue-overdue-${issue.id}`,
        });
      }
    }

    // ── 9. CAPA Actions Overdue (stage started but past target date) ──
    for (const issue of state.issues) {
      if (!issue.capa_target_date) continue;
      // If no capa_stage, CAPA hasn't started
      if (!issue.capa_stage) continue;
      // Only alert if not yet at effectiveness stage
      if (issue.capa_stage === "5_Effectiveness") continue;
      const due = new Date(issue.capa_target_date);
      const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0) {
        push({
          category: "capa",
          priority: "critical",
          title: "CAPA Action Overdue",
          message: `CAPA for "${issue.title}" is overdue by ${daysOverdue} day(s). Current stage: ${issue.capa_stage}. Immediate escalation required.`,
          link: "/issues",
          entityId: `capa-overdue-${issue.id}`,
        });
      }
    }

    // ── 10. Document Upload Pending (overdue) ──
    const overdueDocuments = state.documents.filter((d) => {
      if (d.file_name) return false;
      if (!d.due_date) return false;
      return new Date(d.due_date).getTime() < now.getTime();
    });
    if (overdueDocuments.length > 0) {
      push({
        category: "document",
        priority: "warning",
        title: `${overdueDocuments.length} Documents Overdue for Upload`,
        message: `${overdueDocuments.length} quality document(s) are past their submission deadline without an uploaded file. Review the Document Register immediately.`,
        link: "/documents",
        entityId: `docs-overdue-batch-${now.toDateString()}`,
      });
    }

    if (newNotifs.length > 0) {
      store = {
        ...store,
        notifications: [...newNotifs, ...store.notifications].slice(0, 100), // cap at 100
        lastGeneratedAt: new Date().toISOString(),
      };
      notify();
    }
  },
};
