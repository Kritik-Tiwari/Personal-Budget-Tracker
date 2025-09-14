// src/pages/GroupsPage.js
import React, { useState, useEffect } from "react";
import "../styles/forms.css";
import { fetchWithAuth, APIUrl, handleError, handleSuccess } from "../utils";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [balances, setBalances] = useState({}); // ✅ store balances per group
  const [newGroup, setNewGroup] = useState("");
  const [memberInputs, setMemberInputs] = useState({});
  const [expenseInputs, setExpenseInputs] = useState({});
  const [settleInputs, setSettleInputs] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // ✅ Fetch groups
  const fetchGroups = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/groups`);
      const j = await res.json();
      if (j.success) {
        setGroups(j.groups || []);
        // fetch balances for each group
        j.groups.forEach((g) => fetchBalances(g._id));
      }
    } catch {
      handleError("Failed to fetch groups");
    }
  };

  const fetchBalances = async (groupId) => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/groups/${groupId}/balances`);
      const j = await res.json();
      if (j.success) {
        setBalances((prev) => ({ ...prev, [groupId]: j.balances }));
      }
    } catch {
      handleError("Failed to fetch balances");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // ✅ Create group
  const createGroup = async () => {
    if (!newGroup.trim()) return;
    try {
      const res = await fetchWithAuth(`${APIUrl}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroup }),
      });
      const j = await res.json();
      if (j.success) {
        handleSuccess("Group created ✅");
        setGroups(j.groups);
        setNewGroup("");
        j.groups.forEach((g) => fetchBalances(g._id));
      }
    } catch {
      handleError("Failed to create group");
    }
  };

  // ✅ Edit group
  const saveEdit = async (id) => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const j = await res.json();
      if (j.success) {
        handleSuccess("Group updated ✏️");
        setEditingId(null);
        setEditName("");
        fetchGroups();
      }
    } catch {
      handleError("Failed to update group");
    }
  };

  // ✅ Delete group
  const deleteGroup = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      const res = await fetchWithAuth(`${APIUrl}/groups/${id}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (j.success) {
        handleSuccess("Group deleted 🗑️");
        setGroups(j.groups);
      }
    } catch {
      handleError("Failed to delete group");
    }
  };

  // ✅ Add member
  const addMember = async (groupId) => {
    const name = (memberInputs[groupId] || "").trim();
    if (!name) return;

    try {
      const res = await fetchWithAuth(`${APIUrl}/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const j = await res.json();
      if (j.success) {
        handleSuccess("Member added 👤");
        setMemberInputs({ ...memberInputs, [groupId]: "" });
        fetchGroups();
      }
    } catch {
      handleError("Failed to add member");
    }
  };

  // ✅ Delete member
  const deleteMember = async (groupId, memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const res = await fetchWithAuth(
        `${APIUrl}/groups/${groupId}/members/${memberId}`,
        { method: "DELETE" }
      );
      const j = await res.json();
      if (j.success) {
        handleSuccess("Member removed ❌");
        fetchGroups();
      }
    } catch {
      handleError("Failed to remove member");
    }
  };

  // ✅ Add expense
  const addExpense = async (groupId) => {
    const { amount, paidBy } = expenseInputs[groupId] || {};
    if (!paidBy || !amount) return;
    try {
      const group = groups.find((g) => g._id === groupId);
      const share = amount / group.members.length;

      await fetchWithAuth(`${APIUrl}/groups/${groupId}/expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Shared Expense",
          amount,
          paidBy,
          split: group.members.map((m) => ({
            member: m._id,
            share,
          })),
        }),
      });

      handleSuccess("Expense added 💸");
      setExpenseInputs({ ...expenseInputs, [groupId]: { amount: "", paidBy: "" } });
      fetchGroups();
    } catch {
      handleError("Failed to add expense");
    }
  };

  // ✅ Record settlement
  const settle = async (groupId) => {
    const { from, to, amount } = settleInputs[groupId] || {};
    if (!from || !to || !amount) return;
    try {
      await fetchWithAuth(`${APIUrl}/groups/${groupId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, amount }),
      });
      handleSuccess("Settlement recorded ✅");
      setSettleInputs({ ...settleInputs, [groupId]: { from: "", to: "", amount: "" } });
      fetchGroups();
    } catch {
      handleError("Failed to record settlement");
    }
  };

  return (
    <div>
      <h1 className="page-title">Groups</h1>

      {/* Create group */}
      <div className="card">
        <h3>Create New Group</h3>
        <p className="small muted">Add a group to manage shared expenses</p>
        <input
          className="input"
          placeholder="Enter group name"
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
        />
        <button
          className="btn btn-primary full-width mt-2"
          onClick={createGroup}
        >
          Create
        </button>
      </div>

      {/* Group list */}
      <div className="grid-2 mt-6">
        {groups.map((g) => (
          <div key={g._id} className="card group-card">
            <div className="group-header">
              {editingId === g._id ? (
                <div className="form-row">
                  <input
                    className="input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => saveEdit(g._id)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3>{g.name}</h3>
                  <div>
                    <button
                      className="btn btn-edit-group btn-group-action"
                      onClick={() => {
                        setEditingId(g._id);
                        setEditName(g.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-delete-group btn-group-action"
                      onClick={() => deleteGroup(g._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Members */}
            <h4 className="mt-2">Members</h4>
            {(!g.members || g.members.length === 0) && (
              <p className="small muted">No members yet</p>
            )}
            <ul>
              {g.members &&
                g.members.map((m) => (
                  <li key={m._id} className="member-tag">
                    {m.name}
                    <div className="member-actions">
                      <button
                        className="btn btn-delete-member btn-member"
                        onClick={() => deleteMember(g._id, m._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
            </ul>

            {/* Add member */}
            <div className="form-row mt-2">
              <input
                className="input"
                placeholder="Member name"
                value={memberInputs[g._id] || ""}
                onChange={(e) =>
                  setMemberInputs({ ...memberInputs, [g._id]: e.target.value })
                }
              />
              <button
                className="btn btn-primary"
                onClick={() => addMember(g._id)}
              >
                Add
              </button>
            </div>

            {/* Add expense */}
            {g.members && g.members.length > 0 && (
              <>
                <h4 className="mt-4">Add Expense</h4>
                <div className="form-row">
                  <input
                    className="input"
                    type="number"
                    placeholder="Amount"
                    value={(expenseInputs[g._id]?.amount) || ""}
                    onChange={(e) =>
                      setExpenseInputs({
                        ...expenseInputs,
                        [g._id]: {
                          ...(expenseInputs[g._id] || {}),
                          amount: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <select
                    className="input"
                    value={(expenseInputs[g._id]?.paidBy) || ""}
                    onChange={(e) =>
                      setExpenseInputs({
                        ...expenseInputs,
                        [g._id]: {
                          ...(expenseInputs[g._id] || {}),
                          paidBy: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="">Paid By</option>
                    {g.members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={() => addExpense(g._id)}
                  >
                    Split
                  </button>
                </div>
              </>
            )}

            {/* Settlement */}
            {g.members && g.members.length > 1 && (
              <>
                <h4 className="mt-4">Record Settlement</h4>
                <div className="form-row">
                  <select
                    className="input"
                    value={(settleInputs[g._id]?.from) || ""}
                    onChange={(e) =>
                      setSettleInputs({
                        ...settleInputs,
                        [g._id]: {
                          ...(settleInputs[g._id] || {}),
                          from: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="">From</option>
                    {g.members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="input"
                    value={(settleInputs[g._id]?.to) || ""}
                    onChange={(e) =>
                      setSettleInputs({
                        ...settleInputs,
                        [g._id]: {
                          ...(settleInputs[g._id] || {}),
                          to: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="">To</option>
                    {g.members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input"
                    type="number"
                    placeholder="Amount"
                    value={(settleInputs[g._id]?.amount) || ""}
                    onChange={(e) =>
                      setSettleInputs({
                        ...settleInputs,
                        [g._id]: {
                          ...(settleInputs[g._id] || {}),
                          amount: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => settle(g._id)}
                  >
                    Settle
                  </button>
                </div>
              </>
            )}

            {/* Expense & Settlement History */}
            {g.expenses && g.expenses.length > 0 && (
              <div className="mt-4">
                <h4>History</h4>
                <ul className="small">
                  {g.expenses.map((exp) => (
                    <li key={exp._id}>
                      {exp.text === "Settlement" ? (
                        <span>
                          💱 {g.members.find((m) => m._id === exp.paidBy)?.name} paid{" "}
                          {g.members.find((m) => m._id === exp.split[0].member)?.name}{" "}
                          ₹{exp.amount}
                        </span>
                      ) : (
                        <span>
                          💸 {exp.text} — ₹{exp.amount} by{" "}
                          {g.members.find((m) => m._id === exp.paidBy)?.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Balances */}
            {balances[g._id] && (
              <div className="mt-4">
                <h4>Balances</h4>
                <ul className="small">
                  {Object.values(balances[g._id]).map((b) => (
                    <li
                      key={b.user._id}
                      style={{
                        color: b.balance >= 0 ? "green" : "red",
                        fontWeight: "500",
                      }}
                    >
                      {b.user.name}: {b.balance >= 0 ? "+" : "-"}₹
                      {Math.abs(b.balance)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
