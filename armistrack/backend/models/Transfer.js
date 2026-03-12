const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    transferId: { type: String, unique: true },
    date: { type: Date, required: true },
    fromBase: {
      type: String,
      required: true,
      enum: ["Alpha Base", "Bravo Base", "Charlie Base", "Delta Base"],
    },
    toBase: {
      type: String,
      required: true,
      enum: ["Alpha Base", "Bravo Base", "Charlie Base", "Delta Base"],
    },
    equipment: {
      type: String,
      required: true,
      enum: ["Rifles", "Vehicles", "Ammunition", "Missiles", "Drones", "Artillery"],
    },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["In Transit", "Completed", "Cancelled"],
      default: "In Transit",
    },
    authorizedBy: { type: String, required: true },
    notes: { type: String, default: "" },
    completedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Validate fromBase !== toBase
transferSchema.pre("save", function (next) {
  if (this.fromBase === this.toBase) {
    return next(new Error("Source and destination bases cannot be the same"));
  }
  if (!this.transferId) {
    const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.transferId = `T-${rand}`;
  }
  next();
});

module.exports = mongoose.model("Transfer", transferSchema);