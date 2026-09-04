import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { Severity, SopLifecycleStatus } from "@prisma/client";

export const CreateSopSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(3),
  department: z.string().min(2),
  category: z.string().default("Civil Works"),
  sopType: z.string().default("Standard Operating Procedure"),
  process: z.string().default("General Execution"),
  criticality: z.nativeEnum(Severity).default(Severity.MEDIUM),
  reviewFrequencyMonths: z.number().default(12),
  purpose: z.string().optional(),
  scope: z.string().optional(),
  responsibilities: z.string().optional(),
  applicableIndustries: z.array(z.string()).default(["Construction / Infrastructure"]),
  applicableProjectTypes: z.array(z.string()).default(["High-Rise Residential", "Commercial EPC", "Plot Development"]),
  applicableRoles: z.array(z.string()).default(["Site Engineer", "Quality Inspector", "Safety Officer"]),
  inputs: z.string().optional(),
  materials: z.string().optional(),
  safetyPpe: z.string().optional(),
  expectedOutput: z.string().optional(),
  references: z.string().optional(),
  steps: z
    .array(
      z.object({
        stepNumber: z.number(),
        title: z.string().min(2),
        instructions: z.string().min(2),
        mediaUrl: z.string().optional(),
      })
    )
    .min(1),
});

export const ReviseSopSchema = z.object({
  revisionReason: z.string().min(5),
  changeSummary: z.string().min(5),
  inputs: z.string().optional(),
  materials: z.string().optional(),
  safetyPpe: z.string().optional(),
  expectedOutput: z.string().optional(),
  references: z.string().optional(),
  steps: z
    .array(
      z.object({
        stepNumber: z.number(),
        title: z.string().min(2),
        instructions: z.string().min(2),
        mediaUrl: z.string().optional(),
      })
    )
    .min(1),
});

export async function listSops(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { department, search } = req.query;

    const where: any = {
      organizationId: req.user!.organizationId,
    };

    if (department && typeof department === "string" && department !== "All") {
      where.department = { equals: department, mode: "insensitive" };
    }

    if (search && typeof search === "string") {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const sops = await prisma.sop.findMany({
      where,
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        currentVersion: {
          include: {
            steps: { orderBy: { stepNumber: "asc" } },
            quizzes: true,
            assessments: true,
            _count: {
              select: { projectMappings: true },
            },
          },
        },
        versions: {
          select: {
            id: true,
            versionNumber: true,
            lifecycleStatus: true,
            effectiveDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(sops);
  } catch (error) {
    next(error);
  }
}

export async function getSopById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const sop = await prisma.sop.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, email: true } },
        currentVersion: {
          include: {
            steps: { orderBy: { stepNumber: "asc" } },
            quizzes: {
              include: { questions: true },
            },
            assessments: true,
            auditTemplates: {
              include: { checkpoints: true },
            },
            projectMappings: {
              include: {
                project: { select: { id: true, code: true, name: true, location: true } },
                assignedLead: { select: { id: true, fullName: true } },
              },
            },
          },
        },
        versions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!sop) {
      res.status(404).json({ error: "SOP not found" });
      return;
    }

    res.json(sop);
  } catch (error) {
    next(error);
  }
}

export async function createSop(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      code,
      title,
      department,
      category,
      sopType,
      process,
      criticality,
      reviewFrequencyMonths,
      purpose,
      scope,
      responsibilities,
      applicableIndustries,
      applicableProjectTypes,
      applicableRoles,
      inputs,
      materials,
      safetyPpe,
      expectedOutput,
      references,
      steps,
    } = req.body;

    const existing = await prisma.sop.findUnique({ where: { code } });
    if (existing) {
      res.status(409).json({ error: "SOP with this code already exists" });
      return;
    }

    const sop = await prisma.$transaction(async (tx) => {
      const newSop = await tx.sop.create({
        data: {
          organizationId: req.user!.organizationId,
          code,
          title,
          department,
          category: category || "Civil Works",
          sopType: sopType || "Standard Operating Procedure",
          process: process || "General Execution",
          criticality,
          reviewFrequencyMonths: reviewFrequencyMonths || 12,
          purpose: purpose || null,
          scope: scope || null,
          responsibilities: responsibilities || null,
          applicableIndustries: applicableIndustries || ["Construction / Infrastructure"],
          applicableProjectTypes: applicableProjectTypes || ["High-Rise Residential", "Commercial EPC", "Plot Development"],
          applicableRoles: applicableRoles || ["Site Engineer", "Quality Inspector", "Safety Officer"],
          ownerId: req.user!.id,
        },
      });

      const initialVersion = await tx.sopVersion.create({
        data: {
          sopId: newSop.id,
          versionNumber: "V1.0",
          lifecycleStatus: SopLifecycleStatus.EFFECTIVE,
          inputs: inputs || null,
          materials: materials || null,
          safetyPpe: safetyPpe || null,
          expectedOutput: expectedOutput || null,
          references: references || null,
          createdById: req.user!.id,
          effectiveDate: new Date(),
          steps: {
            create: steps.map((st: any, i: number) => ({
              stepNumber: st.stepNumber || i + 1,
              title: st.title,
              instructions: st.instructions,
              mediaUrl: st.mediaUrl || null,
            })),
          },
        },
      });

      return tx.sop.update({
        where: { id: newSop.id },
        data: { currentVersionId: initialVersion.id },
        include: {
          currentVersion: {
            include: { steps: true },
          },
        },
      });
    });

    res.status(201).json(sop);
  } catch (error) {
    next(error);
  }
}

