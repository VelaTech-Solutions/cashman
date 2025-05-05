// src/components/Budget/BudgetSection.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Firebase Imports
import { getFirestore } from "firebase/firestore";

// Component Imports
import LoadClientData from "components/Common/LoadClientData";
import PersonalBudgetView1 from "components/Budget/BudgetView/PersonalBudgetView1";
import PersonalBudgetView2 from "components/Budget/BudgetView/PersonalBudgetView2";
import PersonalBudgetView3 from "components/Budget/BudgetView/PersonalBudgetView3";
import PersonalBudgetView4 from "components/Budget/BudgetView/PersonalBudgetView4";
import PersonalBudgetView5 from "components/Budget/BudgetView/PersonalBudgetView5";
import PersonalBudgetView6 from "components/Budget/BudgetView/PersonalBudgetView6";
import PersonalBudgetView7 from "components/Budget/BudgetView/PersonalBudgetView7";


const BudgetSection = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const db = getFirestore();
  // State for toggling view mode (1 = Grid View, 2 = List View)
  const [viewMode, setViewMode] = useState(7);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(clientId);
        setClientData(data);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };
    fetchData();
  }, [clientId]);

  if (!clientData) return <div className="text-center py-10 text-gray-400">Loading client data...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl text-white font-bold mb-4">Budget Overview</h2>
        {/* View Mode Toggle */}
        <div className="flex space-x-1">
          {[
            { mode: 1, label: "📊" },
            { mode: 2, label: "📋" },
            { mode: 3, label: "🎛️" },
            { mode: 4, label: "🚀" },
            { mode: 5, label: "📈" },
            { mode: 6, label: "📉" },
            { mode: 7, label: "📊" },

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
          {
              viewMode === 1 ? (
            <PersonalBudgetView1 transactions={clientData.transactions} clientId={clientId} />
          ) : viewMode === 2 ? (
            <PersonalBudgetView2 transactions={clientData.transactions} />
          ) : viewMode === 3 ? (
            <PersonalBudgetView3 transactions={clientData.transactions} />
          ) : viewMode === 4 ? (
            <PersonalBudgetView4 transactions={clientData.transactions} />
          ) : viewMode === 5 ? (
            <PersonalBudgetView5 transactions={clientData.transactions} />
          ) : viewMode === 6 ? (
            <PersonalBudgetView6 transactions={clientData.transactions} />
          ) : viewMode === 7 ? (
            <PersonalBudgetView7 clientId={clientId} />
          ) : null
          }
        </div>
    </div>
  );
};

export default BudgetSection;
