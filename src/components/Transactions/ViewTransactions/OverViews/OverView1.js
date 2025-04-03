import React from "react";

const OverView1 = ({ transactions }) => {
  // if (!transactions || transactions.length === 0) return null;


  const totalTransactions = transactions.length;
  const categorizedTransactions = transactions.filter(txn => txn.category).length;
  const uncategorizedTransactions = totalTransactions - categorizedTransactions;
  const verifiedTransactions = transactions.filter(txn => txn.verified === "✔️").length;
  const unverifiedTransactions = totalTransactions - verifiedTransactions;
  const totalDebit = transactions.reduce((sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0), 0);
  const totalCredit = transactions.reduce((sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0), 0);
  const totalFees = transactions.reduce((sum, txn) => sum + (txn.fees_amount ? parseFloat(txn.fees_amount) : 0), 0);

  const stats = [
    { label: "Total Transactions", value: totalTransactions, color: "bg-gradient-to-r from-blue-500 to-blue-700" },
    { label: "Categorized", value: categorizedTransactions, color: "bg-gradient-to-r from-green-500 to-green-700" },
    { label: "Uncategorized", value: uncategorizedTransactions, color: "bg-gradient-to-r from-red-500 to-red-700" },
    { label: "Verified", value: verifiedTransactions, color: "bg-gradient-to-r from-yellow-400 to-yellow-600" },
    { label: "Unverified", value: unverifiedTransactions, color: "bg-gradient-to-r from-orange-500 to-orange-700" },
    { label: "Total Debit", value: `R ${totalDebit.toFixed(2)}`, color: "bg-gradient-to-r from-purple-500 to-purple-700" },
    { label: "Total Credit", value: `R ${totalCredit.toFixed(2)}`, color: "bg-gradient-to-r from-indigo-500 to-indigo-700" },
    { label: "Total Fees", value: `R ${totalFees.toFixed(2)}`, color: "bg-gradient-to-r from-gray-500 to-gray-700" },
  ];

  return (
    <section className="p-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-5 text-white rounded-2xl shadow-md ${stat.color} hover:shadow-xl transition duration-300`}
        >
          <p className="text-sm font-medium opacity-90">{stat.label}</p>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}
    </section>
  );
};

export default OverView1;
