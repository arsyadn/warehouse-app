// src/lib/auth.ts
import prisma from "./prisma";
import { verifyToken } from "./jwt";

export type AuthUser = {
  id: number;
  username: string;
  role: { id: number; name: string };
};

export async function getUserFromAuthHeader(
  authorization?: string
): Promise<AuthUser | null> {
  if (!authorization) return null;
  const parts = authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  const token = parts[1];
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: Number(decoded.id) },
    include: { role: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    role: { id: user.role.id, name: user.role.name },
  };
}
