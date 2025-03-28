import React from "react";

const SmartCategorizeTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-center text-gray-400 p-4">No smart transactions available yet.</div>;
  }

  const unmatchedTxns = transactions.filter((txn) => txn.matched === "🔴");
  const partialTxns = transactions.filter((txn) => txn.matched === "🟡");
  const fullMatchedTxns = transactions.filter((txn) => txn.matched === "🟢");

  const renderTable = (data, label) => (
    <div className="overflow-auto max-h-[550px] rounded-lg border border-gray-700 shadow-md">
      <h2 className="text-white font-semibold text-md mb-2">{label}</h2>
      {data.length > 0 ? (
        <table className="min-w-full text-sm text-white bg-gray-800">
          <thead className="bg-gray-900 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left">Index</th>
              <th className="p-2 text-left">Matched</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Debit</th>
              <th className="p-2 text-left">Credit</th>
              <th className="p-2 text-left">Balance</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Subcategory</th>
            </tr>
          </thead>
          <tbody>
            {data.map((txn, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{txn.matched}</td>
                <td className="p-2 text-left">{txn.date1 || "-"}</td>
                <td className="p-2 text-left">{txn.description || "-"}</td>
                <td className="p-2 text-left">{txn.debit_amount || "-"}</td>
                <td className="p-2 text-left">{txn.credit_amount || "-"}</td>
                <td className="p-2 text-left">{txn.balance_amount || "-"}</td>
                <td className="p-2 text-left">{txn.category || "-"}</td>
                <td className="p-2 text-left">{txn.subcategory || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-400 p-4">No transactions found.</div>
      )}
    </div>
  );

  const renderTablePartial = (data, label) => (
    <div className="overflow-auto max-h-[550px] rounded-lg border border-gray-700 shadow-md">
      <h2 className="text-white font-semibold text-md mb-2">{label}</h2>
      {data.length > 0 ? (
        <table className="min-w-full text-sm text-white bg-gray-800">
          <thead className="bg-gray-900 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left">Index</th>
              <th className="p-2 text-left">Matched</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Used to Match</th>
              <th className="p-2 text-left">Debit</th>
              <th className="p-2 text-left">Credit</th>
              <th className="p-2 text-left">Balance</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Subcategory</th>
              <th className="p-2 text-left">Match %</th>
              <th className="p-2 text-left">Matched Category</th>
              <th className="p-2 text-left">Matched Subcategory</th>
            </tr>
          </thead>
          <tbody>
            {data.map((txn, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{txn.matched}</td>
                <td className="p-2">{txn.date1 || "-"}</td>
                <td className="p-2">{txn.description || "-"}</td>
                <td className="p-2">{txn.matched_keywords?.join(", ") || "-"}</td>
                <td className="p-2">{txn.debit_amount || "-"}</td>
                <td className="p-2">{txn.credit_amount || "-"}</td>
                <td className="p-2">{txn.balance_amount || "-"}</td>
                <td className="p-2">{txn.category || "-"}</td>
                <td className="p-2">{txn.subcategory || "-"}</td>
                <td className="p-2">
                  {txn.match_percent != null ? `${txn.match_percent}%` : "-"}
                </td>
                <td className="p-2">{txn.matched_category || "-"}</td>
                <td className="p-2">{txn.matched_subcategory || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-400 p-4">No transactions found.</div>
      )}
    </div>
  );
  
  
  return (
    <div className="space-y-10">
      {renderTable(transactions, "All Smart Transactions")}
      {renderTable(fullMatchedTxns, "🟢 Fully Matched Transactions")}
      {renderTablePartial(partialTxns, "🟡 Partially Matched Transactions")}
      {renderTable(unmatchedTxns, "🔴 Unmatched Transactions")}
    </div>
  );
};

export default SmartCategorizeTable;
