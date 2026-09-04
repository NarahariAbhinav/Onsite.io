import { Response, NextFunction } from "express";
import { prisma } from "../config/db.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { DocumentStatus } from "@prisma/client";

export async function listDocumentMasters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const masters = await prisma.documentMaster.findMany({
      orderBy: { name: "asc" },
    });
    res.json(masters);
  } catch (error) {
    next(error);
  }
}

export async function listProjectDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, sopVersionId, status } = req.query;

    const where: any = {};
    if (projectId && typeof projectId === "string") where.projectId = projectId;
    if (sopVersionId && typeof sopVersionId === "string") where.sopVersionId = sopVersionId;
    if (status && typeof status === "string" && status !== "All") where.status = status as DocumentStatus;

    const docs = await prisma.projectDocument.findMany({
      where,
      include: {
        documentMaster: true,
        project: { select: { id: true, code: true, name: true } },
        sopVersion: { include: { sop: { select: { id: true, title: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(docs);
  } catch (error) {
    next(error);
  }
}

export async function createProjectDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      projectId,
      documentMasterId,
      sopVersionId,
      documentName,
      fileName,
      fileUrl,
      assignedReviewer,
      dueDate,
      isRequired,
    } = req.body;

    const doc = await prisma.projectDocument.create({
      data: {
        projectId,
        documentMasterId,
        sopVersionId,
        documentName,
        fileName,
        fileUrl,
        uploadedById: fileUrl ? req.user!.id : undefined,
        assignedReviewer,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isRequired: isRequired !== undefined ? isRequired : true,
        status: fileUrl ? DocumentStatus.UPLOADED : DocumentStatus.PENDING,
      },
      include: { documentMaster: true },
    });

    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
}

export async function uploadDocumentFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { fileName, fileUrl } = req.body;

    const updated = await prisma.projectDocument.update({
      where: { id },
      data: {
        fileName,
        fileUrl,
        uploadedById: req.user!.id,
        status: DocumentStatus.UPLOADED,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function verifyDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { approved } = req.body;

    const updated = await prisma.projectDocument.update({
      where: { id },
      data: {
        status: approved ? DocumentStatus.VERIFIED : DocumentStatus.REJECTED,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}
