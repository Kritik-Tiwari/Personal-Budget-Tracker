// src/components/Home.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { APIUrl, handleError, handleSuccess, fetchWithAuth } from "../utils";
import { ToastContainer } from "react-toastify";
import ExpenseTrackerForm from "../components/ExpenseTrackerForm";
import ExpensesTable from "../components/ExpensesTable";
import ExpenseDetails from "../components/ExpenseDetails";

function Home() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expenseAmt, setExpenseAmt] = useState(0);
  const [incomeAmt, setIncomeAmt] = useState(0);
  const [dark, setDark] = useState(false);

  const navigate = useNavigate();

  // ✅ useCallback to stabilize fetchExpenses
  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses`, { method: "GET" });
      if (res.status === 403 || res.status === 401) {
        navigate("/login");
        return;
      }
      const result = await res.json();
      setExpenses(result.data || []);
    } catch (err) {
      handleError(err);
    }
  }, [navigate]);

  // ✅ include fetchExpenses in dependency array
  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"));
    setDark(localStorage.getItem("theme") === "dark");
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    if (!Array.isArray(expenses)) return;
    const amounts = expenses.map((item) => Number(item.amount) || 0);
    const income = amounts.filter((i) => i > 0).reduce((a, b) => a + b, 0);
    const exp = amounts.filter((i) => i < 0).reduce((a, b) => a + b, 0) * -1;
    setIncomeAmt(income);
    setExpenseAmt(exp);
  }, [expenses]);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loggedInUser");
    handleSuccess("User Logged out");
    navigate("/login");
  };

  const addExpenses = async (data) => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 403 || res.status === 401) {
        navigate("/login");
        return;
      }
      const result = await res.json();
      setExpenses(result.data || []);
      handleSuccess(result.message || "Added");
    } catch (err) {
      handleError(err);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses/${expenseId}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) setExpenses(result.data || []);
      else fetchExpenses();
    } catch (err) {
      handleError(err);
      fetchExpenses();
    }
  };

  const handleEditExpense = async (expenseId, updated) => {
    setExpenses((prev) => prev.map((e) => (e._id === expenseId ? { ...e, ...updated } : e)));
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-100">
          Welcome, <span className="text-indigo-600">{loggedInUser}</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark((d) => !d)}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded"
          >
            Toggle {dark ? "Light" : "Dark"}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <ExpenseDetails incomeAmt={incomeAmt} expenseAmt={expenseAmt} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
            <ExpensesTable
              expenses={expenses}
              handleDeleteExpense={handleDeleteExpense}
              handleEditExpense={handleEditExpense}
              loggedInUser={loggedInUser}
            />
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <ExpenseTrackerForm addExpenses={addExpenses} fetchExpenses={fetchExpenses} />
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Home;
