// src/pages/Instructions.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import "../styles/tailwind.css";

const links = [
  { path: "/dashboard", label: "Back To Dashboard", icon: "ph-check-square" },
];

function Instructions() {
  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar title="Dashboard" links={links} />
      <div className="instructions-container">
        <h1>How to Use This App</h1>
        <div className="instruction-steps">
          <h2>Step 1: Track Your Income</h2>
          <p>Enter your income sources and amounts in the Income section.</p>

          <h2>Step 2: Record Expenses</h2>
          <p>Add your daily expenses and categorize them accordingly.</p>

          <h2>Step 3: View Reports</h2>
          <p>Check your financial summary in the Reports section.</p>
        </div>
      </div>
    </div>
  );
}

export default Instructions;
