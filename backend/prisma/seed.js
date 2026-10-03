import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CafeService } from "../src/services/cafeService.js";
import { ProductService } from "../src/services/productService.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Champions Club database...");

  const clubId = "CLUB-1791026171222";
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Ensure Club exists
  let club = await prisma.club.findUnique({ where: { clubId } });
  if (!club) {
    club = await prisma.club.create({
      data: {
        clubId,
        name: "Champions Sports Club",
        address: "742 Evergreen Terrace, Sector 4",
        email: "contact@championsclub.com",
        phone: "+91 98765 43210",
        website: "https://championsclub.com",
        sport: "All Sports & Fitness",
        country: "India",
        isActive: true,
      },
    });
    console.log("Created club:", club.name);
  }

  // 2. Ensure Module Configuration
  const existingConfig = await prisma.moduleConfiguration.findUnique({ where: { clubId } });
  if (!existingConfig) {
    await prisma.moduleConfiguration.create({
      data: {
        clubId,
        membership: true,
        courtBooking: true,
        shop: true,
        bar: true,
        hr: true,
        accounting: true,
      },
    });
    console.log("Created module configurations");
  }

  // 3. Ensure Standard Users
  const usersToSeed = [
    { email: "pateludit080@gmail.com", name: "Udit Patel", role: "SUPER_ADMIN" },
    { email: "admin@championsclub.com", name: "Club Director", role: "SUPER_ADMIN" },
    { email: "ramesh.inv@skylinesports.com", name: "Ramesh Sharma", role: "SHOP_INVENTORY_MANAGER" },
    { email: "kaif@gmail.com", name: "Kaif Ansari", role: "RECEPTIONIST" },
    { email: "bar.manager@championsclub.com", name: "Arjun Verma", role: "BAR_CAFETERIA_STAFF" },
  ];

  for (const u of usersToSeed) {
    const existing = await prisma.user.findFirst({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          userId: `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          clubId,
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          isActive: true,
        },
      });
      console.log(`Created user: ${u.email} (${u.role})`);
    }
  }

  // 4. Initialize Staff Table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      employee_id VARCHAR(100) UNIQUE NOT NULL,
      club_id VARCHAR(100) NOT NULL,
      user_id VARCHAR(100),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      department VARCHAR(100) NOT NULL,
      designation VARCHAR(100) NOT NULL,
      phone VARCHAR(20) DEFAULT '',
      shift VARCHAR(50) DEFAULT 'Morning (06:00 AM - 02:00 PM)',
      salary NUMERIC(10, 2) DEFAULT 35000,
      wage_type VARCHAR(20) DEFAULT 'MONTHLY',
      status VARCHAR(20) DEFAULT 'Active',
      leave_balance_casual INT DEFAULT 12,
      leave_balance_sick INT DEFAULT 8,
      leave_balance_annual INT DEFAULT 15,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS employee_leaves (
      id SERIAL PRIMARY KEY,
      leave_id VARCHAR(100) UNIQUE NOT NULL,
      club_id VARCHAR(100) NOT NULL,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(100) NOT NULL,
      employee_email VARCHAR(100) NOT NULL,
      department VARCHAR(100) NOT NULL,
      leave_type VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days_count INT NOT NULL,
      reason TEXT,
      status VARCHAR(20) DEFAULT 'PENDING',
      rejection_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS employee_payslips (
      id SERIAL PRIMARY KEY,
      payslip_id VARCHAR(100) UNIQUE NOT NULL,
      club_id VARCHAR(100) NOT NULL,
      employee_id VARCHAR(100) NOT NULL,
      employee_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      department VARCHAR(100) NOT NULL,
      month VARCHAR(50) NOT NULL,
      pay_period VARCHAR(100) NOT NULL,
      basic_salary NUMERIC(10, 2) NOT NULL,
      allowances NUMERIC(10, 2) DEFAULT 0,
      deductions NUMERIC(10, 2) DEFAULT 0,
      net_salary NUMERIC(10, 2) NOT NULL,
      payment_status VARCHAR(20) DEFAULT 'PAID',
      payment_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 5. Initialize Products Table & Seed Products
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      product_id VARCHAR(100) UNIQUE NOT NULL,
      club_id VARCHAR(100) NOT NULL,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(50) NOT NULL DEFAULT 'Equipment',
      photo TEXT,
      price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      quantity INT NOT NULL DEFAULT 0,
      min_quantity INT NOT NULL DEFAULT 5,
      description TEXT DEFAULT '',
      status VARCHAR(30) DEFAULT 'IN_STOCK',
      created_by VARCHAR(100) DEFAULT 'Product Manager',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS product_notifications (
      id SERIAL PRIMARY KEY,
      notification_id VARCHAR(100) UNIQUE NOT NULL,
      club_id VARCHAR(100) NOT NULL,
      product_id VARCHAR(100) NOT NULL,
      product_name VARCHAR(150) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'LOW_STOCK',
      message TEXT NOT NULL,
      current_quantity INT NOT NULL DEFAULT 0,
      min_quantity INT NOT NULL DEFAULT 5,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Add default products if table is empty
  const prodCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM products WHERE club_id = $1`, clubId);
  if (prodCount[0]?.count === 0) {
    const defaultProds = [
      { id: "PRD-BAD-001", name: "Yonex Astrox 88D Pro Badminton Racket", cat: "Equipment", price: 14500, qty: 12, min: 5, img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400" },
      { id: "PRD-TEN-002", name: "Wilson US Open Championship Tennis Balls (Can of 3)", cat: "Equipment", price: 650, qty: 3, min: 10, img: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400" },
      { id: "PRD-GRP-003", name: "Tourna Super Grip Absorbent Tape (Pack of 3)", cat: "Accessories", price: 350, qty: 25, min: 8, img: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400" },
      { id: "PRD-SHO-005", name: "Asics Gel-Rocket 11 Indoor Court Shoes", cat: "Footwear", price: 5499, qty: 7, min: 4, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    ];

    for (const p of defaultProds) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO products (product_id, club_id, name, category, photo, price, quantity, min_quantity, description, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Official club equipment', CASE WHEN $7 <= $8 THEN 'LOW_STOCK' ELSE 'IN_STOCK' END, 'Inventory Manager', NOW(), NOW())`,
        p.id, clubId, p.name, p.cat, p.img, p.price, p.qty, p.min
      );
    }
    console.log("Seeded products catalog");
  }

  // 6. Initialize Cafe Menu & Orders
  await CafeService.seedInitialDataIfEmpty(clubId);
  console.log("Seeded Cafe Menu & Orders");

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
