import React from "react";

const TransactionsOverview1 = ({ transactions }) => {
  if (!transactions || transactions.length === 0) return <p>Please Extract Transactions.</p>;

  const totalTransactions = transactions.length;
  const categorizedTransactions = transactions.filter(txn => txn.category).length;
  const uncategorizedTransactions = totalTransactions - categorizedTransactions;
  const verifiedTransactions = transactions.filter(txn => txn.verified === "✔️").length;
  const unverifiedTransactions = totalTransactions - verifiedTransactions;
  const totalDebit = transactions.reduce((sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0), 0);
  const totalCredit = transactions.reduce((sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0), 0);
  const totalFees = transactions.reduce((sum, txn) => sum + (txn.fees_amount ? parseFloat(txn.fees_amount) : 0), 0);

  const stats = [
    { label: "Total Transactions", value: totalTransactions, color: "bg-blue-500" },
    { label: "Categorized", value: categorizedTransactions, color: "bg-green-500" },
    { label: "Uncategorized", value: uncategorizedTransactions, color: "bg-red-500" },
    { label: "Verified", value: verifiedTransactions, color: "bg-yellow-500" },
    { label: "Unverified", value: unverifiedTransactions, color: "bg-orange-500" },
    { label: "Total Debit", value: `R ${totalDebit.toFixed(2)}`, color: "bg-purple-500" },
    { label: "Total Credit", value: `R ${totalCredit.toFixed(2)}`, color: "bg-indigo-500" },
    { label: "Total Fees", value: `R ${totalFees.toFixed(2)}`, color: "bg-gray-500" },
  ];

  return (
    <section className="p-2 w-full flex flex-wrap justify-center gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`w-48 p-4 text-white rounded-lg shadow-md ${stat.color} transition-transform transform hover:scale-105`}
        >
          <p className="text-sm font-semibold">{stat.label}</p>
          <p className="text-lg font-bold">{stat.value}</p>
        </div>
      ))}
    </section>
  );
};

export default TransactionsOverview1;
