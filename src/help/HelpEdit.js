// help/ViewBudget.js
// Instructions to help the user with ViewBudget

import React from "react";
import Sidebar from "../components/Sidebar";

// You can adjust the links array according to your actual routes
const links = [
  { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
];

const HelpEdit = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Help View" links={links} />

      {/* Main content area */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">View Help</h2>
        <p className="mb-4">
          This page provides guidance on how to create, manage, and maintain your budgets effectively.
        </p>
        <ul className="list-disc list-inside">
          <li>
            <strong>Creating a View:</strong> Explanation goes here.
          </li>
          <li>
            <strong>Managing Views:</strong> Explanation goes here.
          </li>
          <li>
            <strong>Tracking Budget Progress:</strong> Explanation goes here.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HelpEdit;
