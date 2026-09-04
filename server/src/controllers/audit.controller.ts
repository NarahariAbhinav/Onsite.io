import { Response, NextFunction } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { AuditStatus, IssueStatus, Severity } from "@prisma/client";

export async function listAudits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, status } = req.query;

    const where: any = {};
    if (projectId && typeof projectId === "string") {
      where.projectId = projectId;
    }
    if (status && typeof status === "string" && status !== "All") {
      where.status = status as AuditStatus;
    }

    const audits = await prisma.audit.findMany({
      where,
      include: {
        project: { select: { id: true, code: true, name: true } },
        sopVersion: {
          include: {
            sop: { select: { id: true, code: true, title: true, department: true } },
          },
        },
        auditor: { select: { id: true, fullName: true, email: true } },
        findings: true,
        issues: true,
      },
      orderBy: { scheduledDate: "desc" },
    });

    res.json(audits);
  } catch (error) {
    next(error);
  }
}

export async function scheduleAudit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, sopVersionId, auditorId, scheduledDate } = req.body;

    const audit = await prisma.audit.create({
      data: {
        projectId,
        sopVersionId,
        auditorId: auditorId || req.user!.id,
        scheduledDate: new Date(scheduledDate),
        status: AuditStatus.SCHEDULED,
      },
      include: {
        project: true,
        sopVersion: { include: { sop: true } },
        auditor: { select: { id: true, fullName: true } },
      },
    });

    res.status(201).json(audit);
  } catch (error) {
    next(error);
  }
}

export async function submitAuditExecution(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const auditId = req.params.auditId as string;
    const { remarks, findings } = req.body; // findings: Array<{ checkpointId, passed, observation, severity, photoUrl }>

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { project: true, sopVersion: { include: { sop: true } } },
    });

    if (!audit) {
      res.status(404).json({ error: "Audit record not found" });
      return;
    }

    const totalPoints = findings.length;
    let passedPoints = 0;

    const result = await prisma.$transaction(async (tx) => {
      for (const f of findings) {
        if (f.passed) {
          passedPoints++;
        }

        const finding = await tx.auditFinding.create({
          data: {
            auditId,
            checkpointId: f.checkpointId,
            passed: f.passed,
            observation: f.observation || (f.passed ? "Compliant with standard" : "Non-conformance observed on site"),
            severity: f.severity || Severity.MEDIUM,
            photoUrl: f.photoUrl || null,
          },
        });

        if (!f.passed) {
          await tx.issueDeviation.create({
            data: {
              projectId: audit.projectId,
              sopVersionId: audit.sopVersionId,
              auditId: audit.id,
              auditFindingId: finding.id,
              title: `Audit Deviation: Non-conformance in ${audit.sopVersion.sop.title}`,
              description: f.observation || "Failed audit checkpoint control requirements",
              severity: f.severity || Severity.HIGH,
              status: IssueStatus.OPEN,
              reportedById: req.user!.id,
              assignedToId: req.user!.id,
              attachmentUrl: f.photoUrl || null,
            },
          });
        }
      }

      const overallScore = totalPoints > 0 ? Math.round((passedPoints / totalPoints) * 100) : 100;
      const passed = overallScore >= 80;

      return tx.audit.update({
        where: { id: auditId },
        data: {
          actualDate: new Date(),
          status: AuditStatus.COMPLETED,
          overallScore,
          passed,
          remarks,
        },
        include: {
          findings: true,
          issues: true,
        },
      });
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}
