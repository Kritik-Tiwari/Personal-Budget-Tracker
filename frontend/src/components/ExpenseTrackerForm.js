import React, { useState } from "react";
import { incomeCategories, expenseCategories } from "../constants/categories";
import { handleError } from "../utils";

export default function ExpenseTrackerForm({ isIncome, addExpenses }) {
  const [form, setForm] = useState({
    text: "",
    amount: "",
    category: "Other",
  });

  const categories = isIncome ? incomeCategories : expenseCategories;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text || !form.amount) {
      return handleError("Please fill all fields");
    }

    // ✅ Send only the string label to backend
    await addExpenses({
      ...form,
      category: form.category.trim(),
      text: form.text.trim(),
    });

    // Reset after submit
    setForm({
      text: "",
      amount: "",
      category: "Other",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          name="text"
          value={form.text}
          onChange={handleChange}
          placeholder="Description"
          className="input"
          required
        />
      </div>

      <div className="form-group">
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="input"
          required
        />
      </div>

      <div className="form-group">
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="select"
        >
          {categories.map((c) => (
            <option key={c.label} value={c.label}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-primary">
        {isIncome ? "Add Income" : "Add Expense"}
      </button>
    </form>
  );
}
