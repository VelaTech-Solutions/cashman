import React, { useState } from "react";
import getCategoryColor from "components/Common/CategoryColor";
const CategorizeTables1 = ({ 
  transactions, 
  selectedTransactions, 
  setSelectedTransactions
}) => {
  const [currentTab, setCurrentTab] = useState("table1");
  const rowsPerPage = 12;
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentTransactions = transactions.slice(startIndex, startIndex + rowsPerPage);

  const isAllSelected =
    currentTransactions.length > 0 &&
    currentTransactions.every((_, idx) =>
      selectedTransactions.includes(startIndex + idx)
    );

  const handleSelectAll = () => {
    const currentIndexes = currentTransactions.map((_, idx) => startIndex + idx);
    if (isAllSelected) {
      setSelectedTransactions(
        selectedTransactions.filter((i) => !currentIndexes.includes(i))
      );
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
      setSelectedTransactions(
        selectedTransactions.filter((i) => i !== globalIndex)
      );
    } else {
      setSelectedTransactions([...selectedTransactions, globalIndex]);
    }
  };


  return (
    <div className="text-white">

      {/* Tabs */}
      <div className="flex space-x-4 mb-4 border-b border-gray-700">
        <button
          className={`p-2 ${currentTab === "scrollable" ? "border-b-2 border-white" : ""}`}
          onClick={() => setCurrentTab("table1")}
        >
          Table1
        </button>
      </div>
 
      {currentTab === "table1" && (
        <div className="overflow-y-auto max-h-[500px] shadow-md border border-gray-700 rounded-lg">
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
              {currentTransactions.map((transaction, idx) => (
                <tr key={startIndex + idx} className="border-b border-gray-700">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(startIndex + idx)}
                      onChange={() => handleCheckboxChange(idx)}
                    />
                  </td>
                  <td className="p-2">{transaction.date1 || "-"}</td>
                  <td className="p-2">{transaction.description || "-"}</td>
                  <td className="p-2">{transaction.debit_amount || "-"}</td>
                  <td className="p-2">{transaction.credit_amount || "-"}</td>
                  <td className="p-2">{transaction.balance_amount || "-"}</td>
                  <td className="p-2">{transaction.category || "-"}</td>
                  <td className={`p-2${getCategoryColor(transaction.category)}`}>{transaction.subcategory || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4">
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

export default CategorizeTables1;
