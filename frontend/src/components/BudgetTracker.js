import React, { useState, useEffect } from "react";
import { fetchWithAuth, APIUrl } from "../utils";

export default function BudgetTracker({ expenses }) {
  const [budgets, setBudgets] = useState({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadBudgets = async () => {
      const res = await fetchWithAuth(`${APIUrl}/budgets`);
      const j = await res.json();
      setBudgets(j.budgets || {});
    };
    loadBudgets();
  }, []);

  const saveBudgets = async () => {
    const res = await fetchWithAuth(`${APIUrl}/budgets`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budgets }),
    });
    const j = await res.json();
    setBudgets(j.budgets || {});
    setEditMode(false);
  };

  const expenseMap = {};
  (expenses || []).forEach((e) => {
    if (e.type === "expense") {
      expenseMap[e.category] =
        (expenseMap[e.category] || 0) + Number(e.amount);
    }
  });

  return (
    <div>
      <h3>Category Budgets</h3>
      <button onClick={() => setEditMode(!editMode)} className="btn btn-ghost">
        {editMode ? "Cancel" : "Edit Budgets"}
      </button>

      <div className="budget-list">
        {Object.keys(budgets).map((cat) => {
          const spent = expenseMap[cat] || 0;
          const budget = budgets[cat] || 0;
          const pct = budget ? Math.min((spent / budget) * 100, 100) : 0;
          const over = budget && spent > budget;

          return (
            <div key={cat} className="budget-item">
              <div className="budget-header">
                <span>{cat}</span>
                {editMode ? (
                  <input
                    type="number"
                    value={budgets[cat]}
                    onChange={(e) =>
                      setBudgets({ ...budgets, [cat]: e.target.value })
                    }
                    style={{ width: 80 }}
                  />
                ) : (
                  <span>
                    ₹{spent} / ₹{budget}
                  </span>
                )}
              </div>
              {!editMode && (
                <div className="budget-bar">
                  <div
                    className="budget-progress"
                    style={{
                      width: `${pct}%`,
                      background: over ? "red" : "#4caf50",
                    }}
                  />
                </div>
              )}
              {over && !editMode && <div className="small alert">⚠ Overspent</div>}
            </div>
          );
        })}
      </div>

      {editMode && (
        <button onClick={saveBudgets} className="btn btn-primary">
          Save Budgets
        </button>
      )}
    </div>
  );
}
