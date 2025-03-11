import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadClientData from "components/LoadClientData";

import Income from "./categories/Income"; // Income
import Savings from "./categories/Savings"; // Savings
import Housing from "./categories/Housing"; //  Housing
import Transportation from "./categories/Transportation"; // Transportation
import Expenses from "./categories/Expenses"; // Expenses
import Debt from "./categories/Debt"; // Debt

import PersonalBudgetView1 from "components/Budget/BudgetView/PersonalBudgetView1";
import PersonalBudgetView2 from "components/Budget/BudgetView/PersonalBudgetView2";
import PersonalBudgetView3 from "components/Budget/BudgetView/PersonalBudgetView3";
import PersonalBudgetView4 from "components/Budget/BudgetView/PersonalBudgetView4";

import { getFirestore } from "firebase/firestore";

const BudgetSection = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const db = getFirestore();
  // State for toggling view mode (1 = Grid View, 2 = List View)
  const [viewMode, setViewMode] = useState(1);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(id);
        setClientData(data);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };
    fetchData();
  }, [id]);

  if (!clientData) return <div className="text-center py-10 text-gray-400">Loading client data...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl text-white font-bold mb-4">Budget Overview</h2>
      {/* <Income transactions={clientData.transactions} />
      <Savings transactions={clientData.transactions} />
      <Housing transactions={clientData.transactions} />
      <Transportation transactions={clientData.transactions} />
      <Expenses transactions={clientData.transactions} />
      <Debt transactions={clientData.transactions} /> */}


        {/* View Mode Toggle */}
        <div className="flex space-x-1">
          {[
            { mode: 1, label: "📊" },
            { mode: 2, label: "📋" },
            { mode: 3, label: "🎛️" },
            { mode: 4, label: "🚀" },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs rounded-md transition-all duration-300 shadow-sm ${
                viewMode === mode
                  ? mode === 4
                    ? "bg-cyan-500 animate-pulse shadow-md" // Cyberpunk pulses
                    : "bg-blue-500 shadow-md"
                  : "bg-gray-800 hover:bg-gray-700 hover:shadow-sm"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Render the Selected Table */}
        <div className="mt-6">
          {viewMode === 1 ? 
          (
            <PersonalBudgetView1 transactions={clientData.transactions} />
          ) : viewMode === 2 ? (
            <PersonalBudgetView2 transactions={clientData.transactions} />
          ) : viewMode === 3 ? (
            <PersonalBudgetView3 transactions={clientData.transactions} />
          ) : (
            <PersonalBudgetView4 transactions={clientData.transactions} />
          )}
        </div>

    </div>
  );
};

export default BudgetSection;
