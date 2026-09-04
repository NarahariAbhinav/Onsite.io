import { Response, NextFunction } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { CapaStatus, IssueStatus, Severity } from "@prisma/client";

export async function listIssues(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, severity, status } = req.query;

    const where: any = {};
    if (projectId && typeof projectId === "string" && projectId !== "All") {
      where.projectId = projectId;
    }
    if (severity && typeof severity === "string" && severity !== "All") {
      where.severity = severity as Severity;
    }
    if (status && typeof status === "string" && status !== "All") {
      where.status = status as IssueStatus;
    }

    const issues = await prisma.issueDeviation.findMany({
      where,
      include: {
        project: { select: { id: true, code: true, name: true } },
        sopVersion: {
          include: {
            sop: { select: { id: true, code: true, title: true } },
          },
        },
        reportedBy: { select: { id: true, fullName: true, email: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        capa: {
          include: {
            owner: { select: { id: true, fullName: true } },
            verifier: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(issues);
  } catch (error) {
    next(error);
  }
}

export async function getIssueById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const issue = await prisma.issueDeviation.findUnique({
      where: { id },
      include: {
        project: true,
        sopVersion: { include: { sop: true } },
        reportedBy: { select: { id: true, fullName: true, email: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        capa: {
          include: {
            owner: { select: { id: true, fullName: true } },
            verifier: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    if (!issue) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    res.json(issue);
  } catch (error) {
    next(error);
  }
}

export async function createIssue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, sopVersionId, title, description, severity, assignedToId, attachmentUrl } = req.body;

    const issue = await prisma.issueDeviation.create({
      data: {
        projectId,
        sopVersionId,
        title,
        description,
        severity: severity || Severity.HIGH,
        status: IssueStatus.OPEN,
        reportedById: req.user!.id,
        assignedToId: assignedToId || req.user!.id,
        attachmentUrl,
      },
      include: {
        project: true,
        reportedBy: { select: { id: true, fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
      },
    });

    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
}

export async function updateIssueStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status, assignedToId } = req.body;

    const updated = await prisma.issueDeviation.update({
      where: { id },
      data: {
        status: status as IssueStatus,
        assignedToId: assignedToId || undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

// 5-Stage CAPA Workflow Implementation (BRD Section 7.15)
export async function createOrUpdateCapa(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const issueId = req.params.issueId as string;
    const {
      containmentActions,
      rootCauseAnalysis,
      correctiveAction,
      preventiveAction,
      verificationNotes,
      verificationEvidence,
      status,
      ownerId,
      dueDate,
    } = req.body;

    let capaStatus = status as CapaStatus;
    if (!capaStatus) {
      if (verificationNotes) capaStatus = CapaStatus.VERIFIED_CLOSED;
      else if (correctiveAction || preventiveAction) capaStatus = CapaStatus.ACTION_TAKEN;
      else if (rootCauseAnalysis) capaStatus = CapaStatus.RCA_DONE;
      else if (containmentActions) capaStatus = CapaStatus.CONTAINMENT_DONE;
      else capaStatus = CapaStatus.OPEN;
    }

    const isClosing = capaStatus === CapaStatus.VERIFIED_CLOSED;

    const capa = await prisma.capaRecord.upsert({
      where: { issueId },
      create: {
        issueId,
        containmentActions,
        rootCauseAnalysis,
        correctiveAction,
        preventiveAction,
        verificationNotes,
        verificationEvidence,
        status: capaStatus,
        ownerId: ownerId || req.user!.id,
        verifierId: isClosing ? req.user!.id : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        closedAt: isClosing ? new Date() : undefined,
      },
      update: {
        containmentActions: containmentActions !== undefined ? containmentActions : undefined,
        rootCauseAnalysis: rootCauseAnalysis !== undefined ? rootCauseAnalysis : undefined,
        correctiveAction: correctiveAction !== undefined ? correctiveAction : undefined,
        preventiveAction: preventiveAction !== undefined ? preventiveAction : undefined,
        verificationNotes: verificationNotes !== undefined ? verificationNotes : undefined,
        verificationEvidence: verificationEvidence !== undefined ? verificationEvidence : undefined,
        status: capaStatus,
        ownerId: ownerId || undefined,
        verifierId: isClosing ? req.user!.id : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        closedAt: isClosing ? new Date() : undefined,
      },
    });

    if (isClosing) {
      await prisma.issueDeviation.update({
        where: { id: issueId },
        data: { status: IssueStatus.CLOSED },
      });
    } else {
      await prisma.issueDeviation.update({
        where: { id: issueId },
        data: { status: IssueStatus.IN_PROGRESS },
      });
    }

    res.json(capa);
  } catch (error) {
    next(error);
  }
}
