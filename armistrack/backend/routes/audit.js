const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const AuditLog = require("../models/AuditLog");

// @route   GET /api/audit
// @desc    Get audit logs
// @access  Private — admin only
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { action, userId, startDate, endDate, limit = 100, page = 1 } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name username role");

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      logs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;