const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN", "LOGOUT",
        "PURCHASE_CREATE",
        "TRANSFER_CREATE", "TRANSFER_COMPLETE",
        "ASSIGNMENT_CREATE",
      ],
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    userRole: { type: String },
    base: { type: String },
    details: { type: mongoose.Schema.Types.Mixed }, // flexible payload
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Index for efficient querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);