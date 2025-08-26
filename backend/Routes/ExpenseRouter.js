// Routes/ExpenseRouter.js
const express = require('express');
const router = express.Router();
const { addExpense, fetchExpenses, deleteExpenses } = require('../Controllers/ExpenseController');

// handle POST directly at /expenses
router.post('/', addExpense); 
router.get('/', fetchExpenses); 
router.delete('/:id', deleteExpenses);

module.exports = router;
