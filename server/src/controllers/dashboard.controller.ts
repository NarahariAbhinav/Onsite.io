import { Response, NextFunction } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { CapaStatus, IssueStatus, SopLifecycleStatus } from "@prisma/client";

export async function getManagementDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const orgId = req.user!.organizationId;

    const [
      totalProjects,
      totalSops,
      activeVersionsCount,
      totalAssignments,
      completedAssignments,
      quizAttempts,
      passedQuizAttempts,
      qualifiedEmployees,
      totalEmployees,
      audits,
      openIssues,
      openCapas,
    ] = await Promise.all([
      prisma.project.count({ where: { organizationId: orgId } }),
      prisma.sop.count({ where: { organizationId: orgId } }),
      prisma.sopVersion.count({ where: { sop: { organizationId: orgId }, lifecycleStatus: SopLifecycleStatus.EFFECTIVE } }),
      prisma.employeeSopAssignment.count({ where: { project: { organizationId: orgId } } }),
      prisma.employeeSopAssignment.count({ where: { project: { organizationId: orgId }, status: "COMPLETED" } }),
      prisma.quizAttempt.count({ where: { employee: { user: { organizationId: orgId } } } }),
      prisma.quizAttempt.count({ where: { employee: { user: { organizationId: orgId } }, passed: true } }),
      prisma.qualification.count({ where: { employee: { user: { organizationId: orgId } }, status: "QUALIFIED" } }),
      prisma.employee.count({ where: { user: { organizationId: orgId } } }),
      prisma.audit.findMany({ where: { project: { organizationId: orgId } } }),
      prisma.issueDeviation.count({ where: { project: { organizationId: orgId }, status: { in: [IssueStatus.OPEN, IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS] } } }),
      prisma.capaRecord.count({ where: { issue: { project: { organizationId: orgId } }, status: { not: CapaStatus.VERIFIED_CLOSED } } }),
    ]);

    const pendingAudits = audits.filter((a) => a.status === "SCHEDULED" || a.status === "IN_PROGRESS").length;
    const completedAudits = audits.filter((a) => a.status === "COMPLETED");
    const failedAudits = completedAudits.filter((a) => a.passed === false).length;
    const auditPassRate = completedAudits.length > 0 ? Math.round(((completedAudits.length - failedAudits) / completedAudits.length) * 100) : 100;

    const quizPassRate = quizAttempts > 0 ? Math.round((passedQuizAttempts / quizAttempts) * 100) : 100;
    const assignmentCompletionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
    const workforceCompetencyRate = totalEmployees > 0 ? Math.round((qualifiedEmployees / totalEmployees) * 100) : 0;

    res.json({
      totalProjects,
      totalSops,
      effectiveSopVersions: activeVersionsCount,
      totalAssignments,
      assignmentCompletionRate,
      quizPassRate,
      qualifiedEmployees,
      workforceCompetencyRate,
      pendingAudits,
      failedAudits,
      auditPassRate,
      openIssues,
      openCapas,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.params.projectId as string;

    const [
      project,
      assignedSops,
      documents,
      issues,
      audits,
    ] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: { manager: { select: { fullName: true, email: true } } },
      }),
      prisma.projectSopMapping.findMany({
        where: { projectId },
        include: {
          sopVersion: {
            include: { sop: true },
          },
          assignedLead: { select: { fullName: true } },
        },
      }),
      prisma.projectDocument.findMany({ where: { projectId } }),
      prisma.issueDeviation.findMany({
        where: { projectId },
        include: { capa: true },
      }),
      prisma.audit.findMany({ where: { projectId } }),
    ]);

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const uploadedDocs = documents.filter((d) => d.status === "UPLOADED" || d.status === "VERIFIED").length;
    const openIssues = issues.filter((i) => i.status !== "CLOSED" && i.status !== "RESOLVED").length;
    const openCapas = issues.filter((i) => i.capa && i.capa.status !== CapaStatus.VERIFIED_CLOSED).length;

    res.json({
      project,
      sopsCount: assignedSops.length,
      assignedSops,
      documents: {
        total: documents.length,
        uploaded: uploadedDocs,
        pending: documents.length - uploadedDocs,
      },
      issues: {
        total: issues.length,
        open: openIssues,
        resolved: issues.length - openIssues,
      },
      capas: {
        open: openCapas,
      },
      audits: {
        total: audits.length,
        scheduled: audits.filter((a) => a.status === "SCHEDULED").length,
        completed: audits.filter((a) => a.status === "COMPLETED").length,
      },
    });
  } catch (error) {
    next(error);
  }
}
