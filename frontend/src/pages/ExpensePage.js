import React, { useState, useEffect } from "react";
import { fetchWithAuth, APIUrl, handleSuccess, handleError } from "../utils";
import ExpensesTable from "../components/ExpensesTable";
import ExpenseTrackerForm from "../components/ExpenseTrackerForm";
import { CategoryBreakdownChart, CashFlowChart } from "../components/Charts";

export default function ExpensePage() {
  const [items, setItems] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses`);
      const j = await res.json();
      setItems((j.data || []).filter((e) => e.type === "expense"));
    } catch {
      handleError("Failed to load expenses");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(items.filter((e) => e._id !== id));
        handleSuccess("Expense deleted 🗑️");
      }
    } catch {
      handleError("Delete failed");
    }
  };

  const handleEditExpense = async (id, updatedData) => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        handleSuccess("Expense updated ✏️");
        fetchExpenses();
      }
    } catch {
      handleError("Update failed");
    }
  };

  return (
    <div>
      <h1 className="page-title">Expenses</h1>

      {/* Table + Add Expense side by side */}
      <div className="grid-2">
        <div className="card">
          <ExpensesTable
            expenses={items}
            handleDeleteExpense={handleDeleteExpense}
            handleEditExpense={handleEditExpense}
          />
        </div>
        <div className="card wide-card">
          <h3>Add Expense</h3>
          <ExpenseTrackerForm
            isIncome={false}
            addExpenses={async (d) => {
              d.amount = -Math.abs(Number(d.amount || 0));
              d.type = "expense";
              await fetchWithAuth(`${APIUrl}/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(d),
              });
              handleSuccess("Expense added ✅");
              fetchExpenses();
            }}
          />
        </div>
      </div>

      {/* Charts stacked below */}
      <div className="mt-6">
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>Category Breakdown</h3>
          <CategoryBreakdownChart expenses={items} />
        </div>
        <div className="card">
          <h3>Cash Flow Over Time</h3>
          <CashFlowChart expenses={items} />
        </div>
      </div>
    </div>
  );
}
