import React from "react";

const Summaries = ({ transactions, uniqueTransactions }) => {
  const total = transactions.length;
  const unique = uniqueTransactions.length;
  const grouped = total - unique;
  const broken = 0; // You can update this once broken logic is added

  return (
    <div className="bg-gray-700 text-white p-3 rounded w-full mt-4">
      <h3 className="text-md font-semibold mb-2">📊 Summary</h3>
      <ul className="text-sm space-y-1">
        <li>Total Transactions: {total}</li>
        <li>Unique Transactions: {unique}</li>
        <li>Grouped Transactions: {grouped}</li>
        <li>Broken/Invalid Transactions: {broken}</li>
      </ul>
    </div>
  );
};

export default Summaries;
