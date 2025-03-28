import React, { useState } from "react";

const CategorizeOverview2 = ({ transactions = [] }) => {
  const [showSummary, setShowSummary] = useState(true);

  if (!Array.isArray(transactions)) transactions = [];

  const categorized = {
    Income: [],
    Savings: [],
    Housing: [],
    Transportation: [],
    Expenses: [],
    Debt: [],
    Uncategorized: [],
  };

  transactions.forEach((txn) => {
    const category = txn.category || "Uncategorized";
    if (categorized[category]) {
      categorized[category].push(txn);
    } else {
      categorized["Uncategorized"].push(txn);
    }
  });

  const calculateTotal = (category) =>
    categorized[category]
      .reduce((acc, txn) => acc + Math.abs(parseFloat(txn.debit_amount) || parseFloat(txn.credit_debit_amount) || 0), 0)
      .toFixed(2);

  return (
    <section className="space-y-2">
      <h2
        onClick={() => setShowSummary(!showSummary)}
        className="text-lg font-semibold border-b border-gray-600 pb-1 cursor-pointer flex justify-between items-center"
      >
        Financial Summary <span className="text-gray-500">{showSummary ? "▲" : "▼"}</span>
      </h2>

      {showSummary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-center">
          {[
            { label: "Income", color: "bg-green-500", total: calculateTotal("Income") },
            { label: "Savings", color: "bg-blue-500", total: calculateTotal("Savings") },
            { label: "Housing", color: "bg-purple-500", total: calculateTotal("Housing") },
            { label: "Transport", color: "bg-yellow-500", total: calculateTotal("Transportation") },
            { label: "Expenses", color: "bg-red-500", total: calculateTotal("Expenses") },
            { label: "Debt", color: "bg-gray-700", total: calculateTotal("Debt") },
            { label: "Transactions", color: "bg-gray-600", total: transactions.length },
            { label: "Uncategorized", color: "bg-gray-500", total: categorized["Uncategorized"].length },
          ].map(({ label, color, total }, index) => (
            <div key={index} className={`${color} p-2 rounded-md text-xs shadow-sm`}>
              <p className="font-medium">{label}</p>
              <p className="font-bold text-sm">R {total}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorizeOverview2;
