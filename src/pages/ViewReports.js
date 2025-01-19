import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import "../styles/tailwind.css";

import LoadClientData from "../components/LoadClientData";
import generateReport from "../components/generateReport";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
  { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
];

const ViewReports = () => {
  const { id } = useParams(); // Client ID or folder number
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  const storage = getStorage();

  // Load client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientData = await LoadClientData(id);
        console.log("Fetched client data:", clientData);
        const fetchedTransactions = clientData.transactions || [];
        setClientData(clientData);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error loading client data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  // Fetch generated reports
  const fetchGeneratedReports = async () => {
    try {
      const reportsRef = ref(storage, `reports/${id}`);
      const reportsList = await listAll(reportsRef);
      const reports = await Promise.all(
        reportsList.items.map(async (item) => ({
          name: item.name,
          url: await getDownloadURL(item),
        }))
      );
      setReports(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    fetchGeneratedReports();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await generateReport(id);
      if (result.success) {
        alert("Report generated successfully!");
        console.log("Report Path:", result.reportPath);
        fetchGeneratedReports();
      } else {
        alert(`Failed to generate report: ${result.message}`);
      }
    } catch (error) {
      console.error("Error during report generation:", error);
      alert("An unexpected error occurred while generating the report.");
    } finally {
      setLoading(false);
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
            <p className="text-lg text-gray-400">
              Generate and download detailed reports for your transactions.
            </p>

            {/* Transaction Preview */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Transaction Summary</h3>
              {transactions.length > 0 ? (
                <div className="overflow-y-auto max-h-96">
                  <table className="table-auto w-full text-sm">
                    <thead className="sticky top-0 bg-gray-800">
                      <tr className="text-left text-gray-400">
                        <th className="p-2">Date</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Subcategory</th>
                        <th className="p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn, index) => (
                        <tr key={index} className="border-b border-gray-600">
                          <td className="p-2">{txn.date1}</td>
                          <td className="p-2">{txn.description || "-"}</td>
                          <td className="p-2">{txn.category}</td>
                          <td className="p-2">{txn.subcategory}</td>
                          <td className="p-2">{txn.balance_amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">No transactions found.</p>
              )}
            </div>

            {/* Generate Report Button */}
            <button
              onClick={handleGenerateReport}
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded text-white font-semibold shadow-md"
            >
              Generate Report
            </button>

            {/* Downloadable Reports */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-md mt-6">
              <h3 className="text-lg font-semibold mb-2">Generated Reports</h3>
              {reports.length > 0 ? (
                <ul className="list-disc ml-5">
                  {reports.map((report, index) => (
                    <li key={index}>
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {report.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No reports generated yet.</p>
              )}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewReports;
