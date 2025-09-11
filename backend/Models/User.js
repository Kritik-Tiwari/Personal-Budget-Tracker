const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExpenseSchema = new Schema(
  {
    text: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: "Other" },
    recurring: {
      interval: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], default: null },
      nextRun: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

const UserSchema = new Schema({
  name: { type: String, required: true },   // ✅ Added
  email: { type: String, required: true, unique: true }, // ✅ Added
  password: { type: String, required: true },
  refreshToken: { type: String }, // ✅ optional refresh token storage
  expenses: [ExpenseSchema],
});

module.exports = mongoose.model("User", UserSchema);
