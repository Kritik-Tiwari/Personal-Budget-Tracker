// src/ExpenseTrackerForm.js
import React, { useState } from "react";

function ExpenseTrackerForm({ addExpenses, fetchExpenses }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [recurring, setRecurring] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || !amount) return alert("Please enter description and amount");
    const payload = {
      text,
      amount: Number(amount),
      category,
      recurring,
      createdAt: new Date().toISOString(),
    };
    await addExpenses(payload);
    setText("");
    setAmount("");
    setCategory("Other");
    setRecurring(false);
    if (fetchExpenses) fetchExpenses();
  };

  return (
    <div className="card">
      <h3 style={{ margin: 0, marginBottom: 8 }}>Add Transaction</h3>
      <div className="small muted">Quickly add income or expense</div>

      <div className="form-row" style={{ marginTop: 12 }}>
        <input
          className="input"
          placeholder="Description"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          className="input"
          placeholder="Amount (e.g., 500 or -200)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-row">
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Other</option>
          <option>Salary</option>
          <option>Groceries</option>
          <option>Transport</option>
          <option>Entertainment</option>
        </select>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          Recurring
        </label>
      </div>

      <button className="btn btn-primary add-btn" onClick={handleSubmit}>Add Transaction</button>
    </div>
  );
}

export default ExpenseTrackerForm;
