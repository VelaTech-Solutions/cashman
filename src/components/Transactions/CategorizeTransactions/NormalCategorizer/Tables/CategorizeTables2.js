import React, { useState } from "react";
import { CategoryColor } from "components/Common";

const CategorizeTables2 = ({
  transactions,
  selectedTransactions,
  setSelectedTransactions,
}) => {
  const [currentTab, setCurrentTab] = useState("table2");
  const rowsPerPage = 12;
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentTransactions = transactions.slice(startIndex, startIndex + rowsPerPage);

  const isAllSelected =
    currentTransactions.length > 0 &&
    currentTransactions.every((_, idx) => selectedTransactions.includes(startIndex + idx));

  const handleSelectAll = () => {
    const currentIndexes = currentTransactions.map((_, idx) => startIndex + idx);
    if (isAllSelected) {
      setSelectedTransactions(selectedTransactions.filter((i) => !currentIndexes.includes(i)));
    } else {
      const newSelections = [
        ...selectedTransactions,
        ...currentIndexes.filter((i) => !selectedTransactions.includes(i)),
      ];
      setSelectedTransactions(newSelections);
    }
  };

  const handleCheckboxChange = (localIndex) => {
    const globalIndex = startIndex + localIndex;
    if (selectedTransactions.includes(globalIndex)) {
      setSelectedTransactions(selectedTransactions.filter((i) => i !== globalIndex));
    } else {
      setSelectedTransactions([...selectedTransactions, globalIndex]);
    }
  };

  return (
    <div className="text-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium transition ${
            currentTab === "table2"
              ? "border-b-2 border-cyan-500 text-cyan-400"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setCurrentTab("table2")}
        >
          Table 2
        </button>
      </div>

      {/* Table */}
      {currentTab === "table2" && (
        <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-md">
          <table className="min-w-full bg-gray-800">
            <thead className="bg-gray-900 sticky top-0 z-10 text-sm text-left text-gray-300">
              <tr>
                <th className="p-3">
                  <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                </th>
                <th className="p-3">Date</th>
                <th className="p-3">Description</th>
                <th className="p-3">Debit</th>
                <th className="p-3">Credit</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Category</th>
                <th className="p-3">Subcategory</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-200">
              {currentTransactions.map((transaction, idx) => (
                <tr
                  key={startIndex + idx}
                  className={`border-t border-gray-700 hover:bg-gray-700/30 ${CategoryColor.getCategoryColor(
                    transaction.category
                  )}`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(startIndex + idx)}
                      onChange={() => handleCheckboxChange(idx)}
                    />
                  </td>
                  <td className="p-3">{transaction.date1 || "-"}</td>
                  <td className="p-3">{transaction.description || "-"}</td>
                  <td className="p-3">{transaction.debit_amount || "-"}</td>
                  <td className="p-3">{transaction.credit_amount || "-"}</td>
                  <td className="p-3">{transaction.balance_amount || "-"}</td>
                  <td className="p-3">{transaction.category || "-"}</td>
                  <td className="p-3">{transaction.subcategory || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 px-2">
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-sm text-gray-400">
          Page <span className="text-white">{currentPage}</span> of{" "}
          <span className="text-white">{totalPages}</span>
        </span>
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CategorizeTables2;
