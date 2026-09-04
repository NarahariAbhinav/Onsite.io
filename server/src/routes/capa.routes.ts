import { Router } from "express";
import {
  listIssues,
  getIssueById,
  createIssue,
  updateIssueStatus,
  createOrUpdateCapa,
} from "../controllers/capa.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/issues", listIssues);
router.get("/issues/:id", getIssueById);
router.post("/issues", createIssue);
router.patch("/issues/:id/status", updateIssueStatus);
router.post("/issues/:issueId/capa", createOrUpdateCapa);

export default router;
