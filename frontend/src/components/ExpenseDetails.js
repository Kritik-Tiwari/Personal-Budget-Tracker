// src/ExpenseDetails.js
import React from "react";

function ExpenseDetails({ incomeAmt = 0, expenseAmt = 0 }) {
  const balance = incomeAmt - expenseAmt;
  const balanceClass = balance >= 0 ? "info-green" : "info-red";

  return (
    <div className="info-row">
      <div className={`info-box info-indigo card`}>
        <div className="info-left">
          <div className="info-title">Total Balance</div>
          <div className="info-value">₹{balance.toLocaleString()}</div>
        </div>
        <div className="icon-wrap">🐷</div>
      </div>

      <div className={`info-box info-green card`}>
        <div className="info-left">
          <div className="info-title">Total Income</div>
          <div className="info-value">₹{incomeAmt.toLocaleString()}</div>
        </div>
        <div className="icon-wrap">💼</div>
      </div>

      <div className={`info-box info-red card`}>
        <div className="info-left">
          <div className="info-title">Total Expense</div>
          <div className="info-value">₹{expenseAmt.toLocaleString()}</div>
        </div>
        <div className="icon-wrap">📉</div>
      </div>
    </div>
  );
}

export default ExpenseDetails;
