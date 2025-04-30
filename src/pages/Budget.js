// src/pages/Budget.js
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Component Imports
import { Sidebar } from 'components/Common';
import BudgetSection from "components/Budget/BudgetSection";
import InsuranceBreakdown from "components/Budget/InsuranceBreakdown";
import BudgetSummary from "components/Budget/BudgetSummary";



const Budget = () => {
  const { id: clientId } = useParams();
  const [activeSection, setActiveSection] = useState("personalBudget");

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" }, // Divider line
    {
      path: "/BudgetSettings",
      label: "Budget Settings ❌",
      icon: "ph-arrow-left",
    },
    { path: "/HelpBudget", label: "Budget Help", icon: "ph-arrow-left" },

  ];

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
