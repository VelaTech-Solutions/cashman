

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
import NormalCategorizer from "./NormalCategorizer/NormalCategorizePage";
export default function CategorizeTransactions({ clientId }) {
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Categorize Transactions
        </Typography>
        {/* <Stack direction="row" spacing={2}>
        </Stack> */}
        <NormalCategorizer clientId={clientId}/>
      </Stack>
    </Box>
  );
};
