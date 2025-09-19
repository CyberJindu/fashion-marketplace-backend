const express = require("express");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// configure multer + cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fashion-marketplace",
    allowed_formats: ["jpg", "png", "jpeg"]
  },
});

const upload = multer({ storage });

// Get all products for a specific vendor
router.get("/vendor/:vendorId", async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const products = await Product.find({ vendorId }).populate("vendorId", "name email");
    res.json(products);
  } catch (err) {
    next(err);
  }
});


// Vendor creates product (with image upload in same request)
router.post("/", auth, upload.single("image"), async (req, res, next) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors can add products" });
    }

    const { name, description, price, stock, category } = req.body;

    const product = new Product({
      vendorId: req.user._id,
      name,
      category,
      description,
      price,
      stock,
      images: req.file ? [req.file.path] : [], // Cloudinary URL
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/reviews
router.post("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, comment } = req.body;

    if (!userId || !rating || !comment) {
      return res.status(400).json({ message: "Missing review fields." });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      userId,
      rating,
      comment,
      createdAt: new Date(),
    };

    product.reviews = product.reviews || [];
    product.reviews.push(review);
    await product.save();

    res.status(201).json(review);
  } catch (err) {
    console.error("❌ Failed to add review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all products (for customers/homepage)
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().populate("vendorId", "name email");
    res.json(products);
  } catch (err) {
    next(err);
  }
});



module.exports = router;





