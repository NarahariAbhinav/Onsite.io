import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { ENV } from "./config/env.js";

export const app = express();

// Global Middlewares
app.use(
  cors({
    origin: [ENV.CLIENT_URL, "http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Healthcheck Route
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "SiteFlow Digital SOP Platform Backend",
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1 Routes
app.use("/api/v1", apiRoutes);

// Global Error Handler
app.use(errorHandler);
