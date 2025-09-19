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
    const reviews = await Review.find()
      .populate({
        path: "productId",
        match: { vendorId: req.params.vendorId }, // only vendor's products
        select: "name vendorId"
      })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    // filter out reviews where productId is null (not this vendor's)
    const vendorReviews = reviews.filter(r => r.productId);

    res.json(vendorReviews);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


