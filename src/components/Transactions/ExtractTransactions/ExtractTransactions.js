// src/components/Transactions/ExtractTransactions/ExtractTransactions.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Component Imports
import { Sidebar, LoadClientData } from 'components/Common';

import ExtractAutomatically from "./ExtractAutomatic/ExtractAutomatically";
import ExtractManually from "./ExtractManual/ExtractManually";
// import HelpExtract from "../help/HelpExtract";

function ExtractTransactions() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("ExtractAutomatically");
  const unverifiedCount = clientData?.transactions?.filter(tx => tx.verified === "✗").length || 0;
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}/transactionspage`, label: "Back to Tansactions", icon: "ph-file-text" },
    { path: `/client/${id}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" },
    {
      path: `/client/${id}/edit-transactions`,
      label: `Edit Transactions (${unverifiedCount})`,
      icon: "ph-file-text",
    },
    { type: "divider" },
    {
      label: "Automatically",
      icon: "ph-rocket-launch",
      onClick: () => setActiveSection("ExtractAutomatically"),
    },
    {
      label: "Manually",
      icon: "ph-pencil",
      onClick: () => setActiveSection("ExtractManually"),
    },
    { type: "divider" },
    {
      path: `/ExtractSettings/${id}`,
      label: "Extract Settings",
      icon: "ph-arrow-left",
    },
    { path: "/HelpExtract", label: "Extract Help", icon: "ph-arrow-left" },
  ];
  

  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load client data using the reusable function
        const clientData = await LoadClientData(id); // Assuming 'clientData' is the reusable function
        setClientData(clientData);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };

    fetchData();
  }, [id]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Extract Transactions" links={links} />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Extract Transactions</h2>
          {activeSection === "ExtractAutomatically" && <ExtractAutomatically />}
          {activeSection === "ExtractManually" && <ExtractManually />}
      </div>
    </div>
  );
}
export default ExtractTransactions;
