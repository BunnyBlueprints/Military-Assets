const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, unique: true },
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
    type: {
      type: String,
      required: true,
      enum: ["assigned", "expended"],
    },
    personnel: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);