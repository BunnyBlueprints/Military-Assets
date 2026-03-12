const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { protect, authorize, baseScope } = require("../middleware/auth");
const { createAuditLog } = require("../middleware/logger");
const Purchase = require("../models/Purchase");

// @route   GET /api/purchases
// @desc    Get all purchases (filtered)
// @access  Private — all roles
router.get("/", protect, baseScope, async (req, res) => {
  try {
    const { base, equipment, startDate, endDate } = req.query;

    const filter = {};

    // Base scope enforcement
    if (req.scopedBase) {
      filter.base = req.scopedBase;
    } else if (base && base !== "All") {
      filter.base = base;
    }

    if (equipment && equipment !== "All") filter.equipment = equipment;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(filter)
      .populate("createdBy", "name role")
      .sort({ date: -1 });

    res.json({ success: true, count: purchases.length, purchases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   POST /api/purchases
// @desc    Create a new purchase record
// @access  Private — admin, base_commander, logistics_officer
router.post(
  "/",
  protect,
  authorize("admin", "base_commander", "logistics_officer"),
  [
    body("date").isISO8601().withMessage("Valid date required"),
    body("base").notEmpty().withMessage("Base is required"),
    body("equipment").notEmpty().withMessage("Equipment type is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { date, base, equipment, quantity, supplier, notes } = req.body;

      // Base commanders can only purchase for their own base
      if (req.user.role === "base_commander" && req.user.base !== base) {
        return res.status(403).json({
          success: false,
          message: "You can only create purchases for your assigned base",
        });
      }

      const purchase = await Purchase.create({
        date,
        base,
        equipment,
        quantity: parseInt(quantity),
        supplier: supplier || "",
        notes: notes || "",
        createdBy: req.user._id,
      });

      await createAuditLog(req, "PURCHASE_CREATE", {
        purchaseId: purchase.purchaseId,
        base,
        equipment,
        quantity,
        supplier,
      });

      const populated = await purchase.populate("createdBy", "name role");
      res.status(201).json({ success: true, purchase: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;