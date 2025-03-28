import React from "react";
import { motion } from "framer-motion";

const OverviewProfile = ({ clientData }) => {
  if (!clientData) return null;

  const dataPoints = [
    { label: "ID", value: clientData.idNumber || "N/A", color: "bg-blue-200 text-blue-800" },
    { label: "Bank", value: clientData.bankName || "N/A", color: "bg-purple-200 text-purple-800" },
    { label: "Captured By", value: clientData.userEmail || "No notes available", color: "bg-green-200 text-green-800" },
    { label: "Date Captured", value: clientData.dateCaptured || "Unknown", color: "bg-yellow-200 text-yellow-800" },
    { label: "Last Updated", value: clientData.lastUpdated || "Never", color: "bg-orange-200 text-orange-800" },
    { label: "Total Transactions", value: clientData.number_of_transactions || 0, color: "bg-red-200 text-red-800" },
  ];

  return (
    <section className="p-2 flex justify-center w-full">
      <motion.div
        className="flex w-full max-w-screen-lg justify-between bg-white shadow-md rounded-md p-2 overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {dataPoints.map(({ label, value, color }, index) => (
          <motion.div
            key={index}
            className={`flex flex-col items-center px-4 py-2 rounded-md shadow-sm whitespace-nowrap text-sm ${color}`}
            animate={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold">{value}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default OverviewProfile;
