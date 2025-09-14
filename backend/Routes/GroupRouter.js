const router = require("express").Router();
const ensureAuthenticated = require("../Middlewares/Auth");
const User = require("../Models/User");

// ===============================
// Fetch all groups
// ===============================
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "groups.members",
      "name email"
    );
    res.json({ success: true, groups: user.groups });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch groups" });
  }
});

// ===============================
// Create new group
// ===============================
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { name, members } = req.body;
    const user = await User.findById(req.user._id);
    user.groups.push({ name, members });
    await user.save();
    res.json({ success: true, groups: user.groups });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create group" });
  }
});

// ===============================
// Edit group
// ===============================
router.put("/:groupId", ensureAuthenticated, async (req, res) => {
  try {
    const { name, members } = req.body;
    const user = await User.findById(req.user._id);
    const group = user.groups.id(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (name) group.name = name;
    if (members) group.members = members;

    await user.save();
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update group" });
  }
});

// ===============================
// Delete group
// ===============================
router.delete("/:groupId", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const group = user.groups.id(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    group.deleteOne();
    await user.save();

    res.json({ success: true, groups: user.groups });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete group" });
  }
});

// ===============================
// ✅ Add member
// ===============================
router.post("/:groupId/members", ensureAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    const group = user.groups.id(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    group.members.push({ name });
    await user.save();

    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add member" });
  }
});

// ===============================
// ✅ Edit member
// ===============================
router.put("/:groupId/members/:memberId", ensureAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    const group = user.groups.id(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const member = group.members.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    member.name = name || member.name;
    await user.save();

    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to edit member" });
  }
});

// ===============================
// ✅ Delete member
// ===============================
router.delete("/:groupId/members/:memberId", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const group = user.groups.id(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const member = group.members.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    member.deleteOne();
    await user.save();

    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete member" });
  }
});

// ===============================
// Add expense to group
// ===============================
router.post("/:groupId/expense", ensureAuthenticated, async (req, res) => {
  try {
    const { text, amount, paidBy, split } = req.body;
    const user = await User.findById(req.user._id);
    const group = user.groups.id(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    group.expenses.push({ text, amount, paidBy, split });
    await user.save();
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add expense" });
  }
});

// ===============================
// Get balances
// ===============================
router.get("/:groupId/balances", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "groups.members",
      "name email"
    );
    const group = user.groups.id(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

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
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch balances" });
  }
});

// ===============================
// Record settlement
// ===============================
router.post("/:groupId/settle", ensureAuthenticated, async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const user = await User.findById(req.user._id);
    const group = user.groups.id(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    group.expenses.push({
      text: "Settlement",
      amount,
      paidBy: from,
      split: [{ member: to, share: amount }],
    });

    await user.save();
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to settle" });
  }
});

module.exports = router;
