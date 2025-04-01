// src/components/Transactions/EditTransactions/Tables/EditTableZeroAmounts.js
import React from "react";

// Utils imports
import BaseTable from "../Utils/BaseTable";

const EditTableZeroAmounts  = ({ transactions, onEditClick }) => {
    if (!transactions || transactions.length === 0) {
      return <p className="text-gray-400">No transactions found.</p>;
    }
    const countZeroAmounts = transactions.filter(tx => parseFloat(tx.debit_amount || 0) === 0 && parseFloat(tx.credit_amount || 0) === 0).length;
    const filtered = transactions.filter(
        (tx) => parseFloat(tx.debit_amount || 0) === 0 && parseFloat(tx.credit_amount || 0) === 0
      );
    const headers = (
        <tr>
            <th className="px-4 py-2 text-left w-[60px] border border-gray-700">Date1</th>
            <th className="px-4 py-2 text-left w-[60px] border border-gray-700">Date2</th>
            <th className="px-4 py-2 text-left w-[600px] border border-gray-700">Description</th>
            <th className="px-4 py-2 text-left w-[80px] border border-gray-700">Credit</th>
            <th className="px-4 py-2 text-left w-[80px] border border-gray-700">Debit</th>
            <th className="px-4 py-2 text-left w-[80px] border-gray-700">Balance</th>
            <th className="px-4 py-2 text-left w-[80px] border border-gray-700">Actions</th>
        </tr>
    );

    const rows = filtered.map((tx, index) => (
        <tr key={tx.id || index} className="border-t border-gray-700">
            <td className="px-4 py-2 w-[60px] truncate overflow-hidden whitespace-nowrap border border-gray-700">{tx.date1 || "—"}</td>
            <td className="px-4 py-2 w-[60px] truncate overflow-hidden whitespace-nowrap border border-gray-700">{tx.date2 || "—"}</td>
            <td className="px-4 py-2 w-[600px] truncate overflow-hidden whitespace-nowrap text-ellipsis border border-gray-700">{tx.description || "—"}</td>
            <td className="px-4 py-2 border border-gray-700">R {parseFloat(tx.credit_amount || 0).toFixed(2)}</td>
            <td className="px-4 py-2 border border-gray-700">R {parseFloat(tx.debit_amount || 0).toFixed(2)}</td>
            <td className="px-4 py-2 border border-gray-700">R {parseFloat(tx.balance_amount || 0).toFixed(2)}</td>
            <td className="px-4 py-2 border border-gray-700">
                <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                onClick={() => onEditClick(tx)}
                >
                Edit
                </button>
            </td>
        </tr>
    ));

    return (
        <div>
            <BaseTable headers={headers} rows={rows} />
            <p className="mt-4 text-gray-400">
            Zero amount transactions: {filtered.length}
            </p>
        </div>
        );
    };
export default EditTableZeroAmounts