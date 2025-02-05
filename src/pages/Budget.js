// src/pages/Budget.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
// import LoadTransactions from "../components/LoadTransactions";

import BudgetSection from "../components/BudgetSection";

import {
  ciflcData,
  cisisData,
  cistiData,
  rflcData,
  rsiData,
  rstiData,
  rnotesData
} from "../components/InsuranceBreakdown";
import InsuranceBreakdown from "../components/InsuranceBreakdown"
import SummaryBudget from "../components/SummaryBudget"

import Sidebar from "../components/Sidebar";
import "../styles/tailwind.css";

//Help
import HelpBudget from "../help/HelpBudget";


const Budget = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [activeSection, setActiveSection] = useState("personalBudget");


  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    // { path: "javascript:void(0)", label: "Back", icon: "ph-arrow-left" },
    { path: "/viewclient", label: "View Clients", icon: "ph-file-text" },
    { type: "divider" },  // Divider line
    { path: `/client/${id}/categorize`, label: "Categorize Transactions", icon: "ph-arrow-left" },
    { path: "/BudgetSettings", label: "Budget Settings ❌", icon: "ph-arrow-left" }, 
    { path: "/HelpBudget", label: "Budget Help", icon: "ph-arrow-left" }, 
  ];


  // Color Category
  const getCategoryColor = (category) => {
    switch (category) {
      case "Income":
        return "bg-green-600"; // Green for income
      case "Savings":
        return "bg-blue-600"; // Blue for savings
      case "Housing":
        return "bg-purple-600"; // Purple for housing
      case "Transportation":
        return "bg-yellow-600"; // Yellow for transport
      case "Expenses":
        return "bg-red-600"; // Red for expenses
      case "Debt":
        return "bg-gray-700"; // Dark gray for debt
      default:
        return "bg-gray-800"; // Default gray if category is unknown
    }
  };
  

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Budget" links={links} />

      <div className="flex-1 p-8">
        <div className="space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              activeSection === "personalBudget" ? "bg-green-600" : "bg-gray-700"
            }`}
            onClick={() => setActiveSection("personalBudget")}
          >
            Personal Budget
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeSection === "insuranceBreakdown" ? "bg-green-600" : "bg-gray-700"
            }`}
            onClick={() => setActiveSection("insuranceBreakdown")}
          >
            Insurance Breakdown
          </button>

          <button
            className={`px-4 py-2 rounded ${
              activeSection === "SummaryBudget" ? "bg-green-600" : "bg-gray-700"
            }`}
            onClick={() => setActiveSection("SummaryBudget")}
          >
            Summary
          </button>
        </div>



        {/* Personal Budget */}
        {activeSection === "personalBudget" && <BudgetSection />}

        {/* Insurance Breakdown */}
        {activeSection === "insuranceBreakdown" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            
            {/* Current Insurance Section */}
            <h2 className="text-xl font-bold mb-4">Current Insurance</h2>
            <InsuranceBreakdown title="Funeral & Life Cover" data={ciflcData || []} />
            <InsuranceBreakdown title="Savings & Investments" data={cisisData || []} />
            <InsuranceBreakdown title="Short-Term Insurance" data={cistiData || []} />

            {/* Restructure Section */}
            <h2 className="text-xl font-bold mt-6">Restructure</h2>
            <InsuranceBreakdown title="Funeral & Life Cover" data={rflcData || []} />
            <InsuranceBreakdown title="Savings & Investments" data={rsiData || []} />
            <InsuranceBreakdown title="Short-Term Insurance" data={rstiData || []} />
            <InsuranceBreakdown title="Notes" data={rnotesData || []} />
          
            <p>Insurance data will be displayed here...</p>
          </div>
        )}

        {/* Budget Summary */}
        {activeSection === "SummaryBudget" && <SummaryBudget />}

      </div>
    </div>
  );
};

export default Budget;
