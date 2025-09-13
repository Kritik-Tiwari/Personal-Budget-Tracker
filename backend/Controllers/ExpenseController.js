const UserModel = require("../Models/User");

// ➕ Add new record (expense or income)
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

    // 👇 force type field
    userData.expenses.push({
      ...body,
      type: body.type || "expense",
    });

    await userData.save();

    return res.status(200).json({
      message: `${body.type || "Expense"} Added Successfully`,
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

// 📥 Fetch all records
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
      message: "Fetched Records Successfully",
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

// ❌ Delete
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
      message: "Record deleted successfully",
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

// ✏️ Edit
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
      return res.status(404).json({ message: "Record not found", success: false });
    }

    Object.assign(expense, req.body);

    await userData.save();

    return res.status(200).json({
      message: "Record Updated Successfully",
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

module.exports = {
  addExpenses,
  fetchExpenses,
  deleteExpenses,
  editExpense,
};
