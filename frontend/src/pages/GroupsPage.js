// src/pages/GroupsPage.js
import React, { useState } from "react";
import "../styles/forms.css";

export default function GroupsPage() {
  const [groups, setGroups] = useState([{ name: "Friends", members: [] }]);
  const [newGroup, setNewGroup] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [settleFrom, setSettleFrom] = useState("");
  const [settleTo, setSettleTo] = useState("");
  const [settleAmount, setSettleAmount] = useState("");

  // ✅ Add new group
  const addGroup = () => {
    if (!newGroup.trim()) return;
    setGroups([...groups, { name: newGroup, members: [] }]);
    setNewGroup("");
  };

  // ✅ Add member
  const addMember = (index) => {
    if (!memberInput.trim()) return;
    const updated = [...groups];
    updated[index].members.push({ name: memberInput.trim(), balance: 0 });
    setGroups(updated);
    setMemberInput("");
  };

  // ✅ Add expense (split equally)
  const addExpense = (index) => {
    const amount = Number(expenseAmount);
    if (!paidBy || !amount) return;

    const updated = [...groups];
    const group = updated[index];
    const share = amount / group.members.length;

    group.members = group.members.map((m) => {
      if (m.name === paidBy) {
        return { ...m, balance: m.balance + (amount - share) };
      } else {
        return { ...m, balance: m.balance - share };
      }
    });

    setGroups(updated);
    setExpenseAmount("");
    setPaidBy("");
  };

  // ✅ Record settlement
  const settle = (index) => {
    const amount = Number(settleAmount);
    if (!settleFrom || !settleTo || !amount) return;

    const updated = [...groups];
    const group = updated[index];

    const from = group.members.find((m) => m.name === settleFrom);
    const to = group.members.find((m) => m.name === settleTo);

    if (from && to) {
      from.balance += amount;
      to.balance -= amount;
    }

    setGroups(updated);
    setSettleFrom("");
    setSettleTo("");
    setSettleAmount("");
  };

  return (
    <div>
      <h1 className="page-title">Groups</h1>

      {/* Create group */}
      <div className="card">
        <h3>Create New Group</h3>
        <p className="small muted">Add a group to manage shared expenses</p>
        <div className="form-group">
          <input
            className="input"
            placeholder="Enter group name"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
          />
        </div>
        <button className="btn btn-primary full-width" onClick={addGroup}>
          Create
        </button>
      </div>

      <div className="grid-2 mt-6">
        {groups.map((g, i) => (
          <div key={i} className="card">
            <h3>{g.name}</h3>

            {/* Members */}
            <h4 className="mt-2">Members</h4>
            {g.members.length === 0 && (
              <p className="small muted">No members yet</p>
            )}
            <ul>
              {g.members.map((m, j) => (
                <li key={j}>
                  {m.name} —{" "}
                  {m.balance >= 0
                    ? `is owed ₹${m.balance}`
                    : `owes ₹${-m.balance}`}
                </li>
              ))}
            </ul>

            {/* Add member */}
            <div className="form-row mt-2">
              <input
                className="input"
                placeholder="Member name"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={() => addMember(i)}
              >
                Add
              </button>
            </div>

            {/* Add expense */}
            {g.members.length > 0 && (
              <>
                <h4 className="mt-4">Add Expense</h4>
                <div className="form-row">
                  <input
                    className="input"
                    type="number"
                    placeholder="Amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                  <select
                    className="input"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                  >
                    <option value="">Paid By</option>
                    {g.members.map((m, j) => (
                      <option key={j} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={() => addExpense(i)}
                  >
                    Split
                  </button>
                </div>
              </>
            )}

            {/* Settlement */}
            {g.members.length > 1 && (
              <>
                <h4 className="mt-4">Record Settlement</h4>
                <div className="form-row">
                  <select
                    className="input"
                    value={settleFrom}
                    onChange={(e) => setSettleFrom(e.target.value)}
                  >
                    <option value="">From</option>
                    {g.members.map((m, j) => (
                      <option key={j} value={m.name}>
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
                    {g.members.map((m, j) => (
                      <option key={j} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input"
                    type="number"
                    placeholder="Amount"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => settle(i)}
                  >
                    Settle
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
