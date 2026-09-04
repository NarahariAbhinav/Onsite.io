import { Router } from "express";
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  CreateProjectSchema,
} from "../controllers/project.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

router.use(authenticateToken);

router.get("/", listProjects);
router.get("/:id", getProjectById);
router.post("/", requireRole([Role.SYSTEM_ADMIN, Role.PROJECT_MANAGER, Role.QUALITY_MANAGER]), validateBody(CreateProjectSchema), createProject);
router.put("/:id", requireRole([Role.SYSTEM_ADMIN, Role.PROJECT_MANAGER, Role.QUALITY_MANAGER]), updateProject);
router.delete("/:id", requireRole([Role.SYSTEM_ADMIN, Role.PROJECT_MANAGER]), deleteProject);

export default router;
