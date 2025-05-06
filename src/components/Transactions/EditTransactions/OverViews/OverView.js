import React from "react";
import { Box, Paper, Typography } from "@mui/material";

const EditOverView1 = ({ transactions = [] }) => {
  if (!Array.isArray(transactions)) transactions = [];

  const validTx = transactions.filter(tx => tx);

  const isInvalidDate = (date) => !date || date === "None" || date === "null";
  const isInvalidDescription = (description) => !description || description.trim() === "";

  const invalidTransactions = validTx.filter(
    tx => isInvalidDate(tx.date1) && isInvalidDate(tx.date2)
  );
  const countMissingDates = invalidTransactions;
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
    <Paper sx={{ p: 2, bgcolor: "#1e1e1e", color: "white", mb: 2 }}>
      <Box display="flex" flexWrap="wrap" gap={2}>
        <Typography variant="body2">📊 Total (Valid): <strong>{validTx.length - invalidTransactions.length}</strong></Typography>
        <Typography variant="body2">❌ Invalid Transactions: <strong>{invalidTransactions.length}</strong></Typography>
        <Typography variant="body2">📅 Missing Dates: <strong>{countMissingDates.length}</strong></Typography>
        <Typography variant="body2">📝 Missing Desc: <strong>{countMissingDescriptions.length}</strong></Typography>
        <Typography variant="body2">💵 Missing Credit & Debit: <strong>{countCreditDebitAmounts}</strong></Typography>
        <Typography variant="body2">💰 Missing Balances: <strong>{countMissingBalances}</strong></Typography>
        <Typography variant="body2">💸 Missing All Amounts: <strong>{countZeroAmounts}</strong></Typography>
      </Box>
    </Paper>
  );
};

export default EditOverView1;
