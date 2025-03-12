import React, { useState } from "react";
import CategorizeOverview1 from "./CategorizeTransactionsOverview1";
import CategorizeOverview2 from "./CategorizeTransactionsOverview2";
import CategorizeOverview3 from "./CategorizeTransactionsOverview3";

const CategorizeOverviewContainer = ({ transactions }) => {
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
                Overview 1 📊
              </button>
              <button
                onClick={() => setViewMode(2)}
                className={`px-4 py-2 text-sm rounded-md ${
                  viewMode === 2 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                Overview 2 📋
              </button>
              <button
                onClick={() => setViewMode(3)}
                className={`px-4 py-2 text-sm rounded-md ${
                    viewMode === 3 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
                  }`}
                >
                  Overview 3  
                </button>
            </div>
          </div>

          {/* Render Selected Overview */}
          {viewMode === 1 ? (
          <CategorizeOverview1 transactions={transactions} />
          ) : viewMode === 2 ? (
          <CategorizeOverview2 transactions={transactions} />
          ) : (
          <CategorizeOverview3 transactions={transactions} />
          )}
    </div>
  );
};

export default CategorizeOverviewContainer;
