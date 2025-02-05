// src/pages/extraction-page.js
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

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
    { type: "divider" }, // Divider line
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
    {
      path: "/ExtractSettings",
      label: "Extract Settings ❌",
      icon: "ph-arrow-left",
    },
    { path: "/HelpExtract", label: "Extract Help", icon: "ph-arrow-left" },
  ];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("");

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
      } finally {
        setLoading(false);
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
            className={`px-4 py-2 rounded ${
              activeSection === "ExtractAutomatically"
                ? "bg-green-600"
                : "bg-gray-700"
            }`}
            onClick={() => setActiveSection("ExtractAutomatically")}
          >
            Extract Automatic
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeSection === "ExtractManually"
                ? "bg-green-600"
                : "bg-gray-700"
            }`}
            onClick={() => setActiveSection("ExtractManually")}
          >
            Extract Manual
          </button>
        </div>

        {activeSection === "ExtractAutomatically" && <ExtractAutomatically />}

        {activeSection === "ExtractManually" && <ExtractManually />}

        {/* Main Content */}
        {/* <div className="flex-1 p-8"> */}
        {/* Header Section */}
        {/* <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">
            Extract Transactions
          </h1>
        </header> */}

        {/* Overview Section */}
        {/* <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">
            Transactions Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Total Transactions
              </p>
              <p className="text-3xl font-bold text-white">
                {clientData?.transactions?.length ?? 0}
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Transactions Needing Review
              </p>
              <p className="text-3xl font-bold text-white">
                0
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Corrected Transactions
              </p>
              <p className="text-3xl font-bold text-white">
                0
              </p>
            </div>
          </div>
        </section> */}
      </div>
    </div>
  );
}
export default ExtractTransactions;

// can we make the different ways of extraction placed in the sidebar? the render if  manual or auto extraction?
