import React, { useState } from "react";

const CategorizeTransactionsOverview1 = ({ transactions = [] }) => {
  const [showSummary, setShowSummary] = useState(true);

  // **Ensure transactions is always an array**
  if (!Array.isArray(transactions)) transactions = [];

  // **Pre-filter transactions once for better performance**
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

  // **Calculate Totals Using Pre-filtered Data**
  const calculateTotal = (category) =>
    categorized[category]
      .reduce(
        (acc, txn) =>
          acc + Math.abs(parseFloat(txn.debit_amount) || parseFloat(txn.credit_debit_amount) || 0),
        0
      )
      .toFixed(2);

  return (
    <section className="space-y-4">
      <h2
        onClick={() => setShowSummary(!showSummary)}
        className="text-xl font-semibold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
      >
        Financial Summary
        <span className="text-gray-500">{showSummary ? "▲" : "▼"}</span>
      </h2>

      {showSummary && (
        <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {/* Financial Summary Cards */}
            {[
              { label: "Total Income", color: "bg-green-600", total: calculateTotal("Income") },
              { label: "Total Savings", color: "bg-blue-600", total: calculateTotal("Savings") },
              { label: "Total Housing", color: "bg-purple-600", total: calculateTotal("Housing") },
              { label: "Total Transportation", color: "bg-yellow-600", total: calculateTotal("Transportation") },
              { label: "Total Expenses", color: "bg-red-600", total: calculateTotal("Expenses") },
              { label: "Total Debt", color: "bg-gray-700", total: calculateTotal("Debt") },
              { label: "Total Transactions", color: "bg-gray-500", total: transactions.length },
              { label: "Total Uncategorized", color: "bg-gray-500", total: categorized["Uncategorized"].length },
            ].map(({ label, color, total }, index) => (
              <div key={index} className={`${color} p-3 rounded-lg shadow-md`}>
                <p className="text-sm">{label}</p>
                <p className="text-lg font-bold">R {total}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorizeTransactionsOverview1;
