import React from "react";

const EditTable4 = ({ transactions, onEditClick }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-gray-400">No transactions found.</p>;
  }

  return (
    <div className="overflow-y-auto max-h-[600px] overflow-x-auto">
      <table className="w-full table-auto border border-gray-700 text-white">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2">Date1</th>
            <th className="px-4 py-2">Date2</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Credit</th>
            <th className="px-4 py-2">Debit</th>
            <th className="px-4 py-2">Balance</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={tx.id || index} className="border-t border-gray-700">
              <td className="px-4 py-2">{tx.date1 || "—"}</td>
              <td className="px-4 py-2">{tx.date2 || "—"}</td>
              <td className="px-4 py-2">{tx.description || "—"}</td>
              <td className="px-4 py-2">R {parseFloat(tx.credit_amount || 0).toFixed(2)}</td>
              <td className="px-4 py-2">R {parseFloat(tx.debit_amount || 0).toFixed(2)}</td>
              <td className="px-4 py-2">R {parseFloat(tx.balance_amount || 0).toFixed(2)}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onEditClick(index)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditTable4;
