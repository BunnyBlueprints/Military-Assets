const AuditLog = require("../models/AuditLog");

/**
 * createAuditLog — call this inside route handlers to log transactions
 * @param {Object} req - Express request
 * @param {string} action - Action enum value
 * @param {Object} details - Payload/details to store
 */
const createAuditLog = async (req, action, details = {}) => {
  try {
    await AuditLog.create({
      action,
      userId: req.user?._id,
      userName: req.user?.name,
      userRole: req.user?.role,
      base: req.user?.base,
      details,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (err) {
    // Audit logging should never break the main flow
    console.error("⚠️  Audit log failed:", err.message);
  }
};

/**
 * requestLogger — Morgan-style HTTP request logger middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    if (res.statusCode >= 400) console.error(`❌ ${log}`);
    else console.log(`📡 ${log}`);
  });
  next();
};

module.exports = { createAuditLog, requestLogger };