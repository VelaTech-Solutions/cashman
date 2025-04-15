import React, { useState, useMemo, useEffect } from "react";
import { LoadClientData, CategoryColor, Loader } from "components/Common";

const CategorizeTables1 = ({ clientId, onCategorize }) => {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [groupBy, setGroupBy] = useState("category");
  const [currentTab, setCurrentTab] = useState("table1");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 12;

  // Fetch client data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await LoadClientData(clientId);
        if (!data) {
          setError("Client not found.");
        } else {
          setClientData(data);
          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        }
      } catch (err) {
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  // Group transactions by category or description
  const toggleGroupBy = () => {
    setGroupBy((prev) => (prev === "category" ? "description" : "category"));
    setCurrentPage(1);
  };

  // Filter valid transactions based on the required fields
  const filterValidTransactions = (transactions) => {
    return transactions.filter(txn => {
      return txn.date1 &&
        txn.description &&
        (txn.credit_amount || txn.debit_amount) &&
        txn.balance_amount;
    });
  };

  // Filtered transactions: Only valid ones will be shown here
  const validTransactions = useMemo(() => filterValidTransactions(transactions), [transactions]);

  // Group and flatten transactions
  const groupedAndFlattened = useMemo(() => {
    const grouped = validTransactions.reduce((acc, txn) => {
      const key = groupBy === "description"
        ? txn.description || "No Description"
        : txn.category || "Uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(txn);
      return acc;
    }, {});

    let flat = [];
    Object.entries(grouped).forEach(([groupKey, txns]) => {
      flat.push({ isHeader: true, groupKey });
      flat.push(...txns);
    });

    return flat;
  }, [validTransactions, groupBy]);

  // Pagination
  const totalPages = Math.ceil(groupedAndFlattened.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = groupedAndFlattened.slice(startIndex, startIndex + rowsPerPage);

  const isAllSelected = currentItems.filter(i => !i.isHeader).length > 0 &&
    currentItems.filter(i => !i.isHeader).every(i => selectedTransactions.includes(i.uid));

  const handleSelectAll = () => {
    const uids = currentItems.filter(i => !i.isHeader).map(i => i.uid);
    if (isAllSelected) {
      setSelectedTransactions(selectedTransactions.filter(uid => !uids.includes(uid)));
    } else {
      const newSelections = [...selectedTransactions, ...uids.filter(uid => !selectedTransactions.includes(uid))];
      setSelectedTransactions(newSelections);
    }
  };

  const handleCheckboxChange = (idx) => {
    const item = currentItems[idx];
    const uid = item?.uid;
    if (!uid) return;
    if (selectedTransactions.includes(uid)) {
      setSelectedTransactions(selectedTransactions.filter(id => id !== uid));
    } else {
      setSelectedTransactions([...selectedTransactions, uid]);
    }
  };

  const handleCategorizeClick = () => {
    const mainTxn = transactions.find(txn => txn.uid === selectedTransactions[0]);
    if (!mainTxn) return;

    const payload = {
      category: mainTxn.category || "",
      subcategory: mainTxn.subcategory || "",
      description: mainTxn.description || "",
      uids: selectedTransactions,
    };

    onCategorize && onCategorize(payload);
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="text-white">
      {/* Tabs and group toggle */}
      <div className="flex border-b border-gray-700 mb-4 justify-between items-center">
        <div>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              currentTab === "table1"
                ? "border-b-2 border-cyan-500 text-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setCurrentTab("table1")}
          >
            Table 1
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleCategorizeClick}
            disabled={selectedTransactions.length === 0}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-semibold"
          >
            Save Categorization
          </button>

          <div className="flex items-center gap-2 pr-2">
            <span className="text-sm text-gray-400">Group by:</span>
            <button
              onClick={toggleGroupBy}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-cyan-400 border border-cyan-500"
            >
              {groupBy === "category" ? "Category" : "Description"}
            </button>
          </div>
        </div>
      </div>

      {/* Filtered and grouped table */}
      {currentTab === "table1" && (
        <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-md">
          <table className="min-w-full bg-gray-800">
            <thead className="bg-gray-900 sticky top-0 z-10 text-sm text-left text-gray-300">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-3">Date</th>
                <th className="p-3">Description</th>
                <th className="p-3">Description2</th>
                <th className="p-3">Credit</th>
                <th className="p-3">Debit</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Category</th>
                <th className="p-3">Subcategory</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-200">
              {currentItems.map((item, idx) =>
                item.isHeader ? (
                  <tr key={`header-${item.groupKey}`} className="bg-gray-900 border-t border-gray-700">
                    <td colSpan={8} className="p-3 font-semibold text-cyan-400">
                      {groupBy === "category"
                        ? `Category: ${item.groupKey}`
                        : `Description: ${item.groupKey}`}
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={startIndex + idx}
                    className="border-t border-gray-700 hover:bg-gray-700/30"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(item.uid)}
                        onChange={() => handleCheckboxChange(idx)}
                      />
                    </td>
                    <td className="p-3">{item.date1 || "-"}</td>
                    <td className="p-3">{item.description || "-"}</td>
                    <td className="p-3">{item.description2 || "-"}</td>
                    <td className="p-3">{item.credit_amount || "-"}</td>
                    <td className="p-3">{item.debit_amount || "-"}</td>
                    <td className="p-3">{item.balance_amount || "-"}</td>
                    <td className="p-3">{item.category || "-"}</td>
                    <td className={`p-3 ${CategoryColor.getCategoryColor(item.category)}`}>
                      {item.subcategory || "-"}
                    </td>
                  </tr>
                )
              )}
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

export default CategorizeTables1;
