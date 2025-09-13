const mongoose = require("mongoose");
const { Schema } = mongoose;

const GroupExpenseSchema = new Schema({
  text: String,
  amount: Number,
  paidBy: { type: Schema.Types.ObjectId, ref: "User" },
  split: [
    {
      member: { type: Schema.Types.ObjectId, ref: "User" },
      share: Number, // how much this member owes
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const GroupSchema = new Schema({
  name: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  expenses: [GroupExpenseSchema],
});

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },

    avatar: { type: String, default: "/uploads/avatars/default.png" },

    expenses: [
      {
        text: String,
        amount: Number,
        category: String,
        type: { type: String, enum: ["income", "expense"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    budgets: {
      type: Map,
      of: Number, // category → budget value
      default: {},
    },

    groups: [GroupSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
