const router = require("express").Router();
const ensureAuthenticated = require("../Middlewares/Auth");
const User = require("../Models/User");
const Expense = require("../Models/Expense");

// ===============================
// Get budgets with real-time spending
// ===============================
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("budgets");

    if (!user || !user.budgets) {
      return res.json({ success: true, budgets: [] });
    }

    // aggregate expenses by normalized lowercase category
    const expenses = await Expense.aggregate([
      { $match: { userId: req.user._id, type: "expense" } },
      {
        $group: {
          _id: { $toLower: "$category" }, // normalize to lowercase
          totalSpent: { $sum: { $abs: "$amount" } }, // always positive
        },
      },
    ]);

    // make lookup
    const spendingMap = {};
    expenses.forEach((e) => {
      spendingMap[e._id] = e.totalSpent;
    });

    // normalize budget keys to lowercase before matching
    const result = Array.from(user.budgets.entries()).map(
      ([category, limit]) => {
        const normalizedCategory = category.toLowerCase();
        return {
          category, // keep original case for frontend display
          limit,
          spent: spendingMap[normalizedCategory] || 0,
        };
      }
    );

    res.json({ success: true, budgets: result });
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ success: false, message: "Error fetching budgets" });
  }
});

// ===============================
// Add or update a single budget
// ===============================
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    let { category, limit } = req.body;

    if (!category || !limit) {
      return res
        .status(400)
        .json({ success: false, message: "Category and limit required" });
    }

    const normalizedCategory = category.trim().toLowerCase();

    const user = await User.findById(req.user._id);
    user.budgets.set(normalizedCategory, Number(limit));
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving budget:", err);
    res.status(500).json({ success: false, message: "Error saving budget" });
  }
});

// ===============================
// Delete a budget category
// ===============================
router.delete("/:category", ensureAuthenticated, async (req, res) => {
  try {
    const category = req.params.category.trim().toLowerCase();
    const user = await User.findById(req.user._id);

    if (!user.budgets.has(category)) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    user.budgets.delete(category);
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).json({ success: false, message: "Error deleting budget" });
  }
});

module.exports = router;
