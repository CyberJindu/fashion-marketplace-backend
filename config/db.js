const mongoose = require("mongoose");

async function connectDB() {
  try {
    // Force a timeout + direct error reporting
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // max 5s wait
      connectTimeoutMS: 5000,         // also 5s connect
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
    throw err; // Pass error back to index.js
  }

  // Add listener to catch background errors
  mongoose.connection.on("error", (err) => {
    console.error("⚡ MongoDB connection error:", err.message);
  });
}

module.exports = connectDB;
