

const addExpense = (req,res) => {
    res.send('addExpense');
}

const fetchExpenses = (req,res) => {
    res.send('fetchExpense');
}

const deleteExpenses = (req,res) => {
    res.send('deleteExpense');
}

module.exports = {
    addExpense,
    fetchExpenses,
    deleteExpenses
};