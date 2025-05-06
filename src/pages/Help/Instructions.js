// src/pages/Instructions.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "styles/tailwind.css";

// Component Imports
import { Sidebar } from 'components/Common';

const links = [
  { path: "/dashboard", label: "Back To Dashboard", icon: "ph-check-square" },
  { path: "goBack", label: "Back", icon: "ph-arrow-left" },
];

function Instructions() {
  const [error, setError] = useState("");

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Sidebar title="Dashboard" links={links} />
      <div className="instructions-container p-8">
        <h1 className="text-3xl font-bold mb-6">How to Use This App</h1>
        <div className="instruction-steps space-y-4">
          <h2 className="text-xl font-semibold">Step 1: Upload Bank Statement at Add Client</h2>
          <p>Enter your income sources and amounts in the Income section.</p>

          <h2 className="text-xl font-semibold">Step 2: Head to the Captured Client Profile</h2>
          <p>View the uploaded statements and related client data.</p>

          <h2 className="text-xl font-semibold">Step 3: Under Transactions Click Extract Transactions</h2>
          <p>This processes and organizes the raw bank statement data.</p>

          <h2 className="text-xl font-semibold">Step 4: Click Categorize Transactions</h2>
          <p>Assign categories to each transaction for budgeting accuracy.</p>

          <h2 className="text-xl font-semibold">Step 5: Head to Budget</h2>
          <p>Review and manage your categorized expenses against your budget.</p>

          <h2 className="text-xl font-semibold">Step 6: Finally, Generate a Report</h2>
          <p>View a full financial summary in the Reports section.</p>
        </div>
      </div>
    </div>
  );
}

export default Instructions;
