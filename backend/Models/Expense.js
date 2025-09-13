const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    amount: { type: Number, required: true }, // income = positive, expense = negative
    category: { type: String, default: "Other" },
    type: { type: String, enum: ["income", "expense"], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
