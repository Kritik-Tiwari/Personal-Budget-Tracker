const { fetchExpenses, addExpenses } = require('../Controllers/ExpenseController');

const router = require('express').Router();

//fetch all the expenses of user based on user_id
router.get('/', fetchExpenses);
//add Expenses
router.post('/', addExpenses);
//delete Expenses
router.delete('/', deleteExpenses);

module.exports = router;