const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // keep for display
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "vendor"], default: "customer" },

  // Vendor profile fields
  businessName: String,
  ownerName: String,
  phone: String,
  location: String,
  category: String,
  description: String,
  bankName: String,
  bankAccount: String,
  logo: String, // Cloudinary URL

  // Customer profile fields
  customerProfile: {
    address: String,
    phone: String,
  },
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);


