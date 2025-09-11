// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { APIUrl, handleError, handleSuccess, fetchWithAuth } from "../utils";
import ExpenseDetails from "../components/ExpenseDetails";
import ExpensesTable from "../components/ExpensesTable";
import ExpenseTrackerForm from "../components/ExpenseTrackerForm";
import { CategoryBreakdownChart, CashFlowChart } from "../components/Charts";

export default function Dashboard() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expenseAmt, setExpenseAmt] = useState(0);
  const [incomeAmt, setIncomeAmt] = useState(0);

  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser") || "User");
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (!Array.isArray(expenses)) return;
    const amounts = expenses.map((item) => Number(item.amount) || 0);
    const income = amounts.filter((i) => i > 0).reduce((a, b) => a + b, 0);
    const exp = amounts.filter((i) => i < 0).reduce((a, b) => a + b, 0) * -1;
    setIncomeAmt(income);
    setExpenseAmt(exp);
  }, [expenses]);

  const fetchExpenses = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses`, { method: "GET" });
      if (res.status === 401 || res.status === 403) return;
      const result = await res.json();
      setExpenses(result.data || []);
    } catch (err) {
      handleError(err);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses/${expenseId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) setExpenses(result.data || []);
      else fetchExpenses();
    } catch (err) {
      handleError(err);
      fetchExpenses();
    }
  };

  const handleEditExpense = async (expenseId, updated) => {
    setExpenses((prev) =>
      prev.map((e) => (e._id === expenseId ? { ...e, ...updated } : e))
    );
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses/${expenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const result = await res.json();
      if (result.success) setExpenses(result.data || []);
      else fetchExpenses();
    } catch (err) {
      handleError(err);
      fetchExpenses();
    }
  };

  const addExpenses = async (data) => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setExpenses(result.data || []);
      handleSuccess(result.message || "Added");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="main-area">
      <h1 className="page-title">Welcome, {loggedInUser}</h1>

      {/* Balance Cards */}
      <div className="card">
        <ExpenseDetails incomeAmt={incomeAmt} expenseAmt={expenseAmt} />
      </div>

      {/* Charts */}
      <div className="grid-2 mt-6">
        <div className="card">
          <h3>Category Breakdown</h3>
          <CategoryBreakdownChart expenses={expenses} />
        </div>
        <div className="card">
          <h3>Cash Flow Over Time</h3>
          <CashFlowChart expenses={expenses} />
        </div>
      </div>

      {/* Table + Form */}
      <div className="grid-2 mt-6">
        <div className="card">
          <ExpensesTable
            expenses={expenses}
            handleDeleteExpense={handleDeleteExpense}
            handleEditExpense={handleEditExpense}
            loggedInUser={loggedInUser}
          />
        </div>

        <div className="card">
          <h3>Add Transaction</h3>
          <ExpenseTrackerForm
            addExpenses={addExpenses}
            fetchExpenses={fetchExpenses}
          />
        </div>
      </div>
    </div>
  );
}
