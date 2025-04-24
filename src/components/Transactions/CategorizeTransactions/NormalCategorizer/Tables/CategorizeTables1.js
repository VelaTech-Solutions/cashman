import React, { useState, useMemo, useEffect } from "react";
import { LoadClientData, CategoryColor, Loader } from "components/Common";
import { 
  tableHeaders, 
  renderRow,
  sortItemsByDate, 
  filterValidTransactions, 
  paginateItems, 
  groupTransactions, 
  toggleSelect,
  toggleSelectAll 

} from '../Utils/tableUtils';


const CategorizeTables1 = ({ clientId, onCategorize }) => {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [sortAsc, setSortAsc] = useState(false);
  const [groupBy, setGroupBy] = useState("default");
  const [currentTab, setCurrentTab] = useState("table1");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 12;

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await LoadClientData(clientId);
        if (!data) {
          setError("Client not found.");
        } else {
          setClientData(data);
          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
          setSelectedTransactions([]);
        }
      } catch {
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  const toggleGroupBy = () => {
    setGroupBy((prev) => (prev === "default" ? "description" : "default"));
    setCurrentPage(1);
  };



  const validTransactions = useMemo(() => {
    const filtered = filterValidTransactions(transactions);
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date1);
      const dateB = new Date(b.date1);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [transactions, sortAsc]);

  const groupedAndFlattened = useMemo(() => {
    const grouped = validTransactions.reduce((acc, txn) => {
      const key =
        groupBy === "description"
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

  const totalPages = Math.ceil(groupedAndFlattened.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = groupedAndFlattened.slice(startIndex, startIndex + rowsPerPage);

  const isAllSelected =
    currentItems.filter((i) => !i.isHeader).length > 0 &&
    currentItems
      .filter((i) => !i.isHeader)
      .every((i) => selectedTransactions.includes(i.uid));



  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="text-white">
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
          <div className="flex items-center gap-2 pr-2">
            <span className="text-sm text-gray-400">Group by:</span>
            <button
              onClick={toggleGroupBy}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-cyan-400 border border-cyan-500"
            >
              {groupBy === "default" ? "Default" : "Description"}
            </button>
            <span className="text-sm text-gray-400">Sort by:</span>
            <button
              onClick={() => setSortAsc((prev) => !prev)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-cyan-400 border border-cyan-500"
            >
              Date {sortAsc ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>
      {currentTab === "table1" && (
          <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-md">
            <table className="min-w-full bg-gray-800">
              <thead className="bg-gray-900 sticky top-0 z-10 text-sm text-left text-gray-300">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header.key} className="p-3">
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm text-gray-200">
                {/* {currentItems.map(renderRow)} */}
              </tbody>
            </table>
          </div>
        )}


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
