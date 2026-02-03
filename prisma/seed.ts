import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Create PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter (required for Prisma 7.x)
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Hash passwords
  const hashedSuperAdminPassword = await bcrypt.hash("superadmin123!", 10);
  const hashedAdminPassword = await bcrypt.hash("admin123!", 10);
  const hashedUserPassword = await bcrypt.hash("user123!", 10);

  // Create SUPER_ADMIN user
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@local.test" },
    update: {},
    create: {
      email: "superadmin@local.test",
      password: hashedSuperAdminPassword,
      name: "Super Administrator",
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Created SUPER_ADMIN user:", superAdmin.email);

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

  // Create USER
  const user = await prisma.user.upsert({
    where: { email: "user@local.test" },
    update: {},
    create: {
      email: "user@local.test",
      password: hashedUserPassword,
      name: "Regular User",
      role: "USER",
    },
  });
  console.log("✅ Created USER:", user.email);

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
