import React, { useState, useEffect } from "react";
import { fetchWithAuth, APIUrl } from "../utils";
import "../styles/forms.css";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([
    { category: "Food", limit: 10000 },
    { category: "Transport", limit: 5000 },
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses`, { method: "GET" });
      const data = await res.json();
      if (data.success) setExpenses(data.data || []);
    } catch (err) {
      console.error("Fetch expenses error:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const getSpent = (category) =>
    expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + Math.abs(Number(e.amount || 0)), 0);

  const addBudget = () => {
    if (!newCategory.trim() || !newLimit) return;
    setBudgets([...budgets, { category: newCategory.trim(), limit: Number(newLimit) }]);
    setNewCategory("");
    setNewLimit("");
  };

  return (
    <div>
      <h1 className="page-title">Budgets</h1>

      <div className="card">
        <h3>Set Category Budget</h3>
        <p className="small muted">Plan monthly budgets by category</p>

        <div className="form-group">
          <input
            className="input"
            placeholder="Category (e.g. Shopping)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            className="input"
            type="number"
            placeholder="Limit (₹)"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
          />
        </div>

        <button className="btn btn-primary full-width" onClick={addBudget}>
          Add
        </button>
      </div>

      <div className="grid-2 mt-6">
        {budgets.map((b, i) => {
          const spent = getSpent(b.category);
          const percent = Math.min(100, (spent / b.limit) * 100);

          return (
            <div key={i} className="card">
              <h3>{b.category}</h3>
              <p className="small muted">Monthly Limit: ₹{b.limit}</p>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{
                    width: `${percent}%`,
                    background: percent >= 100 ? "red" : "var(--accent)",
                  }}
                ></div>
              </div>
              <p className="small">
                Spent: ₹{spent} / ₹{b.limit}
              </p>
              {percent >= 100 && (
                <p className="small" style={{ color: "red" }}>
                  ⚠️ Over Budget!
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
