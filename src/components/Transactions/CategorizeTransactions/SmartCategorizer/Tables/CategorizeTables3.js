import React, { useState } from "react";
import CategoryColor from "components/Common/CategoryColor";

const CategorizeTables3 = ({ transactions, selectedTransactions, setSelectedTransactions }) => {
  const rowsPerPage = 12;
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentTransactions = transactions.slice(startIndex, startIndex + rowsPerPage);

  const handleCheckboxChange = (index) => {
    const globalIndex = startIndex + index;
    if (selectedTransactions.includes(globalIndex)) {
      setSelectedTransactions(selectedTransactions.filter((i) => i !== globalIndex));
    } else {
      setSelectedTransactions([...selectedTransactions, globalIndex]);
    }
  };

  return (
    <div className="text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentTransactions.map((transaction, idx) => {
          const globalIndex = startIndex + idx;
          const isSelected = selectedTransactions.includes(globalIndex);

          return (
            <div
              key={globalIndex}
              className={`relative border-l-4 ${CategoryColor(transaction.category)} bg-gray-800 p-4 rounded-lg shadow-md transition-transform transform hover:scale-[1.01]`}
            >
              <div className="absolute top-2 right-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCheckboxChange(idx)}
                />
              </div>
              <p className="text-sm text-gray-400">{transaction.date1 || "-"}</p>
              <h3 className="text-lg font-bold text-white mt-1">{transaction.description || "-"}</h3>
              <div className="mt-2 text-sm">
                <p>Debit: <span className="text-red-400">{transaction.debit_amount || "-"}</span></p>
                <p>Credit: <span className="text-green-400">{transaction.credit_amount || "-"}</span></p>
                <p>Balance: {transaction.balance_amount || "-"}</p>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                <span className="font-semibold">Category:</span> {transaction.category || "-"} <br />
                <span className="font-semibold">Subcategory:</span> {transaction.subcategory || "-"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 mt-4">
        <button
          className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-white">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CategorizeTables3;
