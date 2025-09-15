const Expense = require("../Models/Expense");

// Get all expenses (for logged in user)
exports.fetchExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ data: expenses });
  } catch (err) {
    console.error("Fetch expenses error:", err);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

// Add new expense/income
exports.addExpenses = async (req, res) => {
  try {
    let { text, amount, category, type } = req.body;

    if (!text || !amount || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //normalize category to lowercase
    const normalizedCategory = category ? category.trim().toLowerCase() : "other";

    const newExpense = new Expense({
      text: text.trim(),
      amount,
      category: normalizedCategory,
      type,
      userId: req.user._id,
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    console.error("Add expense error:", err);
    res.status(500).json({ message: "Error adding expense" });
  }
};

// Edit an expense/income
exports.editExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    let { text, amount, category, type } = req.body;

    //normalize category to lowercase
    const normalizedCategory = category ? category.trim().toLowerCase() : "other";

    const updated = await Expense.findOneAndUpdate(
      { _id: expenseId, userId: req.user._id },
      {
        text: text ? text.trim() : "",
        amount,
        category: normalizedCategory,
        type,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Edit expense error:", err);
    res.status(500).json({ message: "Error updating expense" });
  }
};

// Delete an expense/income
exports.deleteExpenses = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const deleted = await Expense.findOneAndDelete({
      _id: expenseId,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("Delete expense error:", err);
    res.status(500).json({ message: "Error deleting expense" });
  }
};
