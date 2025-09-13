import React, { useEffect, useState } from "react";
import ExpensesTable from "../components/ExpensesTable";
import ExpenseTrackerForm from "../components/ExpenseTrackerForm";
import { fetchWithAuth, APIUrl, handleSuccess, handleError } from "../utils";
import { CategoryBreakdownChart, CashFlowChart } from "../components/Charts";

export default function IncomePage() {
  const [items, setItems] = useState([]);

  const fetchIncomes = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses`);
      const j = await res.json();
      setItems((j.data || []).filter((e) => e.type === "income"));
    } catch {
      handleError("Failed to load incomes");
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income?")) return;
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(items.filter((e) => e._id !== id));
        handleSuccess("Income deleted 🗑️");
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
        handleSuccess("Income updated ✏️");
        fetchIncomes();
      }
    } catch {
      handleError("Update failed");
    }
  };

  return (
    <div>
      <h1 className="page-title">Income</h1>

      {/* Table + Add Income side by side */}
      <div className="grid-2">
        <div className="card">
          <ExpensesTable
            expenses={items}
            handleDeleteExpense={handleDeleteExpense}
            handleEditExpense={handleEditExpense}
          />
        </div>
        <div className="card wide-card">
          <h3>Add Income</h3>
          <ExpenseTrackerForm
            isIncome={true}
            addExpenses={async (d) => {
              d.amount = Math.abs(Number(d.amount || 0));
              d.type = "income";
              await fetchWithAuth(`${APIUrl}/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(d),
              });
              handleSuccess("Income added ✅");
              fetchIncomes();
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
