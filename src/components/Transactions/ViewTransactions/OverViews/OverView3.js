import React from "react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const OverView3 = ({ transactions }) => {
  if (!transactions || transactions.length === 0) return null;

  const totalTransactions = transactions.length;
  const categorizedTransactions = transactions.filter(txn => txn.category).length;
  const uncategorizedTransactions = totalTransactions - categorizedTransactions;
  const verifiedTransactions = transactions.filter(txn => txn.verified === "✔️").length;
  const totalDebit = transactions.reduce((sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0), 0);
  const totalCredit = transactions.reduce((sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0), 0);
  const totalFees = transactions.reduce((sum, txn) => sum + (txn.fees_amount ? parseFloat(txn.fees_amount) : 0), 0);

  // Calculate percentages
  const categorizedPercentage = (categorizedTransactions / totalTransactions) * 100;
  const uncategorizedPercentage = (uncategorizedTransactions / totalTransactions) * 100;

  // Pie chart data
  const pieData = {
    labels: ["Debit Amount", "Credit Amount"],
    datasets: [
      {
        data: [totalDebit, totalCredit],
        backgroundColor: ["#E74C3C", "#2ECC71"],
        hoverBackgroundColor: ["#C0392B", "#27AE60"],
      },
    ],
  };

  // Find the most frequent category
  const categoryCounts = transactions.reduce((acc, txn) => {
    if (txn.category) {
      acc[txn.category] = (acc[txn.category] || 0) + 1;
    }
    return acc;
  }, {});
  const mostFrequentCategory = Object.keys(categoryCounts).reduce((a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b), "N/A");

  return (
    <section className="p-4 w-full flex flex-col items-center space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
        <motion.div
          className="p-4 bg-blue-500 text-white rounded-lg shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-sm">Total Transactions</h3>
          <p className="text-2xl font-bold">{totalTransactions}</p>
        </motion.div>
        <motion.div
          className="p-4 bg-green-500 text-white rounded-lg shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-sm">Verified Transactions</h3>
          <p className="text-2xl font-bold">{verifiedTransactions}</p>
        </motion.div>
        <motion.div
          className="p-4 bg-red-500 text-white rounded-lg shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-sm">Total Fees</h3>
          <p className="text-2xl font-bold">R {totalFees.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Categorized vs. Uncategorized Progress Bars */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-around items-center space-y-4 md:space-y-0">
        <div className="w-40">
          <CircularProgressbar
            value={categorizedPercentage}
            text={`${categorizedPercentage.toFixed(1)}%`}
            styles={buildStyles({ textColor: "#fff", pathColor: "#2ECC71", trailColor: "#333" })}
          />
          <p className="text-center mt-2 text-white">Categorized</p>
        </div>
        <div className="w-40">
          <CircularProgressbar
            value={uncategorizedPercentage}
            text={`${uncategorizedPercentage.toFixed(1)}%`}
            styles={buildStyles({ textColor: "#fff", pathColor: "#E74C3C", trailColor: "#333" })}
          />
          <p className="text-center mt-2 text-white">Uncategorized</p>
        </div>
      </div>

      {/* Debit vs. Credit Pie Chart */}
      <div className="w-full max-w-md p-4 bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-center text-white text-lg mb-2">Debit vs. Credit</h3>
        <Pie data={pieData} />
      </div>

      {/* Most Frequent Category */}
      <motion.div
        className="p-4 bg-indigo-500 text-white rounded-lg shadow-md w-full max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h3 className="text-sm">Most Frequent Category</h3>
        <p className="text-2xl font-bold">{mostFrequentCategory || "N/A"}</p>
      </motion.div>
    </section>
  );
};

export default OverView3;
