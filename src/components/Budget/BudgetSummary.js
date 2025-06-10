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
  CircularProgress,
} from "@mui/material";
import { LoadClientData } from "components/Common";

// Component Imports
import { generateBudgetReport } from "./Utils/xlsxModule";

import SummaryView from "./Views/SummaryView";
export default function BudgetSummary({clientId}) {
  const [loading, setLoading] = useState(false);
  const handleDownload = async () => {
    setLoading(true);
    try {
      await generateBudgetReport({ clientId });
    } catch (err) {
      console.error("Error generating report:", err);
    }
    setLoading(false);
  };
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <SummaryView clientId={clientId} />
        {/* adding loading here too please */}
        <Button
          variant="contained"
          color="success"
          onClick={handleDownload}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Generating..." : "Download Report"}
        </Button>
      </Stack>
    </Box>
  );
};



