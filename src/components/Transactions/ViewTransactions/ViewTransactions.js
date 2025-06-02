import React, { useState } from "react";
// Mui Imports
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Typography, 
  Grid, 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ViewTransactionsTable from "./Tables/ViewTransactionsTable";
export default function ViewTransactions({ clientId }) {
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          View Transactions
        </Typography>
        {/* <Stack direction="row" spacing={2}>
        </Stack> */}
        <ViewTransactionsTable clientId={clientId}/>
      </Stack>
    </Box>
  );
};
