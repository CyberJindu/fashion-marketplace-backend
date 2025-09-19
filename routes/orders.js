const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");

const router = express.Router();

/** ---------------- CREATE ORDERS ---------------- */
router.post("/", auth, async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: "No items" });
    }

    // Group by vendor
    const grouped = {};
    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }

      const vid = product.vendorId.toString();
      if (!grouped[vid]) grouped[vid] = [];
      grouped[vid].push({
        productId: product._id,
        quantity: it.quantity,
        price: product.price,
      });
    }

    // Save separate order per vendor
    const created = [];
    for (const [vendorId, vendorItems] of Object.entries(grouped)) {
      const total = vendorItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const order = new Order({
        customerId: req.user._id,
        vendorId,
        items: vendorItems,
        total,
        paymentStatus: "Confirmed",
        orderStatus: "Pending",
      });
      await order.save();
      created.push(order);
    }

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/** ---------------- CUSTOMER ORDERS ---------------- */
router.get("/customer/:id", auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.params.id })
      .populate("items.productId") // ✅ get product details
      .populate("vendorId", "name email"); // optional → show vendor info
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

/** ---------------- VENDOR ORDERS ---------------- */
router.get("/vendor/:id", auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ vendorId: req.params.id })
      .populate("items.productId") // ✅ get product details
      .populate("customerId", "name email"); // ✅ show customer info
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

/** ---------------- UPDATE ORDER STATUS ---------------- */
router.patch("/:id/status", auth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });

    // Security check → vendor can only update their own orders
    if (order.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    order.orderStatus = req.body.orderStatus || order.orderStatus;
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
