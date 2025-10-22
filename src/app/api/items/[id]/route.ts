import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromAuthHeader } from "../../../../lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: Number(params.id) },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization") || undefined;
    const user = await getUserFromAuthHeader(authHeader);
    if (!user || user.role.name !== "Admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, currentStock, description, warehouseId } = body;

    const existing = await prisma.item.findUnique({
      where: { id: Number(params.id) },
    });
    if (!existing)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const updated = await prisma.item.update({
      where: { id: Number(params.id) },
      data: {
        name,
        current_stock: currentStock,
        description,
        updated_at: new Date(),
        warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      },
    });

    if (currentStock !== existing.current_stock && warehouseId) {
      const diff = currentStock - existing.current_stock;
      await prisma.stockMovement.create({
        data: {
          item_id: updated.id,
          warehouse_id: Number(warehouseId),
          user_id: user.id,
          movement_type: "ADJUSTMENT",
          quantity: diff,
          created_at: new Date(),
        },
      });
    }

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Update failed", details: errorMessage },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouse");
    const authHeader = req.headers.get("authorization") || undefined;
    const user = await getUserFromAuthHeader(authHeader);
    if (!user || user.role.name !== "Admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const item = await prisma.item.update({
      where: { id: Number(params.id) },
      data: { deleted_at: new Date() },
    });

    await prisma.stockMovement.create({
      data: {
        item_id: item.id,
        warehouse_id: Number(warehouseId),
        user_id: user.id,
        movement_type: "DELETE",
        quantity: item.current_stock,
        created_at: new Date(),
      },
    });

    return NextResponse.json({ message: "Item deleted" });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Delete failed", details: errorMessage },
      { status: 500 }
    );
  }
}
