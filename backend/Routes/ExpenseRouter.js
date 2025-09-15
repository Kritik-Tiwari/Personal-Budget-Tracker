const router = require('express').Router();
const {
  fetchExpenses,
  addExpenses,
  deleteExpenses,
  editExpense, // import edit controller
} = require('../Controllers/ExpenseController');

// Routes
router.get('/', fetchExpenses);          // Get all expenses
router.post('/', addExpenses);           // Add new expense
router.put('/:expenseId', editExpense);  // Update/edit expense
router.delete('/:expenseId', deleteExpenses); // Delete expense

module.exports = router;
