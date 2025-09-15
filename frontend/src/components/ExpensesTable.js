import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExpenseTrackerForm from "./ExpenseTrackerForm";
import { incomeCategories, expenseCategories } from "../constants/categories";

function ExpensesTable({ expenses = [], handleDeleteExpense, handleEditExpense, isIncomePage = false }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const itemsPerPage = 6;

  // Always include both sets for icon rendering
  const allCategories = [...incomeCategories, ...expenseCategories];

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  // === Filtering ===
  let filtered = (expenses || []).filter((e) => {
    const matchesCategory =
      categoryFilter === "all" || (e.category || "Other") === categoryFilter;

    const matchesSearch = (e.text || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // === Sorting ===
  filtered = [...filtered].sort((a, b) => {
    if (sortField === "amount")
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
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
  const exportXLSX = () => {
    if (!filtered.length) return;
    const ws = XLSX.utils.aoa_to_sheet([
      ["Date", "Description", "Category", "Amount"],
      ...filtered.map((e) => [
        formatDate(e.createdAt),
        e.text,
        e.category || "Other",
        e.amount,
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
      head: [["Date", "Description", "Category", "Amount"]],
      body: filtered.map((e) => [
        formatDate(e.createdAt),
        e.text,
        e.category || "Other",
        e.amount,
      ]),
      startY: 24,
    });
    doc.save("transactions.pdf");
  };

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="tx-header">
        <div>
          <div className="tx-title">Transactions</div>
          <div className="small muted">All your recent activity</div>
        </div>
        <div className="header-controls">
          <input
            className="input"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          {/* Category dropdown with optgroup */}
          <select
            className="select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Categories</option>
            <optgroup label="💰 Income Categories">
              {incomeCategories.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.icon} {c.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="💸 Expense Categories">
              {expenseCategories.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.icon} {c.label}
                </option>
              ))}
            </optgroup>
          </select>
          <div className="export-group">
            <button className="btn btn-ghost" onClick={exportXLSX}>
              XLSX
            </button>
            <button className="btn btn-ghost" onClick={exportPDF}>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* === Table === */}
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
              const cat = allCategories.find(
                (c) => c.label.toLowerCase() === (e.category || "").toLowerCase()
              );
              return (
                <tr key={e._id || e.text}>
                  <td>{formatDate(e.createdAt)}</td>
                  <td>{e.text}</td>
                  <td className="small muted">
                    {cat ? `${cat.icon} ${cat.label}` : e.category || "Other"}
                  </td>
                  <td
                    style={{ textAlign: "right" }}
                    className={isIncome ? "amount-pos" : "amount-neg"}
                  >
                    {isIncome
                      ? `+₹${Number(e.amount).toLocaleString()}`
                      : `-₹${Math.abs(Number(e.amount)).toLocaleString()}`}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="edit-btn" onClick={() => setEditing(e)}>
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
            {!paginated.length && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "12px" }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* === Edit Modal === */}
      {editing && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Edit Transaction</h3>
            <ExpenseTrackerForm
              initialData={editing}
              isIncome={editing.type === "income"}
              addExpenses={async (d) => {
                await handleEditExpense(editing._id, d);
                setEditing(null);
              }}
            />
            <div className="button-row">
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .amount-pos { color: green; font-weight: bold; }
          .amount-neg { color: red; font-weight: bold; }
          .modal-backdrop {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .modal {
            background: white;
            padding: 20px;
            border-radius: 8px;
            min-width: 400px;
            max-width: 500px;
          }
          .button-row {
            display: flex;
            gap: 12px;
            margin-top: 12px;
            justify-content: flex-end;
          }
        `}
      </style>
    </div>
  );
}

export default ExpensesTable;
