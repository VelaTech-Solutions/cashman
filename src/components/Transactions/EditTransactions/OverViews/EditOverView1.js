import React from "react";

const EditOverView1 = ({ transactions = [] }) => {
  if (!Array.isArray(transactions)) transactions = [];

  // Helper functions
  const countBroken = transactions.filter(tx => !tx.date1 || !tx.date2 || (!tx.debit_amount && !tx.credit_amount)).length;
  const countMissingDescriptions = transactions.filter(tx => !tx.description || tx.description.trim() === "").length;
  const countCreditDebitAmounts = transactions.filter(tx => parseFloat(tx.debit_amount || 0) === 0 && parseFloat(tx.credit_amount || 0) === 0).length;
  const countZeroAmounts = transactions.filter(tx => parseFloat(tx.debit_amount || 0) === 0 && parseFloat(tx.credit_amount || 0) === 0 && parseFloat(tx.balance_amount || 0) === 0).length;
  const countDuplicates = new Set(transactions.map(tx => tx.description)).size - new Set(transactions.map(tx => tx.description)).size;
  const countMissingDates = transactions.filter(tx => !tx.date1 && !tx.date2).length;
  const countConflictingAmounts = transactions.filter(tx => tx.debit_amount && tx.credit_amount).length;
  const countOutliers = transactions.filter(tx => Math.abs(tx.debit_amount || tx.credit_amount || 0) > 100000).length;

  const isInvalidDate = (date) => {
    return !date || date === "None" || date === "null" || date === "(null)";
  };
  
  const invalidTransactions = transactions.filter(
    tx => isInvalidDate(tx.date1) && isInvalidDate(tx.date2)
  );
  

  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow w-full">
      <div className="flex flex-wrap gap-4 text-sm">
        {/* identify the transaction that has a date, if not date  its an invalid transaction */}
        <div>📊 Total (w/ date): <strong>{transactions.filter(tx => tx.date1 || tx.date2).length}</strong></div>
        <div>📊 Total: <strong>{transactions.filter(tx => tx.date1 || tx.date2).length}</strong></div>
        <div>❌ Invalid Transactions: <strong>{invalidTransactions.length}</strong></div>
        <div>📊 Total (Valid): <strong>{transactions.length - invalidTransactions.length}</strong></div>


        <div>🧩 Broken: <strong>{countBroken}</strong></div>
        <div>📝 Missing Desc: <strong>{countMissingDescriptions}</strong></div>
        <div>💵 Missing Credit & Debit: <strong>{countCreditDebitAmounts}</strong></div>
        <div>💸 Missing All Amounts: <strong>{countZeroAmounts}</strong></div>
        <div>🔁 Duplicates: <strong>{countDuplicates}</strong></div>
        <div>📅 Missing Dates: <strong>{countMissingDates}</strong></div>
        <div>⚖️ Conflicts: <strong>{countConflictingAmounts}</strong></div>
        <div>🚨 Outliers: <strong>{countOutliers}</strong></div>
      </div>
    </div>
  );
};

export default EditOverView1;
