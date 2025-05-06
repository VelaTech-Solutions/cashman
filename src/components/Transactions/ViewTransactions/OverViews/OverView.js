import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";

const OverView = ({ transactions }) => {
  if (!transactions || transactions.length === 0) return null;

  const totalTransactions = transactions.length;
  const categorizedTransactions = transactions.filter(txn => txn.category).length;
  const uncategorizedTransactions = totalTransactions - categorizedTransactions;
  const verifiedTransactions = transactions.filter(txn => txn.verified === "✔️").length;
  const unverifiedTransactions = totalTransactions - verifiedTransactions;
  const totalDebit = transactions.reduce((sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0), 0);
  const totalCredit = transactions.reduce((sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0), 0);
  const totalFees = transactions.reduce((sum, txn) => sum + (txn.fees_amount ? parseFloat(txn.fees_amount) : 0), 0);

  const metrics = [
    { label: "Total", value: totalTransactions },
    { label: "Categorized", value: categorizedTransactions },
    { label: "Uncategorized", value: uncategorizedTransactions },
    { label: "Verified", value: verifiedTransactions },
    { label: "Unverified", value: unverifiedTransactions },
    { label: "Debit", value: `R ${totalDebit.toFixed(2)}` },
    { label: "Credit", value: `R ${totalCredit.toFixed(2)}` },
    { label: "Fees", value: `R ${totalFees.toFixed(2)}` },
  ];

  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Grid container spacing={2} justifyContent="center">
        {metrics.map((item, index) => (
          <Grid item key={index}>
            <Paper
              elevation={3}
              sx={{
                bgcolor: "#1e1e1e",
                color: "#fff",
                px: 2,
                py: 1,
                minWidth: 100,
                textAlign: "center",
              }}
            >
              <Typography variant="caption" sx={{ color: "#90caf9" }}>
                {item.label}
              </Typography>
              <Typography variant="subtitle2">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OverView;
