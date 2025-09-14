import React, { useState, useEffect } from "react";
import { incomeCategories, expenseCategories } from "../constants/categories";
import { handleError } from "../utils";

// ✅ Capitalize helper
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export default function ExpenseTrackerForm({
  isIncome,
  addExpenses,
  initialData = null,
}) {
  const [form, setForm] = useState({
    text: "",
    amount: "",
    category: "other", // ✅ lowercase default
  });

  const categories = isIncome ? incomeCategories : expenseCategories;

  // ✅ When editing, pre-fill form with normalized lowercase category
  useEffect(() => {
    if (initialData) {
      setForm({
        text: initialData.text || "",
        amount: initialData.amount || "",
        category: (initialData.category || "other").toLowerCase(),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "category" ? value.toLowerCase() : value, // ✅ force lowercase internally
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text || !form.amount) {
      return handleError("Please fill all fields");
    }

    await addExpenses({
      ...form,
      category: form.category.toLowerCase(), // ✅ stored lowercase
      text: form.text.trim(),
    });

    // ✅ Only reset if adding a new record
    if (!initialData) {
      setForm({
        text: "",
        amount: "",
        category: "other",
      });
    }
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
            <option key={c.label} value={c.label.toLowerCase()}>
              {c.icon} {capitalize(c.label)}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-primary">
        {initialData ? "Update" : isIncome ? "Add Income" : "Add Expense"}
      </button>
    </form>
  );
}
