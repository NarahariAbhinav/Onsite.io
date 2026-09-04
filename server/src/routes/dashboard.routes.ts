import { Router } from "express";
import {
  getManagementDashboard,
  getProjectDashboard,
} from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/management", getManagementDashboard);
router.get("/project/:projectId", getProjectDashboard);

export default router;
