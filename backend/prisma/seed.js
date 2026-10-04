import bcrypt from "bcryptjs";
import prisma from "../src/config/database.js";

async function main() {
  console.log("🌱 Starting Comprehensive 5 Sports Clubs Seeding...");

  const defaultPassword = await bcrypt.hash("Password@123", 10);

  // Define 5 distinct clubs across different sports
  const clubs = [
    {
      clubId: "CLUB-1791026171222",
      name: "Champions Sports Club",
      address: "Sector 14, Sports City, New Delhi",
      email: "info@championsclub.com",
      phone: "+91 98111 22334",
      website: "https://championsclub.in",
      sport: "Multi-Sport Complex",
      country: "India",
    },
    {
      clubId: "CLUB-APEX-BADMINTON",
      name: "Apex Badminton Academy & Club",
      address: "Koramangala 4th Block, Bengaluru",
      email: "contact@apexbadminton.com",
      phone: "+91 98222 33445",
      website: "https://apexbadminton.in",
      sport: "Badminton",
      country: "India",
    },
    {
      clubId: "CLUB-ROYAL-CRICKET",
      name: "Royal Palm Cricket & Golf Club",
      address: "Golf Course Road, Gurgaon",
      email: "desk@royalpalmclub.com",
      phone: "+91 98333 44556",
      website: "https://royalpalmclub.in",
      sport: "Cricket & Golf",
      country: "India",
    },
    {
      clubId: "CLUB-AQUAWAVE-SWIM",
      name: "AquaWave Olympic Aquatic Center",
      address: "Marine Lines, South Mumbai",
      email: "membership@aquawave.com",
      phone: "+91 98444 55667",
      website: "https://aquawave.in",
      sport: "Swimming & Aquatics",
      country: "India",
    },
    {
      clubId: "CLUB-TITAN-FOOTBALL",
      name: "Titan Football & Turf Arena",
      address: "Banjara Hills, Hyderabad",
      email: "play@titanarena.com",
      phone: "+91 98555 66778",
      website: "https://titanarena.in",
      sport: "Football & Turf Sports",
      country: "India",
    },
  ];

  // Sport-specific products for Pro Shop
  const clubProductsMap = {
    "Multi-Sport Complex": [
      { name: "Pro Aero Carbon Tennis Racquet", category: "Equipment", price: 4999, qty: 20, min: 4, photo: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=80", desc: "Carbon graphite frame with high string tension control." },
      { name: "Championship Feather Shuttles (12pk)", category: "Accessories", price: 1250, qty: 35, min: 6, photo: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=500&auto=format&fit=crop&q=80", desc: "Tournament goose feather shuttles with composite cork base." },
      { name: "Champions Club Dry-Fit Jersey", category: "Apparel", price: 1499, qty: 25, min: 5, photo: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80", desc: "High breathability performance club jersey." },
      { name: "Pro Court Grip Shoes", category: "Footwear", price: 3799, qty: 15, min: 3, photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80", desc: "Non-marking rubber grip shoes for synthetic & wooden surfaces." },
      { name: "Whey Protein Isolate 1kg", category: "Nutrition", price: 2899, qty: 22, min: 5, photo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", desc: "27g ultra pure protein per scoop for post-match recovery." },
      { name: "Multi-Racket Tour Kit Bag", category: "Accessories", price: 2199, qty: 12, min: 3, photo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80", desc: "Holds up to 6 racquets with dedicated thermal lining." },
    ],
    "Badminton": [
      { name: "Yonex Astrox 99 Pro Racquet", category: "Equipment", price: 7499, qty: 15, min: 3, photo: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=80", desc: "Head-heavy racquet engineered for devastating smash power." },
      { name: "Aerosensa 50 Feather Shuttles (12pk)", category: "Accessories", price: 1650, qty: 40, min: 8, photo: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=500&auto=format&fit=crop&q=80", desc: "BWF sanctioned tournament shuttlecocks." },
      { name: "Apex Pro Badminton Court Shoes", category: "Footwear", price: 4299, qty: 18, min: 4, photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80", desc: "Power cushion hexagonal sole preventing ankle roll." },
      { name: "Microfiber Badminton Grip Roll (5pk)", category: "Accessories", price: 499, qty: 50, min: 10, photo: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=80", desc: "Super absorbent perforated polyurethane grip tapes." },
      { name: "Apex Team Championship Jersey", category: "Apparel", price: 1299, qty: 30, min: 5, photo: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80", desc: "Lightweight cooling mesh fabric with anti-odor tech." },
      { name: "Electrolyte Hydration Drink Mix (Pack of 10)", category: "Nutrition", price: 799, qty: 35, min: 5, photo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", desc: "Fast absorbing mineral salts replenishing sweat loss." },
    ],
    "Cricket & Golf": [
      { name: "Grade 1 English Willow Cricket Bat", category: "Equipment", price: 9999, qty: 10, min: 2, photo: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&auto=format&fit=crop&q=80", desc: "Handcrafted English willow with deep profile and balanced pick-up." },
      { name: "Red Leather Test Match Balls (Box of 6)", category: "Accessories", price: 2400, qty: 25, min: 5, photo: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80", desc: "Four-piece alum tanned leather with hand-stitched seam." },
      { name: "Club Pro Batting Leg Guards & Gloves", category: "Equipment", price: 3499, qty: 15, min: 3, photo: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=80", desc: "High density foam cane protection with breathable cotton palm." },
      { name: "Cabretta Leather Golf Glove", category: "Accessories", price: 1199, qty: 20, min: 4, photo: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500&auto=format&fit=crop&q=80", desc: "Soft feel cabretta leather offering exceptional grip and moisture resistance." },
      { name: "Royal Palm Polo Whites", category: "Apparel", price: 1699, qty: 25, min: 5, photo: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80", desc: "Traditional club white polo jersey with embroidered club crest." },
      { name: "Cricket Spike Shoes (All-Rounder)", category: "Footwear", price: 4499, qty: 12, min: 3, photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80", desc: "Removable metal spikes for maximum traction on turf wickets." },
    ],
    "Swimming & Aquatics": [
      { name: "Speedo Fastskin Mirror Goggles", category: "Equipment", price: 2499, qty: 25, min: 5, photo: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=500&auto=format&fit=crop&q=80", desc: "Anti-fog hydrodynamic competition goggles with UV shielding." },
      { name: "Silicone Ergonomic Swim Cap (2pk)", category: "Accessories", price: 599, qty: 40, min: 8, photo: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500&auto=format&fit=crop&q=80", desc: "Tear-resistant silicone with ear pocket contour." },
      { name: "High-Buoyancy Training Kickboard", category: "Equipment", price: 899, qty: 20, min: 4, photo: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=500&auto=format&fit=crop&q=80", desc: "EVA foam kickboard for stroke development and kicking drills." },
      { name: "Competition Endurance+ Jammers", category: "Apparel", price: 2999, qty: 15, min: 3, photo: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80", desc: "100% chlorine resistant quick-drying fabric." },
      { name: "Anti-Slip Poolside Slides", category: "Footwear", price: 1499, qty: 22, min: 4, photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80", desc: "Drainage-vented EVA water-resistant deck slides." },
      { name: "Electrolyte Water Tablets (Berry)", category: "Nutrition", price: 650, qty: 30, min: 6, photo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", desc: "Effervescent magnesium and potassium tablets for endurance." },
    ],
    "Football & Turf Sports": [
      { name: "FIFA Quality Pro Match Football", category: "Equipment", price: 3499, qty: 15, min: 3, photo: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=500&auto=format&fit=crop&q=80", desc: "Thermally bonded seamless surface for true trajectory." },
      { name: "Titan Turf Football Studs (AG)", category: "Footwear", price: 3999, qty: 18, min: 4, photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80", desc: "Multi-ground short conical studs for high-grip artificial turf." },
      { name: "Carbon Shield Ankle Shin Guards", category: "Accessories", price: 899, qty: 30, min: 6, photo: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=80", desc: "Hard shell with EVA backing and compression sleeve." },
      { name: "Titan Arena Match Jersey & Shorts Set", category: "Apparel", price: 1799, qty: 25, min: 5, photo: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80", desc: "Sublimated moisture management team match kit." },
      { name: "Pro Grip Latex Goalkeeper Gloves", category: "Equipment", price: 2499, qty: 12, min: 2, photo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80", desc: "4mm German latex foam with finger protection spines." },
      { name: "Fast Hydration Energy Gel Pack (6x)", category: "Nutrition", price: 540, qty: 40, min: 8, photo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80", desc: "Isotonic carbohydrate gel with caffeine boost for second-half stamina." },
    ],
  };

  // Common cafe items
  const defaultCafeMenu = [
    { name: "Post-Workout Fuel Combo", category: "Combos & Deals", type: "COMBO", price: 420, diet: "HIGH_PROTEIN", desc: "1x Cold Brew Coffee + 1x Grilled Chicken Wrap + 1x Whey Bar", img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&auto=format&fit=crop&q=80" },
    { name: "Match Day Breakfast Combo", category: "Combos & Deals", type: "COMBO", price: 360, diet: "VEG", desc: "1x Scrambled Paneer Sourdough Toast + 1x Fresh Orange Juice", img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80" },
    { name: "Signature Nitro Cold Brew (350ml)", category: "Beverages", type: "SINGLE", price: 180, diet: "VEG", desc: "Triple filtered steeped single-origin dark roast with creamy foam head.", img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80" },
    { name: "Acai Superberry Protein Bowl", category: "Bowls", type: "SINGLE", price: 290, diet: "VEG", desc: "Organic Brazilian acai blended with almond milk, topped with chia seeds & granola.", img: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=80" },
    { name: "Grilled Herb Chicken Sandwich", category: "High-Protein", type: "SINGLE", price: 240, diet: "NON_VEG", desc: "Tender herb marinated chicken breast on toasted multigrain bread.", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80" },
    { name: "Matcha Coconut Hydrator", category: "Beverages", type: "SINGLE", price: 210, diet: "VEG", desc: "Ceremonial Japanese matcha whisked into cold tender coconut water.", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80" },
  ];

  for (const c of clubs) {
    console.log(`\n🏢 Seeding ${c.name} (${c.clubId})...`);

    // 1. Create or update Club
    const club = await prisma.club.upsert({
      where: { clubId: c.clubId },
      update: { name: c.name, sport: c.sport, address: c.address, email: c.email, phone: c.phone },
      create: {
        clubId: c.clubId,
        name: c.name,
        address: c.address,
        email: c.email,
        phone: c.phone,
        website: c.website,
        sport: c.sport,
        country: c.country,
        isActive: true,
      },
    });

    // 2. Module Config
    await prisma.moduleConfiguration.upsert({
      where: { clubId: c.clubId },
      update: {},
      create: {
        clubId: c.clubId,
        membership: true,
        courtBooking: true,
        shop: true,
        bar: true,
        hr: true,
        accounting: true,
      },
    });

    // 3. Staff Users for each role
    const staffRoles = [
      { role: "SUPER_ADMIN", prefix: "admin", name: "Executive Director" },
      { role: "RECEPTIONIST", prefix: "reception", name: "Front Desk Officer" },
      { role: "SHOP_INVENTORY_MANAGER", prefix: "proshop", name: "Pro Shop Manager" },
      { role: "BAR_CAFETERIA_STAFF", prefix: "cafe", name: "Head Barista & Cafe Lead" },
      { role: "HR_MANAGER", prefix: "hr", name: "Human Resources Lead" },
      { role: "ACCOUNTANT", prefix: "finance", name: "Finance Controller" },
    ];

    const slug = c.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);

    for (const s of staffRoles) {
      const email = `${s.prefix}.${slug}@skylinesports.com`;
      const userId = `USR-${slug.toUpperCase()}-${s.role.slice(0, 3)}-${Date.now().toString(36).slice(-3)}`;

      await prisma.user.upsert({
        where: { email_clubId: { email, clubId: c.clubId } },
        update: { name: `${c.name} ${s.name}`, role: s.role },
        create: {
          userId,
          clubId: c.clubId,
          name: `${c.name} ${s.name}`,
          email,
          password: defaultPassword,
          role: s.role,
          isActive: true,
        },
      });
    }

    // 4. 15 Members for this club
    const memberNames = [
      "Aarav Sharma", "Priya Verma", "Vikram Malhotra", "Ananya Reddy",
      "Rohan Nair", "Neha Kapoor", "Kabir Singh", "Isha Mukherjee",
      "Aditya Joshi", "Tanvi Bhatia", "Sameer Deshmukh", "Pooja Pillai",
      "Kunal Sen", "Rhea Singhania", "Arjun Mehra"
    ];

    for (let i = 0; i < memberNames.length; i++) {
      const name = memberNames[i];
      const memEmail = `${name.toLowerCase().replace(" ", ".")}.${slug}@example.com`;
      const tier = i < 3 ? "PLATINUM" : i < 8 ? "GOLD" : "SILVER";
      const memId = `MEM-${slug.toUpperCase()}-${1000 + i + 1}`;

      await prisma.member.upsert({
        where: { memberId: memId },
        update: { fullName: name, membershipTier: tier },
        create: {
          memberId: memId,
          clubId: c.clubId,
          fullName: name,
          email: memEmail,
          password: defaultPassword,
          phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
          membershipTier: tier,
          membershipPlan: `${tier} Annual Membership`,
          amountPaid: tier === "PLATINUM" ? 45000 : tier === "GOLD" ? 30000 : 18000,
          status: "ACTIVE",
          startDate: new Date(Date.now() - 30 * 86400000),
          endDate: new Date(Date.now() + 335 * 86400000),
        },
      });
    }

    // 5. Products in `products` table
    const clubProducts = clubProductsMap[c.sport] || clubProductsMap["Multi-Sport Complex"];
    for (const p of clubProducts) {
      const pId = `PRD-${slug.toUpperCase()}-${p.category.slice(0, 3).toUpperCase()}-${Date.now().toString(36).slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO products (product_id, club_id, name, category, photo, price, quantity, min_quantity, description, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'IN_STOCK', 'Pro Shop Manager', NOW(), NOW())
         ON CONFLICT (product_id) DO NOTHING`,
        pId,
        c.clubId,
        p.name,
        p.category,
        p.photo,
        p.price,
        p.qty,
        p.min,
        p.desc
      );
    }

    // 6. Cafe Menu Items in `cafe_menu_items`
    for (let idx = 0; idx < defaultCafeMenu.length; idx++) {
      const item = defaultCafeMenu[idx];
      const itemId = `CAFE-${slug.toUpperCase()}-${idx + 1}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO cafe_menu_items (item_id, club_id, name, category, type, combo_items, price, image, description, diet_tag, is_available, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, 'Head Chef', NOW(), NOW())
         ON CONFLICT (item_id) DO NOTHING`,
        itemId,
        c.clubId,
        item.name,
        item.category,
        item.type,
        item.type === 'COMBO' ? item.desc : '',
        item.price,
        item.img,
        item.desc,
        item.diet
      );
    }

    // 7. Sample live Cafe orders
    const sampleOrderNum = Math.floor(1000 + Math.random() * 9000);
    await prisma.$executeRawUnsafe(
      `INSERT INTO cafe_orders (order_id, club_id, member_name, member_id, delivery_location, items, subtotal, tax, total_amount, status, notes, served_at, created_at, updated_at)
       VALUES ($1, $2, 'Vikram Malhotra', 'MEM-${slug.toUpperCase()}-1003', 'Court 1 Side Bench', $3::jsonb, 420, 21, 441, 'PREPARING', 'Serve warm post match', NULL, NOW(), NOW())
       ON CONFLICT (order_id) DO NOTHING`,
      `#ORD-${sampleOrderNum}`,
      c.clubId,
      JSON.stringify([{ name: "Post-Workout Fuel Combo", price: 420, qty: 1, type: "COMBO" }])
    );
  }

  console.log("\n✅ All 5 Sports Clubs, Staff Roles, Members, Inventory Products, Cafe Menus, and Orders Seeded Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
