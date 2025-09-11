// src/components/Charts.js
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#7c3aed", "#a78bfa", "#4ade80", "#f87171", "#fbbf24", "#60a5fa"];

export function CategoryBreakdownChart({ expenses }) {
  const data = useMemo(() => {
    const map = new Map();
    expenses.forEach((e) => {
      const key = e.category || "Other";
      map.set(key, (map.get(key) || 0) + Math.abs(Number(e.amount) || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  if (!data.length) return <p className="text-center text-gray-400">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
          {data.map((entry, idx) => (
            <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CashFlowChart({ expenses }) {
  const data = useMemo(() => {
    const map = new Map();
    expenses.forEach((e) => {
      const date = new Date(e.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      map.set(date, (map.get(date) || 0) + Number(e.amount || 0));
    });
    return Array.from(map.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, value]) => ({ date, value }));
  }, [expenses]);

  if (!data.length) return <p className="text-center text-gray-400">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#7c3aed" />
      </BarChart>
    </ResponsiveContainer>
  );
}
