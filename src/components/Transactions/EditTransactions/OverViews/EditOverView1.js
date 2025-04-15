import React from "react";

const EditOverView1 = ({ transactions = [] }) => {
  if (!Array.isArray(transactions)) transactions = [];

  // Helper functions
  const isInvalidDate = (date) => {
    return !date || date === "None" || date === "null";
  };
  
  const invalidTransactions = transactions.filter(
    tx => isInvalidDate(tx.date1) && isInvalidDate(tx.date2)
  );
  const countMissingDates = transactions.filter(
  tx => isInvalidDate(tx.date1) && isInvalidDate(tx.date2)
);

  const isInvalidDescription = (description) => {
    return !description || description.trim() === "";
  };
  const countMissingDescriptions = transactions.filter(
    tx => isInvalidDescription(tx.description) && isInvalidDescription(tx.description2)
  );
  const countCreditDebitAmounts = transactions.filter(tx => parseFloat(tx.debit_amount || 0) === 0 && parseFloat(tx.credit_amount || 0) === 0).length;
  const countMissingBalances = transactions.filter(tx => !tx.balance_amount || tx.balance_amount === "0").length;
  const countZeroAmounts = transactions.filter(tx => parseFloat(tx.debit_amount || 0) === 0 && parseFloat(tx.credit_amount || 0) === 0 && parseFloat(tx.balance_amount || 0) === 0).length;

  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow w-full">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>📊 Total (Valid): <strong>{transactions.length - invalidTransactions.length}</strong></div>
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
