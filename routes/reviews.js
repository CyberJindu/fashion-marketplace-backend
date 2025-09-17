const express = require("express");
const Review = require("../models/Review");
const Order = require("../models/Order");
const { auth } = require("../middleware/auth");

const router = express.Router();

// add review
router.post("/", auth, async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.customerId.toString() !== req.user._id.toString())
      return res.status(400).json({ message: "Invalid order" });
    if (order.orderStatus !== "Delivered")
      return res.status(400).json({ message: "Only after delivery" });

    const review = new Review({ productId, orderId, customerId: req.user._id, rating, comment });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

// product reviews
router.get("/product/:id", async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).populate("customerId", "name");
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
