import { Router } from "express";
import authRoutes from "./auth.routes.js";
import projectRoutes from "./project.routes.js";
import sopRoutes from "./sop.routes.js";
import competencyRoutes from "./competency.routes.js";
import auditRoutes from "./audit.routes.js";
import capaRoutes from "./capa.routes.js";
import documentRoutes from "./document.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/sops", sopRoutes);
router.use("/competency", competencyRoutes);
router.use("/audits", auditRoutes);
router.use("/capa", capaRoutes);
router.use("/documents", documentRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
