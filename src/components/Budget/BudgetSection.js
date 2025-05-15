// src/components/Budget/BudgetSection.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Component Imports
import LoadClientData from "components/Common/LoadClientData";
import BudgetView from "components/Budget/Views/BudgetView";

const BudgetSection = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);

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

      {/* Render the Budget View */}
      <div className="mt-6">
        <BudgetView transactions={clientData.transactions} clientId={clientId} />
      </div>
    </div>
  );
};

export default BudgetSection;
