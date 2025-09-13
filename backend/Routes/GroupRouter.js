const router = require("express").Router();
const ensureAuthenticated = require("../Middlewares/Auth");
const User = require("../Models/User");

// Fetch all groups
router.get("/", ensureAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id).populate("groups.members", "name email");
  res.json({ success: true, groups: user.groups });
});

// Create group
router.post("/", ensureAuthenticated, async (req, res) => {
  const { name, members } = req.body;
  const user = await User.findById(req.user._id);
  user.groups.push({ name, members });
  await user.save();
  res.json({ success: true, groups: user.groups });
});

// Add expense to group
router.post("/:groupId/expense", ensureAuthenticated, async (req, res) => {
  const { text, amount, paidBy, split } = req.body;
  const user = await User.findById(req.user._id);
  const group = user.groups.id(req.params.groupId);

  group.expenses.push({ text, amount, paidBy, split });
  await user.save();
  res.json({ success: true, group });
});

// Get balances
router.get("/:groupId/balances", ensureAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id).populate("groups.members", "name email");
  const group = user.groups.id(req.params.groupId);

  if (!group) return res.status(404).json({ success: false, message: "Group not found" });

  const balances = {};
  group.members.forEach((m) => {
    balances[m._id] = { user: m, balance: 0 };
  });

  group.expenses.forEach((exp) => {
    exp.split.forEach((s) => {
      balances[s.member].balance -= s.share;
    });
    balances[exp.paidBy].balance += exp.amount;
  });

  res.json({ success: true, balances });
});

// Record settlement
router.post("/:groupId/settle", ensureAuthenticated, async (req, res) => {
  const { from, to, amount } = req.body;
  const user = await User.findById(req.user._id);
  const group = user.groups.id(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: "Group not found" });

  group.expenses.push({
    text: "Settlement",
    amount,
    paidBy: from,
    split: [{ member: to, share: amount }],
  });

  await user.save();
  res.json({ success: true, group });
});

module.exports = router;
