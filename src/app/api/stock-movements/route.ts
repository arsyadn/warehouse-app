import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromAuthHeader } from "../../../lib/auth";

interface StockMovementRecord {
  id: number;
  type: string;
  quantity: number;
  created_at: Date;
  item_name: string | null;
  user_name: string | null;
  warehouse_name: string | null;
  warehouse_location: string | null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const authHeader = req.headers.get("authorization") || undefined;
    const user = await getUserFromAuthHeader(authHeader);
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role.name !== "Admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const totalCountResult = await prisma.$queryRaw<
      { count: bigint }[]
    >`SELECT COUNT(*) AS count FROM stock_movements`;
    const totalCount = Number(totalCountResult[0]?.count || 0);

    const movements = await prisma.$queryRaw<StockMovementRecord[]>`
      SELECT 
        sm.id,
        sm.movement_type AS type,
        sm.quantity,
        sm.created_at,
        i.name AS item_name,
        u.username AS user_name,
        w.name AS warehouse_name,
        w.location AS warehouse_location
      FROM stock_movements sm
      LEFT JOIN items i ON sm.item_id = i.id
      LEFT JOIN users u ON sm.user_id = u.id
      LEFT JOIN warehouses w ON sm.warehouse_id = w.id
      ORDER BY sm.created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    return NextResponse.json({
      data: movements,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Failed to fetch stock movements",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
