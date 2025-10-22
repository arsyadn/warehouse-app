import { GET } from "../app/api/items/route";
import prisma from "../lib/prisma";

jest.mock("../lib/prisma", () => ({
  $queryRawUnsafe: jest.fn(),
}));

describe("GET /api/items", () => {
  it("should return items and pagination successfully", async () => {
    (prisma.$queryRawUnsafe as jest.Mock)
      .mockResolvedValueOnce([{ count: 2 }])
      .mockResolvedValueOnce([
        {
          id: 1,
          name: "Test Item",
          current_stock: 10,
          description: "Sample item",
          warehouse_id: 1,
        },
        {
          id: 2,
          name: "Another Item",
          current_stock: 5,
          description: "Second item",
          warehouse_id: 2,
        },
      ]);

    const req = new Request(
      "http://localhost/api/items?page=1&limit=5&search=test"
    );
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBe(2);
    expect(data.pagination.totalCount).toBe(2);
  });
});
