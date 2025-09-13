// src/components/ExpensesTable.js
import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#7c3aed", "#82ca9d", "#ffc658", "#ff7f7f", "#a4de6c", "#d0ed57"];

function ExpensesTable({ expenses = [], handleDeleteExpense, handleEditExpense, loggedInUser }) {
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const categories = useMemo(() => {
    const s = new Set((expenses || []).map((e) => e.category || "Other"));
    return ["all", ...Array.from(s)];
  }, [expenses]);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  // ✅ Filtering by type instead of +/- amount
  let filtered = (expenses || []).filter((e) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "income" && e.type === "income") ||
      (filter === "expense" && e.type === "expense");
    const matchesCategory =
      categoryFilter === "all" || (e.category || "Other") === categoryFilter;
    const matchesSearch = (e.text || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesFilter && matchesCategory && matchesSearch;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortField === "amount")
      return sortOrder === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    const da = new Date(a.createdAt || a.updatedAt || 0);
    const db = new Date(b.createdAt || b.updatedAt || 0);
    return sortOrder === "asc" ? da - db : db - da;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // === Export helpers ===
  const exportCSV = () => {
    if (!filtered.length) return;
    const csv = [
      ["Date", "Description", "Category", "Amount", "Type"],
      ...filtered.map((e) => [
        formatDate(e.createdAt),
        e.text,
        e.category || "Other",
        e.amount,
        e.type,
      ]),
    ];
    const csvText = csv
      .map((r) =>
        r.map(String).map((v) => `"${v.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    saveAs(new Blob([csvText], { type: "text/csv" }), "transactions.csv");
  };

  const exportXLSX = () => {
    if (!filtered.length) return;
    const ws = XLSX.utils.aoa_to_sheet([
      ["Date", "Description", "Category", "Amount", "Type"],
      ...filtered.map((e) => [
        formatDate(e.createdAt),
        e.text,
        e.category || "Other",
        e.amount,
        e.type,
      ]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "transactions.xlsx"
    );
  };

  const exportPDF = () => {
    if (!filtered.length) return;
    const doc = new jsPDF();
    doc.text("Personal-Budget-Tracker", 14, 16);
    doc.autoTable({
      head: [["Date", "Description", "Category", "Amount", "Type"]],
      body: filtered.map((e) => [
        formatDate(e.createdAt),
        e.text,
        e.category || "Other",
        e.amount,
        e.type,
      ]),
      startY: 24,
    });
    doc.save("transactions.pdf");
  };

  // === Chart data ===
  const pieData = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => {
      const k = e.category || "Other";
      map.set(k, (map.get(k) || 0) + Math.abs(Number(e.amount || 0)));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const areaData = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => {
      const key = new Date(e.createdAt || Date.now()).toLocaleDateString(
        "en-IN"
      );
      const val =
        e.type === "income"
          ? Math.abs(Number(e.amount || 0))
          : -Math.abs(Number(e.amount || 0));
      map.set(key, (map.get(key) || 0) + val);
    });
    return Array.from(map.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, value]) => ({ date, value }));
  }, [filtered]);

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="tx-header">
          <div>
            <div className="tx-title">Transactions</div>
            <div className="small muted">All your recent activity</div>
          </div>
          <div className="header-controls">
            <div className="search-wrap">
              <input
                className="input"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="select"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
            <select
              className="select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="export-group">
              <button className="btn btn-ghost" onClick={exportCSV}>
                CSV
              </button>
              <button className="btn btn-ghost" onClick={exportXLSX}>
                XLSX
              </button>
              <button className="btn btn-ghost" onClick={exportPDF}>
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((e) => {
                const isIncome = e.type === "income";
                return (
                  <tr key={e._id || e.text}>
                    <td>{formatDate(e.createdAt)}</td>
                    <td>{e.text}</td>
                    <td className="small muted">{e.category || "Other"}</td>
                    <td
                      style={{ textAlign: "right" }}
                      className={isIncome ? "amount-pos" : "amount-neg"}
                    >
                      {isIncome
                        ? `+₹${Number(e.amount).toLocaleString()}`
                        : `-₹${Number(e.amount).toLocaleString()}`}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEditExpense && handleEditExpense(e._id, e)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDeleteExpense && handleDeleteExpense(e._id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: 12 }}>
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h4 style={{ marginBottom: 8 }}>Category Breakdown</h4>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  label
                >
                  {pieData.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="small">No data</div>
          )}
        </div>

        <div className="chart-card">
          <h4 style={{ marginBottom: 8 }}>Cash Flow Over Time</h4>
          {areaData.length ? (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7c3aed"
                  fillOpacity={1}
                  fill="url(#colorAmt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="small">No data</div>
          )}
        </div>
      </div>

      <style>
        {`
          .amount-pos { color: green; font-weight: bold; }
          .amount-neg { color: red; font-weight: bold; }
        `}
      </style>
    </div>
  );
}

export default ExpensesTable;
