const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth"); // <-- import middleware

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Current User (protected)
router.get("/me", auth, async (req, res) => {
  try {
    res.json(req.user); // auth middleware already attaches the user
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

