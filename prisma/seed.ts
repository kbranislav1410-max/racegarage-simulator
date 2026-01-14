import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌱 Starting database seed...");

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash("admin123!", 10);
  const hashedStaffPassword = await bcrypt.hash("staff123!", 10);

  // Create ADMIN user
  const admin = await prisma.user.upsert({
    where: { email: "admin@local.test" },
    update: {},
    create: {
      email: "admin@local.test",
      password: hashedAdminPassword,
      name: "Administrator",
      role: "ADMIN",
    },
  });
  console.log("✅ Created ADMIN user:", admin.email);

  // Create STAFF user
  const staff = await prisma.user.upsert({
    where: { email: "staff@local.test" },
    update: {},
    create: {
      email: "staff@local.test",
      password: hashedStaffPassword,
      name: "Staff Member",
      role: "STAFF",
    },
  });
  console.log("✅ Created STAFF user:", staff.email);

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