// Lifecycle State Transitions
export async function transitionLifecycle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const versionId = req.params.versionId as string;
    const { targetStatus, remarks } = req.body;

    const version = await prisma.sopVersion.findUnique({ where: { id: versionId } });
    if (!version) {
      res.status(404).json({ error: "SOP version not found" });
      return;
    }

    const updates: any = {
      lifecycleStatus: targetStatus as SopLifecycleStatus,
    };

    if (targetStatus === SopLifecycleStatus.IN_REVIEW) {
      updates.reviewedById = req.user!.id;
    } else if (targetStatus === SopLifecycleStatus.APPROVED) {
      updates.approvedById = req.user!.id;
    } else if (targetStatus === SopLifecycleStatus.EFFECTIVE) {
      updates.effectiveDate = new Date();
      await prisma.sop.update({
        where: { id: version.sopId },
        data: { currentVersionId: version.id },
      });
    }

    const updated = await prisma.sopVersion.update({
      where: { id: versionId },
      data: updates,
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        userEmail: req.user!.email,
        action: `TRANSITION_SOP_LIFECYCLE_${targetStatus}`,
        entityType: "SopVersion",
        entityId: versionId,
        details: remarks || `Transitioned from ${version.lifecycleStatus} to ${targetStatus}`,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

// Revise SOP -> creates new version e.g. V2.0 preserving historical V1.0
export async function reviseSop(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { revisionReason, changeSummary, steps } = req.body;

    const sop = await prisma.sop.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!sop) {
      res.status(404).json({ error: "SOP not found" });
      return;
    }

    const latestVersion = sop.versions[0];
    const currentMajor = latestVersion ? parseInt(latestVersion.versionNumber.replace("V", "").split(".")[0] || "1", 10) : 1;
    const nextVersionNumber = `V${currentMajor + 1}.0`;

    const newVersion = await prisma.$transaction(async (tx) => {
      const v = await tx.sopVersion.create({
        data: {
          sopId: sop.id,
          versionNumber: nextVersionNumber,
          lifecycleStatus: SopLifecycleStatus.EFFECTIVE,
          revisionReason,
          changeSummary,
          createdById: req.user!.id,
          effectiveDate: new Date(),
          steps: {
            create: steps.map((st: any, i: number) => ({
              stepNumber: st.stepNumber || i + 1,
              title: st.title,
              instructions: st.instructions,
              mediaUrl: st.mediaUrl || null,
            })),
          },
        },
        include: { steps: true },
      });

      await tx.sop.update({
        where: { id: sop.id },
        data: { currentVersionId: v.id },
      });

      return v;
    });

    res.status(201).json(newVersion);
  } catch (error) {
    next(error);
  }
}

// Assign SOP Version to a Project
export async function assignSopToProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, sopVersionId, assignedLeadId, dueDate, previousSopId } = req.body;

    const mapping = await prisma.projectSopMapping.create({
      data: {
        projectId,
        sopVersionId,
        assignedLeadId: assignedLeadId || req.user!.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        previousSopId,
      },
      include: {
        sopVersion: {
          include: { sop: true },
        },
        project: true,
        assignedLead: { select: { id: true, fullName: true } },
      },
    });

    res.status(201).json(mapping);
  } catch (error) {
    next(error);
  }
}

// Blast-Radius Operational Impact Analysis
export async function getSopBlastRadius(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const sop = await prisma.sop.findUnique({
      where: { id },
      include: {
        currentVersion: {
          include: {
            projectMappings: {
              include: {
                project: {
                  select: { id: true, name: true, code: true, location: true, status: true },
                },
                assignedLead: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
            assignments: {
              select: { id: true, employeeId: true, status: true },
            },
            audits: {
              select: { id: true, status: true, scheduledDate: true },
            },
          },
        },
      },
    });

    if (!sop) {
      res.status(404).json({ error: "SOP not found" });
      return;
    }

    const mappings = sop.currentVersion?.projectMappings || [];
    const totalActiveWorkers = sop.currentVersion?.assignments.length || 0;
    const scheduledAuditsCount = (sop.currentVersion?.audits || []).filter((a) => a.status === "SCHEDULED").length;

    res.json({
      sopId: sop.id,
      sopCode: sop.code,
      sopTitle: sop.title,
      currentVersion: sop.currentVersion?.versionNumber || "V1.0",
      totalProjects: mappings.length,
      totalActiveWorkers,
      scheduledAuditsCount,
      projects: mappings.map((m) => ({
        projectId: m.project.id,
        projectName: m.project.name,
        projectCode: m.project.code,
        location: m.project.location,
        assignedLead: m.assignedLead.fullName,
        dueDate: m.dueDate,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// Batch Map SOP Master to Multiple Projects
export async function batchAssignSopToProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sopId, projectIds, dueDate } = req.body;
    const sop = await prisma.sop.findUnique({
      where: { id: sopId },
      include: { currentVersion: true },
    });

    if (!sop || !sop.currentVersionId) {
      res.status(404).json({ error: "SOP or effective version not found" });
      return;
    }

    const results = await prisma.$transaction(
      projectIds.map((projectId: string) =>
        prisma.projectSopMapping.upsert({
          where: {
            projectId_sopVersionId: {
              projectId,
              sopVersionId: sop.currentVersionId!,
            },
          },
          create: {
            projectId,
            sopVersionId: sop.currentVersionId!,
            assignedLeadId: req.user!.id,
            dueDate: dueDate ? new Date(dueDate) : null,
          },
          update: {
            dueDate: dueDate ? new Date(dueDate) : undefined,
          },
        })
      )
    );

    res.status(201).json({ count: results.length, mappings: results });
  } catch (error) {
    next(error);
  }
}

export async function deleteSop(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.sop.delete({ where: { id } });
    res.json({ message: "SOP deleted successfully" });
  } catch (error) {
    next(error);
  }
}
