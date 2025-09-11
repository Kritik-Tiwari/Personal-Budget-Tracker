// src/pages/IncomePage.js
import React, { useEffect, useState } from "react";
import ExpensesTable from "../components/ExpensesTable";
import ExpenseTrackerForm from "../components/ExpenseTrackerForm";
import { fetchWithAuth, APIUrl } from "../utils";
import { CategoryBreakdownChart, CashFlowChart } from "../components/Charts";

export default function IncomePage() {
  const [items, setItems] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/expenses`, { method: "GET" });
      const j = await res.json();
      setItems((j.data || []).filter((e) => Number(e.amount) > 0));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div>
      <h1 className="page-title">Income</h1>
      <div className="grid-2">
        <div className="card">
          <ExpensesTable
            expenses={items}
            handleDeleteExpense={() => {}}
            handleEditExpense={() => {}}
            loggedInUser={localStorage.getItem("loggedInUser")}
          />
        </div>
        <div className="card">
          <h3>Add Income</h3>
          <ExpenseTrackerForm
            addExpenses={async (d) => {
              d.amount = Math.abs(Number(d.amount || 0));
              await fetchWithAuth(`${APIUrl}/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(d),
              });
              fetchExpenses();
            }}
            fetchExpenses={fetchExpenses}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mt-6">
        <div className="card">
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
