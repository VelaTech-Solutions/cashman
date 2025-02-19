// src/pages/ExtractTransactions.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import LoadClientData from "components/LoadClientData";
import Sidebar from "components/Sidebar";
import ExtractAutomatically from "components/Extract/ExtractAutomatically";
import ExtractManually from "components/Extract/ExtractManually";
import "styles/tailwind.css";

// Help Imports
// import HelpExtract from "../help/HelpExtract";

function ExtractTransactions() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: "/viewclient", label: "Back to View Clients", icon: "ph-file-text" },

    {
      path: `/client/${id}/edit-transactions`,
      label: "Edit Transactions",
      icon: "ph-arrow-left",
    },
    {
      path: `/client/${id}/categorize`,
      label: "Categorize Transactions",
      icon: "ph-arrow-left",
    },
    { type: "divider" }, // Divider line
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
        <div className="space-x-4 mb-6">
        <button
            className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              activeSection === "ExtractAutomatically"
                ? "bg-green-600 shadow-lg shadow-green-600/50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setActiveSection("ExtractAutomatically")}
          >
            🚀 Extract Automatically
          </button>

          <button
            className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              activeSection === "ExtractManually"
                ? "bg-green-600 shadow-lg shadow-green-600/50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setActiveSection("ExtractManually")}
          >✍️ Extract Manually
          </button>
          {activeSection === "ExtractAutomatically" && <ExtractAutomatically />}
          {activeSection === "ExtractManually" && <ExtractManually />}
        </div>
      </div>
    </div>
  );
}
export default ExtractTransactions;

// can we make the different ways of extraction placed in the sidebar? the render if  manual or auto extraction?
