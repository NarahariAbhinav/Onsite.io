import { Router } from "express";
import {
  listSops,
  getSopById,
  getSopBlastRadius,
  batchAssignSopToProjects,
  createSop,
  transitionLifecycle,
  reviseSop,
  assignSopToProject,
  deleteSop,
  CreateSopSchema,
  ReviseSopSchema,
} from "../controllers/sop.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

router.use(authenticateToken);

router.get("/", listSops);
router.get("/:id", getSopById);
router.get("/:id/blast-radius", getSopBlastRadius);
router.post(
  "/batch-assign",
  requireRole([Role.SYSTEM_ADMIN, Role.PROJECT_MANAGER, Role.QUALITY_MANAGER]),
  batchAssignSopToProjects
);
router.post(
  "/",
  requireRole([Role.SYSTEM_ADMIN, Role.SOP_OWNER, Role.QUALITY_MANAGER]),
  validateBody(CreateSopSchema),
  createSop
);
router.post(
  "/versions/:versionId/transition",
  requireRole([Role.SYSTEM_ADMIN, Role.SOP_OWNER, Role.REVIEWER, Role.APPROVER, Role.QUALITY_MANAGER]),
  transitionLifecycle
);
router.post(
  "/:id/revise",
  requireRole([Role.SYSTEM_ADMIN, Role.SOP_OWNER, Role.QUALITY_MANAGER]),
  validateBody(ReviseSopSchema),
  reviseSop
);
router.post(
  "/assign-project",
  requireRole([Role.SYSTEM_ADMIN, Role.PROJECT_MANAGER, Role.QUALITY_MANAGER]),
  assignSopToProject
);
router.delete(
  "/:id",
  requireRole([Role.SYSTEM_ADMIN, Role.SOP_OWNER]),
  deleteSop
);

export default router;
