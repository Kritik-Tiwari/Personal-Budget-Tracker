// Routes/ExpenseRouter.js
const express = require('express');
const router = express.Router();
const { addExpense, fetchExpenses, deleteExpenses } = require('../Controllers/ExpenseController');

// ✅ route names match
router.post('/add', addExpense);
router.get('/', fetchExpenses); 
router.delete('/delete/:id', deleteExpenses);

module.exports = router;
