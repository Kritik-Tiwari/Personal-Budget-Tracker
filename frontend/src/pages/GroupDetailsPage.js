import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWithAuth, APIUrl } from "../utils";

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState([]);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState(0);

  // Settlement state
  const [settleFrom, setSettleFrom] = useState("");
  const [settleTo, setSettleTo] = useState("");
  const [settleAmount, setSettleAmount] = useState("");

  const fetchGroup = async () => {
    const res = await fetchWithAuth(`${APIUrl}/groups`);
    const j = await res.json();
    setGroup(j.groups.find((g) => g._id === groupId));
  };

  const fetchBalances = async () => {
    const res = await fetchWithAuth(`${APIUrl}/groups/${groupId}/balances`);
    const j = await res.json();
    setBalances(Object.values(j.balances));
  };

  useEffect(() => {
    fetchGroup();
    fetchBalances();
  }, []);

  const addExpense = async () => {
    if (!text || !amount) return alert("Enter expense details");
    await fetchWithAuth(`${APIUrl}/groups/${groupId}/expense`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        amount,
        paidBy: group.members[0]._id, // ⚠️ demo: default payer
        split: group.members.map((m) => ({
          member: m._id,
          share: amount / group.members.length,
        })),
      }),
    });
    fetchGroup();
    fetchBalances();
    setText("");
    setAmount(0);
  };

  const settleUp = async () => {
    if (!settleFrom || !settleTo || !settleAmount)
      return alert("Fill all settlement fields");

    await fetchWithAuth(`${APIUrl}/groups/${groupId}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: settleFrom,
        to: settleTo,
        amount: Number(settleAmount),
      }),
    });

    fetchGroup();
    fetchBalances();
    setSettleFrom("");
    setSettleTo("");
    setSettleAmount("");
  };

  return (
    <div>
      {group && (
        <>
          <h1>{group.name}</h1>
          <h3>Members</h3>
          <ul>
            {group.members.map((m) => (
              <li key={m._id}>{m.name}</li>
            ))}
          </ul>

          {/* Add expense */}
          <h3>Add Expense</h3>
          <input
            placeholder="Description"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            placeholder="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button onClick={addExpense}>Add Expense</button>

          {/* Balances */}
          <h3>Balances</h3>
          <ul>
            {balances.map((b) => (
              <li key={b.user._id}>
                {b.user.name}:{" "}
                {b.balance > 0 ? `+₹${b.balance}` : `-₹${-b.balance}`}
              </li>
            ))}
          </ul>

          {/* Settle up */}
          <h3>Settle Up</h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
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

            <select value={settleTo} onChange={(e) => setSettleTo(e.target.value)}>
              <option value="">To</option>
              {group.members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Amount"
              type="number"
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              style={{ width: "100px" }}
            />

            <button onClick={settleUp}>Settle</button>
          </div>
        </>
      )}
    </div>
  );
}
