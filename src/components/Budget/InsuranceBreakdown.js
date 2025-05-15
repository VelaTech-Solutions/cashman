// src/components/Budget/InsuranceBreakdown.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Component Imports
import LoadClientData from "components/Common/LoadClientData";
import InsuranceDataTable from "./Tables/InsuranceDataTable";

const InsuranceBreakdown = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setTransactions(clientData.transactions || []);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);


  if (!clientData) return <div className="text-center py-10 text-gray-400">Loading client data...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl text-white font-bold mb-4">Insurance Breakdown</h2>

      {/* Render the Insurance Table */}
      <div className="mt-6">
        <InsuranceDataTable insurance={clientData.insurance} />
      </div>
    </div>
  );
};

export default InsuranceBreakdown;
