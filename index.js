console.log("🚀 Starting server...");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const reviewRoutes = require("./routes/reviews");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// test
app.get("/", (req, res) => res.send("Fashion Marketplace API is running"));

// error handler
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 3010;

console.log("🔌 Attempting DB connection...");

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("⚠️ DB connection failed, but server will still start:", err.message);
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT} (no DB)`),
    );
  });
