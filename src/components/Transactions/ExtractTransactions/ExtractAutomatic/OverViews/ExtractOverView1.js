// src/components/Transactions/ExtractTransactions/ExtractAutomatic/OverViews/ExtractOverView1.js
import React from "react";

const ExtractOverView1 = ({ transactions, bankName }) => {

  if (!Array.isArray(transactions)) transactions = [];

  // Helper functions
  const totalDebit = transactions?.reduce((sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0), 0  ).toFixed(2);
  const totalCredit = transactions?.reduce((sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0), 0 ).toFixed(2);
  const verifiedTransactions = transactions?.filter(txn => txn.verified === "✓").length || 0;
  const unverifiedTransactions = transactions?.filter(txn => txn.verified === "✗").length || 0;
  

  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow w-full">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>Total Debits: <strong>{totalDebit}</strong></div>
        <div>Total Credits: <strong>{totalCredit}</strong></div>
        <div>Total Verified: <strong>{verifiedTransactions}</strong></div>
        <div>Total Unverified: <strong>{unverifiedTransactions}</strong></div>
        <div>Bank Name: <strong>{bankName}</strong></div>
      </div>
    </div>
  );
};

export default ExtractOverView1;
