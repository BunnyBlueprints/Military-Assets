const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: { type: String, unique: true }, // e.g. P-ABC123
    date: { type: Date, required: true },
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
    quantity: { type: Number, required: true, min: 1 },
    supplier: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Auto-generate purchaseId
purchaseSchema.pre("save", async function () {
  if (!this.purchaseId) {
    const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.purchaseId = `P-${rand}`;
  }
});

module.exports = mongoose.model("Purchase", purchaseSchema);