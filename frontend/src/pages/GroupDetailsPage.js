import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithAuth, APIUrl, handleSuccess, handleError } from "../utils";
import "../styles/forms.css";

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState([]);

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");

  // Settlement state
  const [settleFrom, setSettleFrom] = useState("");
  const [settleTo, setSettleTo] = useState("");
  const [settleAmount, setSettleAmount] = useState("");

  // Editing group
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const fetchGroup = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/groups`);
      const j = await res.json();
      const g = j.groups.find((gr) => gr._id === groupId);
      setGroup(g);
      setEditName(g?.name || "");
    } catch {
      handleError("Failed to fetch group");
    }
  };

  const fetchBalances = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/groups/${groupId}/balances`);
      const j = await res.json();
      if (j.success) setBalances(Object.values(j.balances));
    } catch {
      handleError("Failed to fetch balances");
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchBalances();
  }, [groupId]);

  // ✅ Add expense
  const addExpense = async () => {
    if (!text || !amount) return alert("Enter expense details");
    try {
      await fetchWithAuth(`${APIUrl}/groups/${groupId}/expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          amount: Number(amount),
          paidBy: group.members[0]._id, // ⚠️ you may change this to loggedInUser
          split: group.members.map((m) => ({
            member: m._id,
            share: Number(amount) / group.members.length,
          })),
        }),
      });
      handleSuccess("Expense added 💸");
      setText("");
      setAmount("");
      fetchGroup();
      fetchBalances();
    } catch {
      handleError("Failed to add expense");
    }
  };

  // ✅ Settlement
  const settleUp = async () => {
    if (!settleFrom || !settleTo || !settleAmount)
      return alert("Fill all settlement fields");

    try {
      await fetchWithAuth(`${APIUrl}/groups/${groupId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: settleFrom,
          to: settleTo,
          amount: Number(settleAmount),
        }),
      });
      handleSuccess("Settlement recorded ✅");
      setSettleFrom("");
      setSettleTo("");
      setSettleAmount("");
      fetchGroup();
      fetchBalances();
    } catch {
      handleError("Failed to record settlement");
    }
  };

  // ✅ Edit group name
  const saveGroupName = async () => {
    try {
      const res = await fetchWithAuth(`${APIUrl}/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const j = await res.json();
      if (j.success) {
        handleSuccess("Group updated ✏️");
        setEditing(false);
        fetchGroup();
      }
    } catch {
      handleError("Failed to update group");
    }
  };

  // ✅ Delete group
  const deleteGroup = async () => {
    if (!window.confirm("Delete this group?")) return;
    try {
      const res = await fetchWithAuth(`${APIUrl}/groups/${groupId}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (j.success) {
        handleSuccess("Group deleted 🗑️");
        navigate("/groups"); // redirect back
      }
    } catch {
      handleError("Failed to delete group");
    }
  };

  return (
    <div>
      {group && (
        <>
          <div className="flex items-center justify-between">
            {editing ? (
              <div className="form-row">
                <input
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button className="btn btn-primary small" onClick={saveGroupName}>
                  Save
                </button>
                <button
                  className="btn btn-secondary small"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h1 className="page-title">{group.name}</h1>
            )}

            {!editing && (
              <div>
                <button
                  className="btn btn-secondary small"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger small ml-2"
                  onClick={deleteGroup}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Members */}
          <div className="card mt-4">
            <h3>Members</h3>
            <ul className="small">
              {group.members.map((m) => (
                <li key={m._id}>{m.name}</li>
              ))}
            </ul>
          </div>

          {/* Add expense */}
          <div className="card mt-4">
            <h3>Add Expense</h3>
            <div className="form-row">
              <input
                className="input"
                placeholder="Description"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button className="btn btn-primary" onClick={addExpense}>
                Add
              </button>
            </div>
          </div>

          {/* Balances */}
          <div className="card mt-4">
            <h3>Balances</h3>
            <ul className="small">
              {balances.map((b) => (
                <li key={b.user._id}>
                  {b.user.name}:{" "}
                  {b.balance > 0 ? (
                    <span style={{ color: "green" }}>+₹{b.balance}</span>
                  ) : (
                    <span style={{ color: "red" }}>-₹{-b.balance}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Settlement */}
          <div className="card mt-4">
            <h3>Settle Up</h3>
            <div className="form-row">
              <select
                className="input"
                value={settleFrom}
                onChange={(e) => setSettleFrom(e.target.value)}
              >
                <option value="">From</option>
                {group.members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={settleTo}
                onChange={(e) => setSettleTo(e.target.value)}
              >
                <option value="">To</option>
                {group.members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <input
                className="input"
                placeholder="Amount"
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
              />

              <button className="btn btn-primary" onClick={settleUp}>
                Settle
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
