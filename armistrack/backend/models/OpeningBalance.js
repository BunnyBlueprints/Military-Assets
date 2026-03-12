const mongoose = require("mongoose");

const openingBalanceSchema = new mongoose.Schema(
  {
    base: {
      type: String,
      required: true,
      enum: ["Alpha Base", "Bravo Base", "Charlie Base", "Delta Base"],
    },
    equipment: {
      type: String,
      required: true,
      enum: ["Rifles", "Vehicles", "Ammunition", "Missiles", "Drones", "Artillery"],
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    periodStart: { type: Date, required: true },
  },
  { timestamps: true }
);

openingBalanceSchema.index({ base: 1, equipment: 1 }, { unique: true });

module.exports = mongoose.model("OpeningBalance", openingBalanceSchema);