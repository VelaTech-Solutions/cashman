// src/pages/Budget.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import BudgetSection from "components/Budget/BudgetSection";
import {
  ciflcData,
  cisisData,
  cistiData,
  rflcData,
  rsiData,
  rstiData,
  rnotesData,
} from "components/Budget/InsuranceBreakdown";
import InsuranceBreakdown from "components/Budget/InsuranceBreakdown";
import BudgetSummary from "components/Budget/BudgetSummary";
// import LoadTransactions from "components/LoadTransactions";
import Sidebar from "components/Sidebar";
import "styles/tailwind.css";

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
    { type: "divider" }, // Divider line
    {
      path: `/client/${id}/categorize`,
      label: "Categorize Transactions",
      icon: "ph-arrow-left",
    },
    {
      path: "/BudgetSettings",
      label: "Budget Settings ❌",
      icon: "ph-arrow-left",
    },
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
              activeSection === "personalBudget"
                ? "bg-green-600"
                : "bg-gray-700"
            }`}
            onClick={() => setActiveSection("personalBudget")}
          >
            Personal Budget
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeSection === "insuranceBreakdown"
                ? "bg-green-600"
                : "bg-gray-700"
            }`}
            onClick={() => setActiveSection("insuranceBreakdown")}
          >
            Insurance Breakdown
          </button>

          <button
            className={`px-4 py-2 rounded ${
              activeSection === "BudgetSummary" ? "bg-green-600" : "bg-gray-700"
            }`}
            onClick={() => setActiveSection("BudgetSummary")}
          >
            Summary
          </button>
        </div>

        {/* Personal Budget */}
        {activeSection === "personalBudget" && <BudgetSection />}

        {/* Insurance Breakdown */}
        {activeSection === "insuranceBreakdown" && <InsuranceBreakdown />}
        
        {/* Budget Summary */}
        {activeSection === "BudgetSummary" && <BudgetSummary />}
      </div>
    </div>
  );
};

export default Budget;
