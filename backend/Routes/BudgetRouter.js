const router = require("express").Router();
const ensureAuthenticated = require("../Middlewares/Auth");
const User = require("../Models/User");
const Expense = require("../Models/Expense");

// Get budgets with real-time spending
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("budgets");

    if (!user || !user.budgets) {
      return res.json({ success: true, budgets: [] });
    }

    // aggregate expenses by category
    const expenses = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", totalSpent: { $sum: "$amount" } } }
    ]);

    // convert expenses into a lookup map
    const spendingMap = {};
    expenses.forEach(e => {
      spendingMap[e._id] = e.totalSpent;
    });

    // format result
    const result = Object.entries(user.budgets).map(([category, budget]) => ({
      category,
      budget,
      spent: spendingMap[category] || 0
    }));

    res.json({ success: true, budgets: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching budgets" });
  }
});

// Update budgets
router.put("/", ensureAuthenticated, async (req, res) => {
  try {
    const { budgets } = req.body; // { Food: 5000, Rent: 10000 }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { budgets },
      { new: true }
    ).select("budgets");
    res.json({ success: true, budgets: user.budgets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating budgets" });
  }
});

module.exports = router;
