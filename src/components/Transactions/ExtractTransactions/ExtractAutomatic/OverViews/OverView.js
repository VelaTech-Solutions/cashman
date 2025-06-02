import React from "react";
import { Box, Typography, Paper, Stack } from "@mui/material";

export default function OverView({ transactions, bankName }) {
  if (!Array.isArray(transactions)) transactions = [];

  const totalDebit = transactions.reduce(
    (sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0),
    0
  ).toFixed(2);

  const totalCredit = transactions.reduce(
    (sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0),
    0
  ).toFixed(2);

  const verifiedTransactions = transactions.filter(
    (txn) => txn.verified === "✓"
  ).length;

  const unverifiedTransactions = transactions.filter(
    (txn) => txn.verified === "✗"
  ).length;

  return (
    <Paper sx={{ p: 2, width: "100%" }}>
      <Stack direction="row" flexWrap="wrap" spacing={3}>
        <Typography variant="body2">Total Debits: <strong>{totalDebit}</strong></Typography>
        <Typography variant="body2">Total Credits: <strong>{totalCredit}</strong></Typography>
        <Typography variant="body2">Total Verified: <strong>{verifiedTransactions}</strong></Typography>
        <Typography variant="body2">Total Unverified: <strong>{unverifiedTransactions}</strong></Typography>
        <Typography variant="body2">Bank Name: <strong>{bankName}</strong></Typography>
      </Stack>
    </Paper>
  );
}
