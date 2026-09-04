import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { ENV } from "../config/env.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { Role } from "@prisma/client";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.nativeEnum(Role).optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  organizationCode: z.string().default("SITEFLOW_ORG"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName, role, department, designation, organizationCode } = req.body;

    let org = await prisma.organization.findUnique({ where: { code: organizationCode } });
    if (!org) {
      org = await prisma.organization.create({
        data: {
          code: organizationCode,
          name: "SiteFlow Global Construction",
          industry: "Construction / Real Estate",
        },
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role || Role.EMPLOYEE_LEARNER;

    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        email,
        passwordHash,
        fullName,
        role: assignedRole,
        employeeProfile: {
          create: {
            employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
            department: department || "Civil",
            designation: designation || "Site Engineer",
          },
        },
      },
      include: { employeeProfile: true },
    });

    const signOptions: jwt.SignOptions = { expiresIn: "7d" as any };
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      ENV.JWT_SECRET,
      signOptions
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        employee: user.employeeProfile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employeeProfile: true, organization: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid credentials or inactive account" });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const signOptions: jwt.SignOptions = { expiresIn: "7d" as any };
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      ENV.JWT_SECRET,
      signOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization,
        employee: user.employeeProfile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { employeeProfile: true, organization: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organization: user.organization,
      employee: user.employeeProfile,
    });
  } catch (error) {
    next(error);
  }
}

export async function switchPersona(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.body;
    const targetUser = await prisma.user.findFirst({
      where: { role },
      include: { employeeProfile: true, organization: true },
    });

    if (!targetUser) {
      res.status(404).json({ error: `No seeded user found with role ${role}` });
      return;
    }

    const signOptions: jwt.SignOptions = { expiresIn: "7d" as any };
    const token = jwt.sign(
      {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        organizationId: targetUser.organizationId,
      },
      ENV.JWT_SECRET,
      signOptions
    );

    res.json({
      token,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        fullName: targetUser.fullName,
        role: targetUser.role,
        organization: targetUser.organization,
        employee: targetUser.employeeProfile,
      },
    });
  } catch (error) {
    next(error);
  }
}
