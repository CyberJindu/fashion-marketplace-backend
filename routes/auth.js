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
    res.json({ user: req.user }); // auth middleware already attaches the user
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/** ---------------- VENDOR PROFILE ---------------- */
router.put("/profile", auth, upload.single("logo"), async (req, res, next) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors can update profile" });
    }

    const updateData = { ...req.body };
    if (req.file) updateData.logo = req.file.path;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { vendorProfile: updateData },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

module.exports = router;



