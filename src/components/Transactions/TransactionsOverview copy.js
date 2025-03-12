import React from "react";
import { motion } from "framer-motion";

const TransactionsOverview = ({ transactions }) => {
  if (!transactions || transactions.length === 0) return null;

  // Total transactions
  const totalTransactions = transactions.length;

  // Count categorized vs. uncategorized transactions
  const categorizedTransactions = transactions.filter(txn => txn.category && txn.category.trim() !== "").length;
  const uncategorizedTransactions = totalTransactions - categorizedTransactions;

  // Count verified vs. unverified transactions
  const verifiedTransactions = transactions.filter(txn => txn.verified === "✔️").length;
  const unverifiedTransactions = totalTransactions - verifiedTransactions;

  // Total amounts (debit, credit, fees)
  const totalDebit = transactions.reduce((sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0), 0);
  const totalCredit = transactions.reduce((sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0), 0);
  const totalFees = transactions.reduce((sum, txn) => sum + (txn.fees_amount ? parseFloat(txn.fees_amount) : 0), 0);

  // Transactions with missing amounts
  const transactionsWithNoAmount = transactions.filter(txn => !txn.debit_amount && !txn.credit_amount).length;

  // Transactions with missing descriptions
  const transactionsWithNoDescription = transactions.filter(txn => !txn.description || txn.description.trim() === "").length;

  // Transactions missing dates
  const transactionsWithNoDate = transactions.filter(txn => !txn.date1 && !txn.date2).length;

  // Data points for display
  const dataPoints = [
    { label: "Total Transactions", value: totalTransactions, color: "bg-blue-200 text-blue-800" },
    { label: "Categorized Transactions", value: categorizedTransactions, color: "bg-green-200 text-green-800" },
    { label: "Uncategorized Transactions", value: uncategorizedTransactions, color: "bg-red-200 text-red-800" },
    { label: "Verified Transactions", value: verifiedTransactions, color: "bg-green-300 text-green-900" },
    { label: "Unverified Transactions", value: unverifiedTransactions, color: "bg-yellow-200 text-yellow-800" },
    { label: "Total Debit Amount", value: `R ${totalDebit.toFixed(2)}`, color: "bg-purple-200 text-purple-800" },
    { label: "Total Credit Amount", value: `R ${totalCredit.toFixed(2)}`, color: "bg-indigo-200 text-indigo-800" },
    { label: "Total Fees", value: `R ${totalFees.toFixed(2)}`, color: "bg-orange-200 text-orange-800" },
    { label: "Transactions With No Amount", value: transactionsWithNoAmount, color: "bg-red-300 text-red-900" },
    { label: "Transactions With No Description", value: transactionsWithNoDescription, color: "bg-gray-300 text-gray-900" },
    { label: "Transactions With No Date", value: transactionsWithNoDate, color: "bg-yellow-300 text-yellow-900" },
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

export default TransactionsOverview;
