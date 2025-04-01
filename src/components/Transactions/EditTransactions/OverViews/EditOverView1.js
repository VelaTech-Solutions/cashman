import React from "react";

const EditOverView1 = ({ transactions = [] }) => {
  if (!Array.isArray(transactions)) transactions = [];

  // Helper functions
  const countBroken = transactions.filter(tx => !tx.date1 || !tx.date2 || (!tx.debit_amount && !tx.credit_amount)).length;
  const countMissingDescriptions = transactions.filter(tx => !tx.description || tx.description.trim() === "").length;
  const countZeroAmounts = transactions.filter(tx => parseFloat(tx.debit_amount || 0) === 0 && parseFloat(tx.credit_amount || 0) === 0).length;
  const countDuplicates = new Set(transactions.map(tx => tx.description)).size - new Set(transactions.map(tx => tx.description)).size;
  const countMissingDates = transactions.filter(tx => !tx.date1 && !tx.date2).length;
  const countConflictingAmounts = transactions.filter(tx => tx.debit_amount && tx.credit_amount).length;
  const countOutliers = transactions.filter(tx => Math.abs(tx.debit_amount || tx.credit_amount || 0) > 100000).length;

  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow w-full">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>📊 Total: <strong>{transactions.length}</strong></div>
        <div>🧩 Broken: <strong>{countBroken}</strong></div>
        <div>📝 Missing Desc: <strong>{countMissingDescriptions}</strong></div>
        <div>💸 Zero Amounts: <strong>{countZeroAmounts}</strong></div>
        <div>🔁 Duplicates: <strong>{countDuplicates}</strong></div>
        <div>📅 Missing Dates: <strong>{countMissingDates}</strong></div>
        <div>⚖️ Conflicts: <strong>{countConflictingAmounts}</strong></div>
        <div>🚨 Outliers: <strong>{countOutliers}</strong></div>
      </div>
    </div>
  );
};

export default EditOverView1;
