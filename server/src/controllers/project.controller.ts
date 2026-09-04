import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { ProjectStatus } from "@prisma/client";

export const CreateProjectSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
  projectType: z.string().default("High-Rise Residential"),
  client: z.string().optional(),
  location: z.string().min(2),
  lat: z.number().default(0),
  lng: z.number().default(0),
  areaAcres: z.number().default(0),
  floors: z.number().default(1),
  flats: z.number().default(1),
  amenities: z.array(z.string()).default([]),
  startDate: z.string().datetime().or(z.string()),
  endDate: z.string().datetime().or(z.string()),
  managerId: z.string().optional(),
});

export async function listProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search } = req.query;

    const where: any = {
      organizationId: req.user!.organizationId,
    };

    if (status && typeof status === "string" && status !== "All") {
      where.status = status as ProjectStatus;
    }

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        manager: { select: { id: true, fullName: true, email: true } },
        sops: {
          include: {
            sopVersion: {
              include: {
                sop: true,
                steps: true,
              },
            },
          },
        },
        _count: {
          select: {
            documents: true,
            issues: true,
            audits: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, fullName: true, email: true } },
        sops: {
          include: {
            assignedLead: { select: { id: true, fullName: true, email: true } },
            sopVersion: {
              include: {
                sop: true,
                steps: { orderBy: { stepNumber: "asc" } },
                quizzes: true,
                assessments: true,
              },
            },
          },
        },
        documents: {
          include: {
            documentMaster: true,
          },
          orderBy: { createdAt: "desc" },
        },
        issues: {
          include: {
            reportedBy: { select: { id: true, fullName: true } },
            assignedTo: { select: { id: true, fullName: true } },
            capa: true,
          },
          orderBy: { createdAt: "desc" },
        },
        audits: {
          include: {
            auditor: { select: { id: true, fullName: true } },
            findings: true,
          },
          orderBy: { scheduledDate: "desc" },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body;

    const project = await prisma.project.create({
      data: {
        organizationId: req.user!.organizationId,
        code: data.code,
        name: data.name,
        projectType: data.projectType,
        client: data.client,
        location: data.location,
        lat: data.lat,
        lng: data.lng,
        areaAcres: data.areaAcres,
        floors: data.floors,
        flats: data.flats,
        amenities: data.amenities,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        managerId: data.managerId || req.user!.id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = req.body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.project.delete({ where: { id } });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
}
