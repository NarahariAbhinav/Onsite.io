import { PrismaClient } from "@prisma/client";
import { ENV } from "./env.js";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: ENV.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (ENV.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
