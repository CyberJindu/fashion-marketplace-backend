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

// 📌 Get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().populate("vendorId", "name email");
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// 📌 Vendor creates product (with image upload in same request)
router.post("/", auth, upload.single("image"), async (req, res, next) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors can add products" });
    }

    const { name, description, price, stock } = req.body;

    const product = new Product({
      vendorId: req.user._id,
      name,
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

module.exports = router;
