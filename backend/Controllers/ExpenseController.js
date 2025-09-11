const UserModel = require("../Models/User");

// ➕ Add new expense
const addExpenses = async (req, res) => {
  const body = req.body;
  const { _id } = req.user || {};

  if (!_id) {
    return res.status(403).json({ message: "Unauthorized", success: false });
  }

  try {
    const userData = await UserModel.findById(_id);
    if (!userData) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    userData.expenses.push(body);
    await userData.save();

    return res.status(200).json({
      message: "Expense Added Successfully",
      success: true,
      data: userData.expenses,
    });
  } catch (err) {
    console.error("Add Expenses Error:", err);
    return res.status(500).json({
      message: "Something Went Wrong",
      error: err.message,
      success: false,
    });
  }
};

// 📥 Fetch all expenses for logged-in user
const fetchExpenses = async (req, res) => {
  const { _id } = req.user || {};

  if (!_id) {
    return res.status(403).json({ message: "Unauthorized", success: false });
  }

  try {
    const userData = await UserModel.findById(_id).select("expenses");

    if (!userData) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      message: "Fetched Expenses Successfully",
      success: true,
      data: userData.expenses,
    });
  } catch (err) {
    console.error("Fetch Expenses Error:", err);
    return res.status(500).json({
      message: "Something Went Wrong",
      error: err.message,
      success: false,
    });
  }
};

// ❌ Delete an expense by ID
const deleteExpenses = async (req, res) => {
  const { expenseId } = req.params;
  const { _id } = req.user || {};

  if (!_id) {
    return res.status(403).json({ message: "Unauthorized", success: false });
  }

  try {
    const userData = await UserModel.findByIdAndUpdate(
      _id,
      { $pull: { expenses: { _id: expenseId } } },
      { new: true }
    );

    if (!userData) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      message: "Expense deleted successfully",
      success: true,
      data: userData.expenses,
    });
  } catch (err) {
    console.error("Delete Expense Error:", err);
    return res.status(500).json({
      message: "Something Went Wrong",
      error: err.message,
      success: false,
    });
  }
};

// ✏️ Edit/Update an expense by ID
const editExpense = async (req, res) => {
  const { expenseId } = req.params;
  const { _id } = req.user || {};

  if (!_id) {
    return res.status(403).json({ message: "Unauthorized", success: false });
  }

  try {
    const userData = await UserModel.findById(_id);
    if (!userData) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const expense = userData.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found", success: false });
    }

    // Update fields
    Object.assign(expense, req.body);

    await userData.save();

    return res.status(200).json({
      message: "Expense Updated Successfully",
      success: true,
      data: userData.expenses,
    });
  } catch (err) {
    console.error("Edit Expense Error:", err);
    return res.status(500).json({
      message: "Something Went Wrong",
      error: err.message,
      success: false,
    });
  }
};

// ✅ Export everything properly
module.exports = {
  addExpenses,
  fetchExpenses,
  deleteExpenses,
  editExpense, // 👈 new controller
};
