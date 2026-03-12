const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { protect, authorize, baseScope } = require("../middleware/auth");
const { createAuditLog } = require("../middleware/logger");
const Assignment = require("../models/Assignment");

// @route   GET /api/assignments
// @desc    Get all assignments/expenditures
// @access  Private — admin, base_commander only
router.get(
  "/",
  protect,
  authorize("admin", "base_commander"),
  baseScope,
  async (req, res) => {
    try {
      const { base, equipment, type, startDate, endDate } = req.query;

      const filter = {};

      if (req.scopedBase) {
        filter.base = req.scopedBase;
      } else if (base && base !== "All") {
        filter.base = base;
      }

      if (equipment && equipment !== "All") filter.equipment = equipment;
      if (type && type !== "All") filter.type = type;
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      const assignments = await Assignment.find(filter)
        .populate("createdBy", "name role")
        .sort({ date: -1 });

      res.json({ success: true, count: assignments.length, assignments });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// @route   POST /api/assignments
// @desc    Create assignment or expenditure
// @access  Private — admin, base_commander only
router.post(
  "/",
  protect,
  authorize("admin", "base_commander"),
  [
    body("date").isISO8601().withMessage("Valid date required"),
    body("base").notEmpty().withMessage("Base is required"),
    body("equipment").notEmpty().withMessage("Equipment type is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("type").isIn(["assigned", "expended"]).withMessage("Type must be assigned or expended"),
    body("personnel").notEmpty().withMessage("Personnel/unit is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { date, base, equipment, quantity, type, personnel, notes } = req.body;

      // Base commanders can only assign for their base
      if (req.user.role === "base_commander" && req.user.base !== base) {
        return res.status(403).json({
          success: false,
          message: "You can only record assignments for your assigned base",
        });
      }

      const assignment = await Assignment.create({
        date,
        base,
        equipment,
        quantity: parseInt(quantity),
        type,
        personnel,
        notes: notes || "",
        createdBy: req.user._id,
      });

      await createAuditLog(req, "ASSIGNMENT_CREATE", {
        assignmentId: assignment.assignmentId,
        base,
        equipment,
        quantity,
        type,
        personnel,
      });

      const populated = await assignment.populate("createdBy", "name role");
      res.status(201).json({ success: true, assignment: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;