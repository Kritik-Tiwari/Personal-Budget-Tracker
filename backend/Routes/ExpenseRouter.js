const router = require('express').Router();
const { fetchExpenses, addExpenses, deleteExpenses } = require('../Controllers/ExpenseController');


router.get('/', fetchExpenses);
router.post('/', addExpenses);
router.delete('/:expenseId', deleteExpenses);

module.exports = router;
