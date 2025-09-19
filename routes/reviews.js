const express = require("express");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product"); // 
const { auth } = require("../middleware/auth");

const router = express.Router();

// Disable caching for reviews responses
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store"); 
  next();
});

// add review
router.post("/", auth, async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.customerId.toString() !== req.user._id.toString())
      return res.status(400).json({ message: "Invalid order" });
    if (order.orderStatus !== "Delivered")
      return res.status(400).json({ message: "Only after delivery" });

    const review = new Review({
      productId,
      orderId,
      customerId: req.user._id,
      rating,
      comment,
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

// product reviews
router.get("/product/:id", async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).populate(
      "customerId",
      "name"
    );
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// vendor reviews
router.get("/vendor/:vendorId", async (req, res, next) => {
  try {
    const { vendorId } = req.params;

    // Find all products owned by this vendor
    const products = await Product.find({ vendorId }).select("_id name");

    const productIds = products.map((p) => p._id);

    if (productIds.length === 0) {
      return res.json([]); // no products → no reviews
    }

    // Get reviews and populate product + customer
    const reviews = await Review.find({ productId: { $in: productIds } })
      .populate("customerId", "name")
      .populate("productId", "name");

    // Reshape for frontend
    const formatted = reviews.map((r) => ({
      _id: r._id,
      productName: r.productId?.name,
      customerName: r.customerId?.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

module.exports = router;



