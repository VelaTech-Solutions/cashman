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
  const [showUncategorized, setShowUncategorized] = useState(true);
  console.log("Transactions:", transactions);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const data = await LoadClientData(id);
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

      <section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2
          onClick={() => setShowUncategorized(prev => !prev)}
          className="text-xl font-semibold text-red-400 mb-4 cursor-pointer flex justify-between items-center"
        >
          Uncategorized Transactions
          <span className="text-gray-500">
            {showUncategorized ? "▲" : "▼"}
          </span>
        </h2>
        {showUncategorized && (
          <div className="overflow-y-auto max-h-60">
            {transactions.filter(txn => !txn.category || !txn.subcategory).length > 0 ? (
              <table className="table-auto w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-sm">Date1</th>
                    <th className="px-4 py-2 text-sm">Description</th>
                    <th className="px-4 py-2 text-sm">Fee Amount</th>
                    <th className="px-4 py-2 text-sm">Credit Amount</th>
                    <th className="px-4 py-2 text-sm">Debit Amount</th>
                    <th className="px-4 py-2 text-sm">Balance Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(txn => !txn.category || !txn.subcategory)
                    .map((transaction, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-gray-700"
                      >
                        <td className="px-4 py-2 text-sm">{transaction.date1}</td>
                        <td className="px-4 py-2 text-sm">
                          {transaction.description || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {transaction.fee_amount
                            ? `R ${transaction.fee_amount.toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {transaction.credit_amount
                            ? `R ${transaction.credit_amount.toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {transaction.debit_amount
                            ? `R ${transaction.debit_amount.toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {transaction.balance_amount
                            ? `R ${transaction.balance_amount.toFixed(2)}`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-lg text-gray-500">
                No uncategorized transactions found.
              </p>
            )}
          </div>
        )}
      </section>



      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b border-gray-600 pb-2">
          Report Preview
        </h2>
        {transactions.filter(txn => txn.category && txn.subcategory).length > 0 ? (
          <div className="overflow-x-auto bg-gray-800 rounded-md shadow-lg">
            <table className="min-w-full table-auto text-left text-white">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Subcategory</th>
                  <th className="px-4 py-2">Month</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter(txn => txn.category && txn.subcategory)
                  .map((txn, index) => {
                    const transactionMonth = new Date(txn.date1).getMonth() + 1;
                    return (
                      <tr key={index} className="hover:bg-gray-700">
                      <td className="px-4 py-2">{txn.category}</td>
                      <td className="px-4 py-2">{txn.subcategory}</td>
                      <td className="px-4 py-2">{transactionMonth}</td>
                      <td className="px-4 py-2">
                        {txn.debit_amount 
                        ? `R ${parseFloat(txn.debit_amount).toFixed(2)}`
                        : txn.credit_amount 
                          ? `R ${parseFloat(txn.credit_amount).toFixed(2)}`
                          : 'R 0.00'
                        }
                      </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">
            No transactions categorized yet.
          </p>
        )}
      </section>

      {/* display Credit amounts only */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b border-gray-600 pb-2">
          Credit Transactions
        </h2>
        {transactions.filter(txn => txn.credit_amount).length > 0 ? (
          <div className="overflow-x-auto bg-gray-800 rounded-md shadow-lg">
            <table className="min-w-full table-auto text-left text-white">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Credit Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter(txn => txn.credit_amount)
                  .map((txn, index) => (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="px-4 py-2">{txn.date1}</td>
                      <td className="px-4 py-2">{txn.description}</td>
                      <td className="px-4 py-2">R {txn.credit_amount.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">
            No credit transactions found.
          </p>
        )}
      </section>







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
