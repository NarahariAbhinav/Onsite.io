import { Router } from "express";
import {
  listDocumentMasters,
  listProjectDocuments,
  createProjectDocument,
  uploadDocumentFile,
  verifyDocument,
} from "../controllers/document.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

router.use(authenticateToken);

router.get("/masters", listDocumentMasters);
router.get("/project-docs", listProjectDocuments);
router.post("/project-docs", createProjectDocument);
router.patch("/project-docs/:id/upload", uploadDocumentFile);
router.patch("/project-docs/:id/verify", requireRole([Role.SYSTEM_ADMIN, Role.QUALITY_MANAGER]), verifyDocument);

export default router;
