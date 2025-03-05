import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadClientData from "components/LoadClientData";

import CFuneralLifeCoverDataTable from "./InsuranceBreakdown/cFuneralLifeCoverDataTable"; // Current Insurance - Funeral & Life Cover (Risk)
import CSavingsInvestmentsDataTable from "./InsuranceBreakdown/cSavingsInvestmentsDataTable"; // Current Insurance - Savings & Investments
import CShortTermInsuranceDataTable from "./InsuranceBreakdown/cShortTermInsuranceDataTable"; // Current Insurance - Short-Term Insurance

import RFuneralLifeCoverDataTable from "./InsuranceBreakdown/rFuneralLifeCoverDataTable"; // Restructure - Funeral & Life Cover (Risk)
import RSavingsInvestmentsDataTable from "./InsuranceBreakdown/rSavingsInvestmentsDataTable"; // Restructure - Savings & Investments
import RShortTermInsuranceDataTable from "./InsuranceBreakdown/rShortTermInsuranceDataTable"; // Restructure - Short-Term Insurance

import { getFirestore } from "firebase/firestore";

const InsuranceBreakdown = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const db = getFirestore();

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
      
      <h2 className="text-xl text-white font-bold mb-4">Current Insurance</h2>
      {/* Grid Layout for Tables */}
      <div className="grid grid-cols-3 gap-4 border border-gray-700 p-2 rounded-lg">
        {/* Funeral & Life Cover */}
        <div className="w-1/18">
          <CFuneralLifeCoverDataTable transactions={clientData.transactions} />
        </div>
        {/* Savings & Investments */}
        <div className="w-1/18">
          <CSavingsInvestmentsDataTable transactions={clientData.transactions} />
        </div>
        {/* Short-Term Insurance */}
        <div className="w-1/18">
          <CShortTermInsuranceDataTable transactions={clientData.transactions} />
        </div>
      </div>
      
      <h2 className="text-xl text-white font-bold mb-4 mt-6">Restructure Insurance</h2>
      {/* Grid Layout for Tables */}
      <div className="grid grid-cols-3 gap-4 border border-gray-700 p-2 rounded-lg">
        {/* Funeral & Life Cover */}
        <div className="w-1/18">
          <RFuneralLifeCoverDataTable transactions={clientData.transactions} />
        </div>
        {/* Savings & Investments */}
        <div className="w-1/18">
          <RSavingsInvestmentsDataTable transactions={clientData.transactions} />
        </div>
        {/* Short-Term Insurance */}
        <div className="w-1/18">
          <RShortTermInsuranceDataTable transactions={clientData.transactions} />
        </div>
        
      </div>

    </div>
  );
};

export default InsuranceBreakdown;


