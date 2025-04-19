import React from "react";

const EditOverView1 = ({ transactions = [] }) => {
  if (!Array.isArray(transactions)) transactions = [];

  // Remove null/undefined entries
  const validTx = transactions.filter(tx => tx);

  // Helper functions
  const isInvalidDate = (date) => {
    return !date || date === "None" || date === "null";
  };

  const isInvalidDescription = (description) => {
    return !description || description.trim() === "";
  };

  // Metrics
  const invalidTransactions = validTx.filter(
    tx => isInvalidDate(tx.date1) && isInvalidDate(tx.date2)
  );

  const countMissingDates = validTx.filter(
    tx => isInvalidDate(tx.date1) && isInvalidDate(tx.date2)
  );

  const countMissingDescriptions = validTx.filter(
    tx => isInvalidDescription(tx.description) && isInvalidDescription(tx.description2)
  );

  const countCreditDebitAmounts = validTx.filter(
    tx => parseFloat(tx.debit_amount || 0) === 0 && parseFloat(tx.credit_amount || 0) === 0
  ).length;

  const countMissingBalances = validTx.filter(
    tx => !tx.balance_amount || tx.balance_amount === "0"
  ).length;

  const countZeroAmounts = validTx.filter(
    tx =>
      parseFloat(tx.debit_amount || 0) === 0 &&
      parseFloat(tx.credit_amount || 0) === 0 &&
      parseFloat(tx.balance_amount || 0) === 0
  ).length;

  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow w-full">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>📊 Total (Valid): <strong>{validTx.length - invalidTransactions.length}</strong></div>
        <div>❌ Invalid Transactions: <strong>{invalidTransactions.length}</strong></div>
        <div>📅 Missing Dates: <strong>{countMissingDates.length}</strong></div>
        <div>📝 Missing Desc: <strong>{countMissingDescriptions.length}</strong></div>
        <div>💵 Missing Credit & Debit: <strong>{countCreditDebitAmounts}</strong></div>
        <div>💰 Missing Balances: <strong>{countMissingBalances}</strong></div>
        <div>💸 Missing All Amounts: <strong>{countZeroAmounts}</strong></div>
      </div>
    </div>
  );
};

export default EditOverView1;
