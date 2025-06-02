// src/components/Budget/BudgetSummary.js
import React, { useEffect, useState, useContext } from "react";

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
import { LoadClientData } from "components/Common";

// Component Imports
import { generateBudgetReport } from "./Utils/xlsxModule";

import SummaryView from "./Views/SummaryView";
export default function BudgetSummary({clientId}) {
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <SummaryView clientId={clientId} />
        <Button
          variant="contained"
          color="success"
          onClick={() => generateBudgetReport({ clientId })}
        >
          Download Report
        </Button>
      </Stack>
    </Box>
  );
};



