import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const db = prisma;
const createPrismaClient = () => new PrismaClient();

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};



if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
