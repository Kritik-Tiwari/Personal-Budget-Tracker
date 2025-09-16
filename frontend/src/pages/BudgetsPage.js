import React, { useState, useEffect } from "react";
import { fetchWithAuth, APIUrl, handleError, handleSuccess } from "../utils";
import { BudgetChart } from "../components/Charts"; // import chart
import "../styles/forms.css";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editLimit, setEditLimit] = useState("");

  // Capitalize first letter
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  // Fetch budgets from backend
  const fetchBudgets = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/budgets`);
      const data = await res.json();
      if (data.success) {
        setBudgets(
          (data.budgets || []).map((b) => ({
            ...b,
            category: capitalize(b.category),
          }))
        );
      }
    } catch {
      handleError("Failed to fetch budgets");
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Add budget
  const addBudget = async () => {
    if (!newCategory.trim() || !newLimit) return;
    try {
      const res = await fetchWithAuth(`${APIUrl}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory.trim().toLowerCase(),
          limit: Number(newLimit),
        }),
      });
      const data = await res.json();
      if (data.success) {
        handleSuccess("Budget added ✅");
        setNewCategory("");
        setNewLimit("");
        fetchBudgets();
      }
    } catch {
      handleError("Failed to add budget");
    }
  };

  // Edit budget
  const saveEdit = async (category) => {
    if (!editLimit) return;
    try {
      const res = await fetchWithAuth(`${APIUrl}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category.toLowerCase(),
          limit: Number(editLimit),
        }),
      });
      const data = await res.json();
      if (data.success) {
        handleSuccess("Budget updated ✏️");
        setEditingCategory(null);
        setEditLimit("");
        fetchBudgets();
      }
    } catch {
      handleError("Failed to update budget");
    }
  };

  // Delete budget
  const deleteBudget = async (category) => {
    if (!window.confirm(`Delete budget for ${capitalize(category)}?`)) return;
    try {
      const res = await fetchWithAuth(`${APIUrl}/budgets/${category.toLowerCase()}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        handleSuccess("Budget deleted 🗑️");
        fetchBudgets();
      }
    } catch {
      handleError("Failed to delete budget");
    }
  };

  return (
    <div>
      <h1 className="page-title">Budgets</h1>

      {/* Add new budget */}
      <div className="card">
        <h3>Set Category Budget</h3>
        <p className="small muted">Plan monthly budgets by category</p>

        <div className="form-group">
          <input
            className="input"
            placeholder="Category (e.g. Shopping)"
            value={newCategory}
            onChange={(e) => setNewCategory(capitalize(e.target.value))}
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

      {/* Chart Section */}
      {budgets.length > 0 && (
        <div className="card mt-6">
          <h3>Budget vs Spent Overview</h3>
          <BudgetChart budgets={budgets} />
        </div>
      )}

      {/* Budget list */}
      <div className="grid-2 mt-6">
        {budgets.map((b) => {
          const percent = b.limit
            ? Math.min(100, (b.spent / b.limit) * 100)
            : 0;

          return (
            <div key={b.category} className="card group-card">
              <div className="group-header">
                <h3>{capitalize(b.category)}</h3>
                <div>
                  {editingCategory === b.category ? (
                    <>
                      <input
                        className="input"
                        type="number"
                        placeholder="New Limit"
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                        style={{ width: "120px" }}
                      />
                      <button
                        className="btn btn-primary btn-group-action"
                        onClick={() => saveEdit(b.category)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-ghost btn-group-action"
                        onClick={() => setEditingCategory(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-edit-group btn-group-action"
                        onClick={() => {
                          setEditingCategory(b.category);
                          setEditLimit(b.limit);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete-group btn-group-action"
                        onClick={() => deleteBudget(b.category)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

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
                Spent: ₹{b.spent} / ₹{b.limit}
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
