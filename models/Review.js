const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Review", reviewSchema);

