import { Router } from "express";
import { register, login, getMe, switchPersona, RegisterSchema, LoginSchema } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/register", validateBody(RegisterSchema), register);
router.post("/login", validateBody(LoginSchema), login);
router.post("/switch-persona", switchPersona);
router.get("/me", authenticateToken, getMe);

export default router;
