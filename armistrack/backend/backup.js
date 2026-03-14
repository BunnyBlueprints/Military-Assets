require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const Purchase = require("./models/Purchase");
const Transfer = require("./models/Transfer");
const Assignment = require("./models/Assignment");
const AuditLog = require("./models/AuditLog");
const OpeningBalance = require("./models/OpeningBalance");

async function backupDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const backupDir = path.join(__dirname, "..", "database_backup");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const collections = [
      { name: "users", model: User },
      { name: "purchases", model: Purchase },
      { name: "transfers", model: Transfer },
      { name: "assignments", model: Assignment },
      { name: "auditlogs", model: AuditLog },
      { name: "openingbalances", model: OpeningBalance },
    ];

    console.log("\n📦 Exporting collections...");
    for (const collection of collections) {
      try {
        const data = await collection.model.find().lean();
        const filePath = path.join(backupDir, `${collection.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ ${collection.name}: ${data.length} documents exported`);
      } catch (err) {
        console.log(`⚠️  ${collection.name}: ${err.message}`);
      }
    }

    console.log("\n✅ Database backup completed!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Backup failed:", error.message);
    process.exit(1);
  }
}

backupDatabase();
