require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const Purchase = require("../models/Purchase");
const Transfer = require("../models/Transfer");
const Assignment = require("../models/Assignment");
const OpeningBalance = require("../models/OpeningBalance");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/armistrack";

const users = [
  { name: "Gen. Marcus Reid", username: "gen.reid", password: "admin123", role: "admin", base: null },
  { name: "Col. Sarah Chen", username: "col.chen", password: "cmd123", role: "base_commander", base: "Alpha Base" },
  { name: "Lt. James Okafor", username: "lt.okafor", password: "cmd456", role: "base_commander", base: "Bravo Base" },
  { name: "Sgt. Nina Volkov", username: "sgt.volkov", password: "log123", role: "logistics_officer", base: "Alpha Base" },
  { name: "Cpl. David Torres", username: "cpl.torres", password: "log456", role: "logistics_officer", base: "Charlie Base" },
];

const openingBalances = [
  { base: "Alpha Base", equipment: "Rifles", quantity: 200, periodStart: new Date("2024-01-01") },
  { base: "Alpha Base", equipment: "Vehicles", quantity: 15, periodStart: new Date("2024-01-01") },
  { base: "Alpha Base", equipment: "Ammunition", quantity: 3000, periodStart: new Date("2024-01-01") },
  { base: "Alpha Base", equipment: "Missiles", quantity: 20, periodStart: new Date("2024-01-01") },
  { base: "Alpha Base", equipment: "Drones", quantity: 10, periodStart: new Date("2024-01-01") },
  { base: "Alpha Base", equipment: "Artillery", quantity: 4, periodStart: new Date("2024-01-01") },

  { base: "Bravo Base", equipment: "Rifles", quantity: 150, periodStart: new Date("2024-01-01") },
  { base: "Bravo Base", equipment: "Vehicles", quantity: 10, periodStart: new Date("2024-01-01") },
  { base: "Bravo Base", equipment: "Ammunition", quantity: 2000, periodStart: new Date("2024-01-01") },
  { base: "Bravo Base", equipment: "Missiles", quantity: 30, periodStart: new Date("2024-01-01") },
  { base: "Bravo Base", equipment: "Drones", quantity: 8, periodStart: new Date("2024-01-01") },
  { base: "Bravo Base", equipment: "Artillery", quantity: 2, periodStart: new Date("2024-01-01") },

  { base: "Charlie Base", equipment: "Rifles", quantity: 180, periodStart: new Date("2024-01-01") },
  { base: "Charlie Base", equipment: "Vehicles", quantity: 12, periodStart: new Date("2024-01-01") },
  { base: "Charlie Base", equipment: "Ammunition", quantity: 4000, periodStart: new Date("2024-01-01") },
  { base: "Charlie Base", equipment: "Missiles", quantity: 15, periodStart: new Date("2024-01-01") },
  { base: "Charlie Base", equipment: "Drones", quantity: 5, periodStart: new Date("2024-01-01") },
  { base: "Charlie Base", equipment: "Artillery", quantity: 3, periodStart: new Date("2024-01-01") },

  { base: "Delta Base", equipment: "Rifles", quantity: 160, periodStart: new Date("2024-01-01") },
  { base: "Delta Base", equipment: "Vehicles", quantity: 20, periodStart: new Date("2024-01-01") },
  { base: "Delta Base", equipment: "Ammunition", quantity: 2500, periodStart: new Date("2024-01-01") },
  { base: "Delta Base", equipment: "Missiles", quantity: 25, periodStart: new Date("2024-01-01") },
  { base: "Delta Base", equipment: "Drones", quantity: 12, periodStart: new Date("2024-01-01") },
  { base: "Delta Base", equipment: "Artillery", quantity: 6, periodStart: new Date("2024-01-01") },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Purchase.deleteMany({}),
      Transfer.deleteMany({}),
      Assignment.deleteMany({}),
      OpeningBalance.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    
    const createdUsers = await User.create(users);
    console.log(`👤 Seeded ${createdUsers.length} users`);

    const adminUser = createdUsers.find(u => u.role === "admin");
    const chenUser = createdUsers.find(u => u.username === "col.chen");

    
    await OpeningBalance.create(openingBalances);
    console.log(`📊 Seeded ${openingBalances.length} opening balances`);

    
    const purchases = await Purchase.create([
      { purchaseId: "P-001", date: new Date("2024-01-10"), base: "Alpha Base", equipment: "Rifles", quantity: 120, supplier: "ArmsDepot Inc.", notes: "Annual resupply", createdBy: adminUser._id },
      { purchaseId: "P-002", date: new Date("2024-01-15"), base: "Bravo Base", equipment: "Vehicles", quantity: 8, supplier: "TactVehicles LLC", notes: "New fleet", createdBy: adminUser._id },
      { purchaseId: "P-003", date: new Date("2024-02-01"), base: "Charlie Base", equipment: "Ammunition", quantity: 5000, supplier: "BulletCo", notes: "", createdBy: adminUser._id },
      { purchaseId: "P-004", date: new Date("2024-02-14"), base: "Alpha Base", equipment: "Drones", quantity: 15, supplier: "AeroDef Systems", notes: "ISR upgrade", createdBy: adminUser._id },
      { purchaseId: "P-005", date: new Date("2024-03-05"), base: "Delta Base", equipment: "Artillery", quantity: 6, supplier: "HeavyArms Corp", notes: "", createdBy: adminUser._id },
      { purchaseId: "P-006", date: new Date("2024-03-20"), base: "Bravo Base", equipment: "Missiles", quantity: 40, supplier: "PrecisionMunitions", notes: "Op ready", createdBy: adminUser._id },
    ]);
    console.log(`📦 Seeded ${purchases.length} purchases`);

    
    const transfers = await Transfer.create([
      { transferId: "T-001", date: new Date("2024-01-20"), fromBase: "Alpha Base", toBase: "Bravo Base", equipment: "Rifles", quantity: 30, status: "Completed", authorizedBy: "Gen. Marcus Reid", completedAt: new Date("2024-01-21"), createdBy: adminUser._id },
      { transferId: "T-002", date: new Date("2024-02-10"), fromBase: "Charlie Base", toBase: "Delta Base", equipment: "Ammunition", quantity: 1200, status: "Completed", authorizedBy: "Col. Sarah Chen", completedAt: new Date("2024-02-11"), createdBy: chenUser._id },
      { transferId: "T-003", date: new Date("2024-02-28"), fromBase: "Delta Base", toBase: "Alpha Base", equipment: "Vehicles", quantity: 3, status: "In Transit", authorizedBy: "Gen. Marcus Reid", createdBy: adminUser._id },
      { transferId: "T-004", date: new Date("2024-03-10"), fromBase: "Bravo Base", toBase: "Charlie Base", equipment: "Drones", quantity: 5, status: "Completed", authorizedBy: "Lt. James Okafor", completedAt: new Date("2024-03-12"), createdBy: adminUser._id },
    ]);
    console.log(`🔄 Seeded ${transfers.length} transfers`);

    
    const assignments = await Assignment.create([
      { assignmentId: "A-001", date: new Date("2024-01-25"), base: "Alpha Base", equipment: "Rifles", quantity: 50, type: "assigned", personnel: "3rd Infantry Unit", notes: "Field deployment", createdBy: chenUser._id },
      { assignmentId: "A-002", date: new Date("2024-02-05"), base: "Alpha Base", equipment: "Ammunition", quantity: 800, type: "expended", personnel: "Range Training", notes: "Annual qualification", createdBy: chenUser._id },
      { assignmentId: "A-003", date: new Date("2024-02-20"), base: "Bravo Base", equipment: "Rifles", quantity: 20, type: "assigned", personnel: "Recon Team B", notes: "", createdBy: adminUser._id },
      { assignmentId: "A-004", date: new Date("2024-03-01"), base: "Charlie Base", equipment: "Vehicles", quantity: 2, type: "assigned", personnel: "Logistics Convoy", notes: "Supply run", createdBy: adminUser._id },
      { assignmentId: "A-005", date: new Date("2024-03-15"), base: "Delta Base", equipment: "Missiles", quantity: 10, type: "expended", personnel: "Strike Package D", notes: "Live exercise", createdBy: adminUser._id },
    ]);
    console.log(`🎯 Seeded ${assignments.length} assignments`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n🔑 Login credentials:");
    users.forEach(u => console.log(`   ${u.role.padEnd(20)} | ${u.username.padEnd(15)} | ${u.password}`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();