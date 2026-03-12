const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { createAuditLog } = require("../middleware/logger");
const { protect } = require("../middleware/auth");

// Generate JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });


router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username: username.toLowerCase() });
      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const token = signToken(user._id);

      // Audit log
      req.user = user;
      await createAuditLog(req, "LOGIN", { username: user.username });

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
          base: user.base,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);


router.get("/me", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;