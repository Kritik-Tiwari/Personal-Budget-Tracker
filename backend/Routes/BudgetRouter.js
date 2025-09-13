const router = require("express").Router();
const ensureAuthenticated = require("../Middlewares/Auth");
const User = require("../Models/User");

// Get budgets
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("budgets");
    res.json({ success: true, budgets: user.budgets || {} });
  } catch (err) {
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
    res.status(500).json({ success: false, message: "Error updating budgets" });
  }
});

module.exports = router;
