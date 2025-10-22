// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding roles and admin user...");

  await prisma.role.createMany({
    data: [
      { name: "Admin", description: "Full access" },
      { name: "Staff", description: "Create & Read only" },
    ],
    skipDuplicates: true,
  });

  const pwHash = await bcrypt.hash("adminpass", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@gmail.com",
      password_hash: pwHash,
      role: { connect: { name: "Admin" } },
    },
  });

  await prisma.warehouse.createMany({
    data: [
      { name: "Main Warehouse", location: "Jakarta" },
      { name: "Secondary Warehouse", location: "Bandung" },
    ],
    skipDuplicates: true,
  });

  await prisma.item.createMany({
    data: [
      {
        name: "Mouse Logitech",
        description: "Wireless mouse",
        current_stock: 100,
      },
      {
        name: "Keyboard Rexus",
        description: "Mechanical keyboard",
        current_stock: 50,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
