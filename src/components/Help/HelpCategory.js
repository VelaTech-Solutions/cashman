// help/HelpCategory.js
// Instructions to help the user with Help Category

import React from "react";

// Component Imports
import { Sidebar } from 'components/Common';

// You can adjust the links array according to your actual routes
const links = [
  { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
];

const HelpCategory = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Help Budget" links={links} />

      {/* Main content area */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Category Help</h2>
        <p className="mb-4">
          This page provides guidance on how to create, manage, and maintain your Category effectively.
        </p>
        <ul className="list-disc list-inside">
          <li>
            <strong>Creating a Budget:</strong> Explanation goes here.
          </li>
          <li>
            <strong>Managing Category Categories:</strong> Explanation goes here.
          </li>
          <li>
            <strong>Tracking Category Progress:</strong> Explanation goes here.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HelpCategory;
