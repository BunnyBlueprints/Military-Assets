const express = require("express");
const router = express.Router();
const { protect, baseScope } = require("../middleware/auth");
const Purchase = require("../models/Purchase");
const Transfer = require("../models/Transfer");
const Assignment = require("../models/Assignment");
const OpeningBalance = require("../models/OpeningBalance");

const BASES = ["Alpha Base", "Bravo Base", "Charlie Base", "Delta Base"];
const EQUIPMENT_TYPES = ["Rifles", "Vehicles", "Ammunition", "Missiles", "Drones", "Artillery"];

// @route   GET /api/dashboard
// @desc    Get aggregated asset metrics
// @access  Private (all roles, base-scoped)
router.get("/", protect, baseScope, async (req, res) => {
  try {
    const { base, equipment, startDate, endDate } = req.query;

    // Determine which bases to query
    const basesToQuery = req.scopedBase
      ? [req.scopedBase]
      : base && base !== "All"
      ? [base]
      : BASES;

    const equipmentToQuery =
      equipment && equipment !== "All" ? [equipment] : EQUIPMENT_TYPES;

    // Date filter for purchases, transfers, assignments
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const rows = [];

    for (const b of basesToQuery) {
      for (const eq of equipmentToQuery) {
        // Opening balance from DB
        const obDoc = await OpeningBalance.findOne({ base: b, equipment: eq });
        const opening = obDoc ? obDoc.quantity : 0;

        // Build date query
        const dateQ = Object.keys(dateFilter).length ? { date: dateFilter } : {};

        // Purchases
        const purchaseAgg = await Purchase.aggregate([
          { $match: { base: b, equipment: eq, ...dateQ } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);
        const purchased = purchaseAgg[0]?.total || 0;

        // Transfers In (Completed)
        const transferInAgg = await Transfer.aggregate([
          { $match: { toBase: b, equipment: eq, status: "Completed", ...dateQ } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);
        const transferIn = transferInAgg[0]?.total || 0;

        // Transfers Out (Completed)
        const transferOutAgg = await Transfer.aggregate([
          { $match: { fromBase: b, equipment: eq, status: "Completed", ...dateQ } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);
        const transferOut = transferOutAgg[0]?.total || 0;

        // Assigned
        const assignedAgg = await Assignment.aggregate([
          { $match: { base: b, equipment: eq, type: "assigned", ...dateQ } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);
        const assigned = assignedAgg[0]?.total || 0;

        // Expended
        const expendedAgg = await Assignment.aggregate([
          { $match: { base: b, equipment: eq, type: "expended", ...dateQ } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);
        const expended = expendedAgg[0]?.total || 0;

        const netMovement = purchased + transferIn - transferOut;
        const closing = opening + netMovement - assigned - expended;

        rows.push({
          base: b,
          equipment: eq,
          opening,
          purchased,
          transferIn,
          transferOut,
          netMovement,
          assigned,
          expended,
          closing,
        });
      }
    }

    // Summary totals
    const totals = rows.reduce(
      (acc, r) => ({
        opening: acc.opening + r.opening,
        closing: acc.closing + r.closing,
        netMovement: acc.netMovement + r.netMovement,
        assigned: acc.assigned + r.assigned,
        expended: acc.expended + r.expended,
        purchased: acc.purchased + r.purchased,
        transferIn: acc.transferIn + r.transferIn,
        transferOut: acc.transferOut + r.transferOut,
      }),
      { opening: 0, closing: 0, netMovement: 0, assigned: 0, expended: 0, purchased: 0, transferIn: 0, transferOut: 0 }
    );

    res.json({ success: true, rows, totals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;