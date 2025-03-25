// help/HelpExtract.js
// Instructions to help the user with extracting transactions

import React from "react";
import Sidebar from "components/Sidebar";

// You can adjust the links array according to your actual routes
const links = [
  { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
];

const HelpExtract = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Help Extract" links={links} />

      {/* Main content area */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Extract Help</h2>
        <p className="mb-4">
          This page provides guidance on how to extract transactions
          automatically or manually.
        </p>
        <ul className="list-disc list-inside">
          <li>
            <strong>Automatic Extraction</strong>: Explanation goes here.
          </li>
          <li>
            <strong>Manual Extraction</strong>: Explanation goes here.
          </li>
        </ul>

        <p className="text-sm text-white p-6 ">
              <strong>Choose a method to process your file:</strong>
              <br />- Use <strong>PDF Parser</strong> for selectable text.
              <br />- Use <strong>OCR</strong> for scanned or image-based files.
              Not Working for now
            </p>

      </div>
    </div>
  );
};

export default HelpExtract;
