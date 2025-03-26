// components/Categorize/SmartCategorizeTable.js
import React from "react";

const SmartCategorizeTable = ({ transactions }) => {
  return (
    <div className="overflow-auto max-h-[550px] rounded-lg border border-gray-700 shadow-md">
      <table className="min-w-full text-sm text-white bg-gray-800">
        <thead className="bg-gray-900 sticky top-0 z-10">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-3">Debit</th>
            <th className="p-3">Credit</th>
            <th className="p-3">Balance</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Subcategory</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, index) => (
            <tr key={index} className="border-t border-gray-700">
              <td className="p-2">{txn.date1 || "-"}</td>
              <td className="p-2">{txn.description || "-"}</td>
              <td className="p-3">{txn.debit_amount || "-"}</td>
              <td className="p-3">{txn.credit_amount || "-"}</td>
              <td className="p-3">{txn.balance_amount || "-"}</td>
              <td className="p-2">{txn.category || "-"}</td>
              <td className="p-2">{txn.subcategory || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SmartCategorizeTable;
