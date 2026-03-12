require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { requestLogger } = require("./middleware/logger");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const purchaseRoutes = require("./routes/purchases");
const transferRoutes = require("./routes/transfers");
const assignmentRoutes = require("./routes/assignments");
const auditRoutes = require("./routes/audit");


connectDB();

const app = express();


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/audit", auditRoutes);


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ARMISTRACK API is operational",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});


app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🎖  ARMISTRACK API running on port ${PORT}`);
  console.log(`📡  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗  Health: http://localhost:${PORT}/api/health\n`);
});