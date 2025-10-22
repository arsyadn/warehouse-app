import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { verifyPassword } from "../../../../lib/hash";
import { signToken } from "../../../../lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password)
      return NextResponse.json(
        { error: "email and password required" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role.name,
    });

    return NextResponse.json({
      token,
      user: {
        username: user.username,
        role: user.role.name,
        email: user.email,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Login failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
