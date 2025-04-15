import React, { useState, useMemo } from "react";

import { CategoryColor } from "components/Common";

const CategorizeTablesGroup4 = ({
  transactions,
  selectedTransactions,
  setSelectedTransactions,
  colorMode,
}) => {
  const [currentTab, setCurrentTab] = useState("default");
  const rowsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // --- 🧠 Normalize and group transactions by cleaned-up description ---
  const groupedTransactions = useMemo(() => {
    const groups = {};
    transactions.forEach((txn) => {
      const key = (txn.description || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      if (!groups[key]) groups[key] = [];
      groups[key].push(txn);
    });
    return Object.values(groups);
  }, [transactions]);

  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return groupedTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [groupedTransactions, currentPage]);

  const totalPages = Math.ceil(groupedTransactions.length / rowsPerPage);

  const handleCheckboxChange = (txnId) => {
    if (selectedTransactions.includes(txnId)) {
      setSelectedTransactions(selectedTransactions.filter((id) => id !== txnId));
    } else {
      setSelectedTransactions([...selectedTransactions, txnId]);
    }
  };

  const handleSelectAll = () => {
    const allGroupTxnIds = paginatedGroups
      .flat()
      .map((txn) => txn.id || txn._id); // Use unique id field
    const allSelected = allGroupTxnIds.every((id) => selectedTransactions.includes(id));
    if (allSelected) {
      setSelectedTransactions(selectedTransactions.filter((id) => !allGroupTxnIds.includes(id)));
    } else {
      const newSelections = [
        ...selectedTransactions,
        ...allGroupTxnIds.filter((id) => !selectedTransactions.includes(id)),
      ];
      setSelectedTransactions(newSelections);
    }
  };

  const isAllSelected = paginatedGroups
    .flat()
    .every((txn) => selectedTransactions.includes(txn.id || txn._id));

  return (
    <div className="text-white">
      {/* --- Tabs --- */}
      <div className="flex space-x-4 mb-4 border-b border-gray-700">
        <button
          className={`p-2 ${currentTab === "default" ? "border-b-2 border-white" : ""}`}
          onClick={() => setCurrentTab("default")}
        >
          Grouped Table
        </button>
      </div>

      {/* --- Grouped Table View --- */}
      {currentTab === "default" && (
        <div className="overflow-y-auto max-h-[600px] shadow-md border border-gray-700 rounded-lg">
          <table className="w-full bg-gray-800">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr>
                <th className="p-2">
                  <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                </th>
                <th className="p-2">Date</th>
                <th className="p-2">Description</th>
                <th className="p-2">Debit</th>
                <th className="p-2">Credit</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Category</th>
                <th className="p-2">Subcategory</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.map((group, groupIdx) => (
                <React.Fragment key={groupIdx}>
                  {/* Group header */}
                  <tr className="bg-gray-700 text-white">
                    <td colSpan={8} className="p-2 font-bold">
                      Group: {group[0].description}
                    </td>
                  </tr>
                  {/* Grouped rows */}
                  {group.map((txn, idx) => (
                    <tr key={txn.id || txn._id} className="border-b border-gray-700">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(txn.id || txn._id)}
                          onChange={() => handleCheckboxChange(txn.id || txn._id)}
                        />
                      </td>
                      <td className="p-2">{txn.date1 || "-"}</td>
                      <td className="p-2">{txn.description || "-"}</td>
                      <td className="p-2">{txn.debit_amount || "-"}</td>
                      <td className="p-2">{txn.credit_amount || "-"}</td>
                      <td className="p-2">{txn.balance_amount || "-"}</td>
                      <td className={`p-2 ${CategoryColor.getCategoryColor(txn.category)}`}>
                        {txn.category || "-"}
                      </td>
                      <td className={`p-2 ${CategoryColor.getCategoryColor(txn.category)}`}>
                        {txn.subcategory || "-"}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Pagination --- */}
      <div className="flex justify-between items-center mt-4 p-2">
        <button
          className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CategorizeTablesGroup4;



// the category color function
// src/components/Common/CategoryColor.js

// const getCategoryColor = (category, mode = "bg") => {
//   const colorMap = {
//     Income: "green",
//     Savings: "blue",
//     Housing: "purple",
//     Transport: "yellow",
//     Expenses: "red",
//     Debt: "gray",
//     Default: "gray",
//   };

//   const color = colorMap[category] || colorMap.Default;
//   return mode === "text" ? `text-${color}-500` : `bg-${color}-600`;
// };

// export default getCategoryColor;
