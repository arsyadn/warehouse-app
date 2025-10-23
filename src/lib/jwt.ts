import jwt, { SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET_KEY || "dev-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export function signToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as SignOptions);
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    return jwt.verify(token, SECRET) as Record<string, unknown>;
  } catch (e) {
    return null;
  }
}
