import { Router } from "express";
import {
  listAudits,
  scheduleAudit,
  submitAuditExecution,
} from "../controllers/audit.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

router.use(authenticateToken);

router.get("/", listAudits);
router.post(
  "/schedule",
  requireRole([Role.SYSTEM_ADMIN, Role.QUALITY_MANAGER, Role.PROJECT_MANAGER]),
  scheduleAudit
);
router.post(
  "/:auditId/execute",
  requireRole([Role.SYSTEM_ADMIN, Role.AUDITOR, Role.QUALITY_MANAGER]),
  submitAuditExecution
);

export default router;
