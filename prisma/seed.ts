import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@societytracker.local";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Admin@12345", 12);

    await prisma.user.create({
      data: {
        name: "Society Admin",
        email: adminEmail,
        password: passwordHash,
        role: Role.ADMIN,
      },
    });
  }

  const configCount = await prisma.config.count();
  if (configCount === 0) {
    await prisma.config.create({
      data: {
        overdueDays: 7,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
