import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromAuthHeader } from "../../../lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 5;
  const search = searchParams.get("search") || "";

  const offset = (page - 1) * limit;

  try {
    const authHeader = req.headers.get("authorization") || undefined;
    const user = await getUserFromAuthHeader(authHeader);
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // count total items
    const countResult = await prisma.$queryRawUnsafe<{ count: number }[]>(
      `
      SELECT COUNT(*) as count
      FROM items
      WHERE deleted_at IS NULL
        AND LOWER(name) LIKE LOWER(?)
      `,
      `%${search}%`
    );

    const totalCount = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    // fetch paginated items
    const items = await prisma.$queryRawUnsafe(
      `
      SELECT id, name, current_stock, description, warehouse_id
      FROM items
      WHERE deleted_at IS NULL
        AND LOWER(name) LIKE LOWER(?)
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
      `,
      `%${search}%`,
      limit,
      offset
    );

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || undefined;
    const user = await getUserFromAuthHeader(authHeader);
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { name, description, currentStock = 0, warehouseId } = body;

    if (!name || !warehouseId || currentStock <= 0)
      return NextResponse.json(
        { error: "name & warehouseId & currentStock required" },
        { status: 400 }
      );

    const item = await prisma.item.create({
      data: {
        name,
        description,
        current_stock: Number(currentStock),
        warehouse_id: Number(warehouseId),
      },
    });

    await prisma.stockMovement.create({
      data: {
        item_id: item.id,
        warehouse_id: Number(warehouseId),
        user_id: user.id,
        movement_type: "IN",
        quantity: Number(currentStock),
        created_at: new Date(),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Create failed",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
