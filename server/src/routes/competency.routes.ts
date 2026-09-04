import { Router } from "express";
import {
  getQuizForSop,
  submitQuizAttempt,
  resetQuizAttempts,
  getAssessmentTemplate,
  submitAssessment,
  evaluateAssessment,
  getMySops,
} from "../controllers/competency.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

router.use(authenticateToken);

// Learner portal
router.get("/my-sops", getMySops);

// Quizzes
router.get("/quizzes/:sopVersionId", getQuizForSop);
router.post("/quizzes/:quizId/submit", submitQuizAttempt);
router.post("/quizzes/reset-attempts", requireRole([Role.SYSTEM_ADMIN, Role.QUALITY_MANAGER]), resetQuizAttempts);

// Practical / Simulation Assessments
router.get("/assessments/:sopVersionId", getAssessmentTemplate);
router.post("/assessments/:assessmentTemplateId/submit", submitAssessment);
router.post("/assessments/submissions/:submissionId/evaluate", requireRole([Role.SYSTEM_ADMIN, Role.QUALITY_MANAGER]), evaluateAssessment);

export default router;
