const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

async function createBackupArchive() {
  try {
    const projectRoot = path.join(__dirname, "..");
    const outputPath = path.join(projectRoot, "..", "Military-Assets-Full-Backup.zip");
    
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    output.on("close", () => {
      const sizeInMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
      console.log(`✅ Archive created successfully!`);
      console.log(`📦 File: ${outputPath}`);
      console.log(`📊 Size: ${sizeInMB} MB`);
      console.log(`📁 Total files: ${archive.pointer()} bytes`);
    });

    archive.on("error", (err) => {
      console.error("❌ Archive error:", err);
      process.exit(1);
    });

    archive.pipe(output);

    // Add the entire backend folder
    console.log("📦 Archiving project...");
    archive.directory(projectRoot, "armistrack");

    console.log("✅ Finalizing archive...");
    await archive.finalize();
  } catch (error) {
    console.error("❌ Failed to create archive:", error.message);
    process.exit(1);
  }
}

createBackupArchive();
