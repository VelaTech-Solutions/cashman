import React, { useState } from "react";
import CategorizeTables1 from "./CategorizeTables1";
import CategorizeTables2 from "./CategorizeTables2";
import CategorizeTables3 from "./CategorizeTables3";

const CategorizeTablesContainer = ({   
    transactions, 
    selectedTransactions, 
    setSelectedTransactions 
}) => {
  const [viewMode, setViewMode] = useState(1); // 1 = Overview1, 2 = Overview2

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      {/* Toggle Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            onClick={() => setViewMode(1)}
            className={`px-4 py-2 text-sm rounded-md ${
              viewMode === 1 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Table1
          </button>
          <button
            onClick={() => setViewMode(2)}
            className={`px-4 py-2 text-sm rounded-md ${
              viewMode === 2 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Table2
          </button>
          <button
            onClick={() => setViewMode(3)}
            className={`px-4 py-2 text-sm rounded-md ${
                viewMode === 3 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Table3  
            </button>
        </div>
      </div>

        {/* Render Selected Tables */}
        {viewMode === 1 ? (
        <CategorizeTables1
        transactions={transactions}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}
        />
        ) : viewMode === 2 ? (
        <CategorizeTables2
        transactions={transactions}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}
        />
        ) : (
        <CategorizeTables3 
        transactions={transactions}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}/>
        )}


    </div>
  );
};

export default CategorizeTablesContainer;
