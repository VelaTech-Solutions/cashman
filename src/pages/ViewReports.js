import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import "../styles/tailwind.css";

import LoadClientData from "../components/LoadClientData";
import generateReport from "../components/generateReport";

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
  { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
];

const ViewReports = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const data = await LoadClientData(id);
        console.log("Fetched client data:", data);
        setClientData(data);
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error("Error fetching client data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  const handleGenerateReport = async () => {
    if (!clientData) {
      alert("Client data not loaded. Please try again.");
      return;
    }

    try {
      const result = await generateReport(id);
      if (result.success) {
        alert("Report generated successfully!");
        console.log("Report Path:", result.reportPath);
      } else {
        alert(`Failed to generate report: ${result.message}`);
      }
    } catch (error) {
      console.error("Error during report generation:", error);
      alert("An unexpected error occurred while generating the report.");
    }
  };

  if (loading) {
    return <div className="text-center text-white">Loading client data...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="View Reports" links={links} />

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
            <button
              onClick={handleGenerateReport}
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded text-white font-semibold shadow-md"
            >
              Generate Report
            </button>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewReports;
