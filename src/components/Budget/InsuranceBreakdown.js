import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadClientData from "components/LoadClientData";

import CFuneralLifeCoverDataTable from "./InsuranceBreakdown/cFuneralLifeCoverDataTable"; // Current Insurance - Funeral & Life Cover (Risk)
import CSavingsInvestmentsDataTable from "./InsuranceBreakdown/cSavingsInvestmentsDataTable"; // Current Insurance - Savings & Investments
import CShortTermInsuranceDataTable from "./InsuranceBreakdown/cShortTermInsuranceDataTable"; // Current Insurance - Short-Term Insurance

import RFuneralLifeCoverDataTable from "./InsuranceBreakdown/rFuneralLifeCoverDataTable"; // Restructure - Funeral & Life Cover (Risk)
import RSavingsInvestmentsDataTable from "./InsuranceBreakdown/rSavingsInvestmentsDataTable"; // Restructure - Savings & Investments
import RShortTermInsuranceDataTable from "./InsuranceBreakdown/rShortTermInsuranceDataTable"; // Restructure - Short-Term Insurance

import InsuranceDataTable1 from "./InsuranceBreakdown/InsuranceDataTable1";
import InsuranceDataTable2 from "./InsuranceBreakdown/InsuranceDataTable2";
import InsuranceDataTable3 from "./InsuranceBreakdown/InsuranceDataTable3";
import InsuranceDataTable4 from "./InsuranceBreakdown/InsuranceDataTable4";

import { getFirestore } from "firebase/firestore";

const InsuranceBreakdown = () => {
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
      <h2 className="text-xl text-white font-bold mb-4">Insurance Breakdown</h2>
      
    {/* <h2 className="text-xl text-white font-bold mb-4">Current Insurance</h2> */}
      {/* Grid Layout for Tables */}
      {/* <div className="grid grid-cols-3 gap-4 border border-gray-700 p-2 rounded-lg"> */}
        {/* Funeral & Life Cover */}
        {/* <div className="w-1/18">
          <CFuneralLifeCoverDataTable transactions={clientData.transactions} />
        </div> */}
        {/* Savings & Investments */}
        {/* <div className="w-1/18">
          <CSavingsInvestmentsDataTable transactions={clientData.transactions} />
        </div> */}
        {/* Short-Term Insurance */}
        {/* <div className="w-1/18">
          <CShortTermInsuranceDataTable transactions={clientData.transactions} />
        </div>
      </div> */}
      
      {/* <h2 className="text-xl text-white font-bold mb-4 mt-6">Restructure Insurance</h2> */}
      {/* Grid Layout for Tables */}
      {/* <div className="grid grid-cols-3 gap-4 border border-gray-700 p-2 rounded-lg"> */}
        {/* Funeral & Life Cover */}
        {/* <div className="w-1/18">
          <RFuneralLifeCoverDataTable transactions={clientData.transactions} />
        </div> */}
        {/* Savings & Investments */}
        {/* <div className="w-1/18">
          <RSavingsInvestmentsDataTable transactions={clientData.transactions} />
        </div> */}
        {/* Short-Term Insurance */}
        {/* <div className="w-1/18">
          <RShortTermInsuranceDataTable transactions={clientData.transactions} />
        </div>
         */}
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
            <InsuranceDataTable1 insurance={clientData.insurance} />
          ) : viewMode === 2 ? (
            <InsuranceDataTable2 insurance={clientData.insurance} />
          ) : viewMode === 3 ? (
            <InsuranceDataTable3 insurance={clientData.insurance} />
          ) : (
            <InsuranceDataTable4 insurance={clientData.insurance} />
          )}
        </div>

      </div>
  );
};

export default InsuranceBreakdown;


