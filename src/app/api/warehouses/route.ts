import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromAuthHeader } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || undefined;
    const user = await getUserFromAuthHeader(authHeader);
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const warehouses = await prisma.$queryRaw`
      SELECT * FROM warehouses
      WHERE deleted_at IS NULL
    `;
    return NextResponse.json(warehouses);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
