const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null },
    avatar: { type: String, default: "" },
    currency: { type: String, default: "USD" },
    monthlyBudget: { type: Number, default: 0 },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    isActive: { type: Boolean, default: true },

    // No email verification step: accounts are active as soon as they are created.
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
