import React from "react";

const OverView2 = ({ transactions }) => {
  if (!transactions || transactions.length === 0) return null;

  const totalTransactions = transactions.length;
  const categorizedTransactions = transactions.filter(txn => txn.category).length;
  const uncategorizedTransactions = totalTransactions - categorizedTransactions;
  const verifiedTransactions = transactions.filter(txn => txn.verified === "✔️").length;
  const unverifiedTransactions = totalTransactions - verifiedTransactions;
  const totalDebit = transactions.reduce((sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0), 0);
  const totalCredit = transactions.reduce((sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0), 0);
  const totalFees = transactions.reduce((sum, txn) => sum + (txn.fees_amount ? parseFloat(txn.fees_amount) : 0), 0);

  return (
    <section className="p-2 w-full flex justify-center">
      <table className="w-full max-w-screen-lg border border-gray-700 text-white">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 border border-gray-700 text-left">Metric</th>
            <th className="p-2 border border-gray-700 text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border border-gray-700 hover:bg-gray-800"><td className="p-2">Total Transactions</td><td className="p-2 text-right">{totalTransactions}</td></tr>
          <tr className="border border-gray-700 hover:bg-gray-800"><td className="p-2">Categorized Transactions</td><td className="p-2 text-right">{categorizedTransactions}</td></tr>
          <tr className="border border-gray-700 hover:bg-gray-800"><td className="p-2">Uncategorized Transactions</td><td className="p-2 text-right">{uncategorizedTransactions}</td></tr>
          <tr className="border border-gray-700 hover:bg-gray-800"><td className="p-2">Verified Transactions</td><td className="p-2 text-right">{verifiedTransactions}</td></tr>
          <tr className="border border-gray-700 hover:bg-gray-800"><td className="p-2">Unverified Transactions</td><td className="p-2 text-right">{unverifiedTransactions}</td></tr>
          <tr className="border border-gray-700 hover:bg-gray-800"><td className="p-2">Total Debit</td><td className="p-2 text-right">R {totalDebit.toFixed(2)}</td></tr>
          <tr className="border border-gray-700 hover:bg-gray-800"><td className="p-2">Total Credit</td><td className="p-2 text-right">R {totalCredit.toFixed(2)}</td></tr>
          <tr className="border border-gray-700 hover:bg-gray-800"><td className="p-2">Total Fees</td><td className="p-2 text-right">R {totalFees.toFixed(2)}</td></tr>
        </tbody>
      </table>
    </section>
  );
};

export default OverView2;
