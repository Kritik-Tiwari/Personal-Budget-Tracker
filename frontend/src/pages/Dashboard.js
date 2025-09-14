import React, { useEffect, useState, useMemo } from "react";
import { APIUrl, handleError, fetchWithAuth } from "../utils";
import ExpenseDetails from "../components/ExpenseDetails";
import ExpensesTable from "../components/ExpensesTable";
import { CategoryBreakdownChart, CashFlowChart } from "../components/Charts";

export default function Dashboard() {
  const [loggedInUser, setLoggedInUser] = useState("User");
  const [expenses, setExpenses] = useState([]);
  const [expenseAmt, setExpenseAmt] = useState(0);
  const [incomeAmt, setIncomeAmt] = useState(0);

  // 🔘 Separate filters
  const [pieFilter, setPieFilter] = useState("all");
  const [flowFilter, setFlowFilter] = useState("all");

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    setLoggedInUser(storedUser || "User");
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

  // ✅ Memoized filter for Pie chart
  const filteredExpenses = useMemo(() => {
    if (pieFilter === "all") return expenses;
    return expenses.filter((e) => e.type === pieFilter);
  }, [expenses, pieFilter]);

  // 🔘 Tab button
  const TabButton = ({ value, label, icon, active, onClick }) => (
    <button
      className={`tab-btn ${active === value ? "active" : ""}`}
      onClick={() => onClick(value)}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="main-area">
      <h1 className="page-title">Welcome, {loggedInUser}</h1>

      {/* Balance Cards */}
      <div className="card">
        <ExpenseDetails incomeAmt={incomeAmt} expenseAmt={expenseAmt} />
      </div>

      {/* Charts */}
      <div className="mt-6">
        {/* === PIE CHART === */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>Category Breakdown</h3>
          <div className="tab-toggle">
            <TabButton value="all" label="All" icon="🔄" active={pieFilter} onClick={setPieFilter} />
            <TabButton value="income" label="Income" icon="💼" active={pieFilter} onClick={setPieFilter} />
            <TabButton value="expense" label="Expense" icon="📉" active={pieFilter} onClick={setPieFilter} />
          </div>
          <CategoryBreakdownChart expenses={filteredExpenses} filter={pieFilter} height={320} />
        </div>

        {/* === CASH FLOW CHART === */}
        <div className="card">
          <h3>Cash Flow Over Time</h3>
          <div className="tab-toggle">
            <TabButton value="all" label="All" icon="🔄" active={flowFilter} onClick={setFlowFilter} />
            <TabButton value="income" label="Income" icon="💼" active={flowFilter} onClick={setFlowFilter} />
            <TabButton value="expense" label="Expense" icon="📉" active={flowFilter} onClick={setFlowFilter} />
          </div>
          <CashFlowChart expenses={expenses} filter={flowFilter} height={320} />
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <div className="card">
          <ExpensesTable
            expenses={expenses}
            handleDeleteExpense={handleDeleteExpense}
            handleEditExpense={handleEditExpense}
            loggedInUser={loggedInUser}
          />
        </div>
      </div>

      {/* ✅ Styles */}
      <style>
        {`
          .tab-toggle {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
            border-bottom: 2px solid #e5e7eb;
          }
          .tab-btn {
            position: relative;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px 12px;
            font-weight: 500;
            color: #6b7280;
            transition: color 0.2s ease;
          }
          .tab-btn:hover {
            color: #374151;
          }
          .tab-btn.active {
            color: #4f46e5;
          }
          .tab-btn.active::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -2px;
            height: 2px;
            width: 100%;
            background-color: #4f46e5;
            transform: scaleX(1);
            transition: transform 0.3s ease;
          }
          .tab-btn::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -2px;
            height: 2px;
            width: 100%;
            background-color: #4f46e5;
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }
        `}
      </style>
    </div>
  );
}
