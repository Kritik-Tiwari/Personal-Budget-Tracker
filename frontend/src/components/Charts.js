import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

// Colors for charts
const COLORS = [
  "#7c3aed", // purple
  "#82ca9d", // green
  "#ffc658", // yellow
  "#ff7f7f", // red
  "#a4de6c", // lime
  "#d0ed57", // light green
  "#60a5fa", // blue
  "#f87171", // light red
];

// ✅ Capitalize helper
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

// =========================
// Pie Chart: Category Breakdown
// =========================
export function CategoryBreakdownChart({ expenses, filter = "all", height = 250 }) {
  const buildData = (items) => {
    const map = new Map();
    items.forEach((e) => {
      const key = e.category || "Other";
      map.set(key, (map.get(key) || 0) + Math.abs(Number(e.amount) || 0));
    });

    let arr = Array.from(map.entries()).map(([name, value]) => ({
      name: capitalize(name),
      value,
    }));

    const total = arr.reduce((a, b) => a + b.value, 0);

    // ✅ Group small categories (<5%) into "Others"
    const major = arr.filter((d) => total && d.value / total >= 0.05);
    const minor = arr.filter((d) => total && d.value / total < 0.05);

    if (minor.length) {
      major.push({
        name: "Others",
        value: minor.reduce((a, b) => a + b.value, 0),
      });
    }
    return major;
  };

  const incomeData = useMemo(
    () => buildData(expenses.filter((e) => e.type === "income")),
    [expenses]
  );
  const expenseData = useMemo(
    () => buildData(expenses.filter((e) => e.type === "expense")),
    [expenses]
  );
  const allData = useMemo(() => buildData(expenses), [expenses]);

  if (!expenses.length)
    return <p className="text-center text-gray-400">No data</p>;

  const data =
    filter === "income" ? incomeData : filter === "expense" ? expenseData : allData;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, idx) => (
            <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// =========================
// Line Chart: Cash Flow Over Time
// =========================
export function CashFlowChart({
  expenses,
  viewMode = "transaction",
  filter = "all",
  height = 250,
}) {
  const data = useMemo(() => {
    const map = new Map();
    expenses.forEach((e) => {
      const date =
        viewMode === "daily"
          ? new Date(e.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })
          : new Date(e.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

      const type = e.type || "expense";
      const val = Number(e.amount) || 0;
      if (!map.has(date)) map.set(date, { date, income: 0, expense: 0 });
      if (type === "income") map.get(date).income += Math.abs(val);
      else map.get(date).expense += Math.abs(val);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [expenses, viewMode]);

  if (!data.length) return <p className="text-center text-gray-400">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        {filter === "all" && (
          <>
            <Line type="monotone" dataKey="income" stroke="green" />
            <Line type="monotone" dataKey="expense" stroke="red" />
          </>
        )}
        {filter === "income" && (
          <Line type="monotone" dataKey="income" stroke="green" />
        )}
        {filter === "expense" && (
          <Line type="monotone" dataKey="expense" stroke="red" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

// =========================
// Bar Chart: Budget vs Spent
// =========================
export function BudgetVsSpentChart({ budgets, height = 250 }) {
  const data = useMemo(
    () =>
      budgets.map((b) => ({
        category: capitalize(b.category),
        spent: b.spent,
        limit: b.limit,
        over: b.spent > b.limit,
      })),
    [budgets]
  );

  if (!budgets.length)
    return <p className="text-center text-gray-400">No budgets</p>;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="limit" fill="#7c3aed" name="Budget Limit" />
        <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Alias so BudgetsPage.js still works with BudgetChart
export { BudgetVsSpentChart as BudgetChart };
