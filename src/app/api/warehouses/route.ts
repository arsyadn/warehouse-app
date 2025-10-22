import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
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
