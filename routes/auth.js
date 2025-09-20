const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth"); // <-- import middleware

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    let { name, email, password, role } = req.body; // use let
    email = email.toLowerCase().trim(); // normalize email

    const user = new User({ name, email, password, role });
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
    let { email, password } = req.body;
    
    // normalize email
    email = email.toLowerCase().trim();
    
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

// ---------------- VENDOR PROFILE ----------------
router.put("/:id/profile", auth, async (req, res, next) => {
  try {
    // Ensure only the owner (same user) can update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors can update profile" });
    }

    const updateData = { ...req.body };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});


// Get Vendor Profile
router.get("/:id/profile", auth, async (req, res, next) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors can view profile" });
    }

    const user = await User.findById(req.params.id).select(
      "businessName ownerName email phone location category description bankName bankAccount logo"
    );
    if (!user) return res.status(404).json({ message: "Vendor not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ---------------- CUSTOMER PROFILE ----------------

// Update customer profile
router.put("/:id/customer-profile", auth, async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can update profile" });
    }

    const updateData = { ...req.body };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { customerProfile: updateData },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

// Get customer profile
router.get("/:id/customer-profile", auth, async (req, res, next) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can view profile" });
    }

    const user = await User.findById(req.params.id).select("name email customerProfile");
    if (!user) return res.status(404).json({ message: "Customer not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
});


module.exports = router;










