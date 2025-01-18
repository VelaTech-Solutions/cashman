// src/pages/ViewReports.js
import React from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import "../styles/tailwind.css";

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
  
];

const ViewReports = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar title="View Reports" links={links} />

      {/* Main content */}
      <div className="flex-1 p-8">
        <motion.div
          className="space-y-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
              View Reports
            </h2>
            {/* Add your report rendering logic here */}
            <p className="text-lg text-gray-400">
              This is the placeholder for report rendering functionality.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewReports;
