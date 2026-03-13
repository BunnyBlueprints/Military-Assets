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

module.exports = mongoose.model("Transfer", transferSchema);