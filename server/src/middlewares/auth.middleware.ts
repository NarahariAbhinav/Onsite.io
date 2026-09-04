import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { prisma } from "../config/db.js";
import { Role } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    organizationId: string;
    employeeId?: string | null;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token missing or malformed" });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      id: string;
      email: string;
      role: Role;
      organizationId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { employeeProfile: true },
    });

    if (!user || !user.isActive) {
      res.status(403).json({ error: "Account inactive or unauthorized" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organizationId: user.organizationId,
      employeeId: user.employeeProfile?.id ?? null,
    };

    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: Please login" });
      return;
    }

    if (req.user.role === Role.SYSTEM_ADMIN || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({
      error: `Access forbidden: Required role [${allowedRoles.join(", ")}], current role is ${req.user.role}`,
    });
  };
}
